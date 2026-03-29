// TASK-022 FR-018..FR-020: Extension-side GQL with integrity token
// For operations that require Twitch's Kasada integrity check.
// These calls MUST be made from browser context (Extension), not server-side.

const GQL_URL = 'https://gql.twitch.tv/gql';
const INTEGRITY_URL = 'https://gql.twitch.tv/integrity';
const CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// === Integrity Token Management (FR-018) ===

let cachedToken: string | null = null;
let tokenExpiration = 0;

function generateDeviceId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function getIntegrityToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  try {
    const response = await fetch(INTEGRITY_URL, {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        'Content-Type': 'text/plain;charset=UTF-8',
        'X-Device-Id': generateDeviceId(),
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.token) return null;

    cachedToken = data.token;
    // Buffer: expire 60s before actual expiration
    tokenExpiration = (data.expiration || Date.now() + 1800000) - 60000;
    return cachedToken;
  } catch {
    return null;
  }
}

function invalidateToken(): void {
  cachedToken = null;
  tokenExpiration = 0;
}

// === GQL with Integrity (FR-019) ===

interface GqlResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string; path?: string[] }>;
  extensions?: { challenge?: { type: string } };
}

export async function gqlWithIntegrity(
  query: string,
  variables: Record<string, unknown> = {},
  retry = true,
): Promise<GqlResponse | null> {
  const token = await getIntegrityToken();
  if (!token) return null;

  try {
    const response = await fetch(GQL_URL, {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        'Client-Integrity': token,
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) return null;

    const data: GqlResponse = await response.json();

    // Check for integrity challenge — refresh token and retry once
    if (data.extensions?.challenge?.type === 'integrity' && retry) {
      invalidateToken();
      return gqlWithIntegrity(query, variables, false);
    }

    return data;
  } catch {
    return null;
  }
}

// === Integrity-Protected Operations (FR-020) ===

const QUERIES = {
  chattersCount: `
    query GetChattersCount($login: String!) {
      channel(name: $login) { chatters { count } }
    }
  `,
  communityTab: `
    query CommunityTab($login: String!) {
      channel(name: $login) {
        chatters {
          broadcasters { login }
          moderators { login }
          vips { login }
          viewers { login }
          count
        }
      }
    }
  `,
  socialMedias: `
    query ChannelSocialMedias($login: String!) {
      user(login: $login) {
        channel { socialMedias { name title url } }
      }
    }
  `,
  userFollowsPaginated: `
    query UserFollowsPaginated($login: String!, $first: Int!, $after: Cursor) {
      user(login: $login) {
        follows(first: $first, after: $after) {
          totalCount
          edges { cursor node { login } }
          pageInfo { hasNextPage }
        }
      }
    }
  `,
};

export async function getChattersCount(channelLogin: string): Promise<number | null> {
  const result = await gqlWithIntegrity(QUERIES.chattersCount, { login: channelLogin });
  return (result?.data?.channel as Record<string, unknown> | undefined)
    ? ((result?.data?.channel as Record<string, Record<string, unknown>>)?.chatters?.count as number) ?? null
    : null;
}

export interface CommunityTabResult {
  broadcasters: string[];
  moderators: string[];
  vips: string[];
  viewers: string[];
  count: number;
}

export async function getCommunityTab(channelLogin: string): Promise<CommunityTabResult | null> {
  const result = await gqlWithIntegrity(QUERIES.communityTab, { login: channelLogin });
  const chatters = (result?.data?.channel as Record<string, Record<string, unknown>> | undefined)?.chatters;
  if (!chatters) return null;

  const toList = (arr: unknown): string[] =>
    Array.isArray(arr) ? arr.map((u: Record<string, string>) => u.login).filter(Boolean) : [];

  return {
    broadcasters: toList(chatters.broadcasters),
    moderators: toList(chatters.moderators),
    vips: toList(chatters.vips),
    viewers: toList(chatters.viewers),
    count: (chatters.count as number) || 0,
  };
}

export interface SocialMedia {
  name: string;
  title: string;
  url: string;
}

export async function getSocialMedias(channelLogin: string): Promise<SocialMedia[]> {
  const result = await gqlWithIntegrity(QUERIES.socialMedias, { login: channelLogin });
  const user = result?.data?.user as Record<string, Record<string, unknown>> | undefined;
  const medias = user?.channel?.socialMedias;
  if (!Array.isArray(medias)) return [];
  return medias.map((m: Record<string, string>) => ({ name: m.name, title: m.title, url: m.url }));
}

export interface UserFollowsResult {
  totalCount: number;
  follows: Array<{ login: string; cursor: string }>;
  hasNextPage: boolean;
}

export async function getUserFollowsPaginated(
  login: string,
  first = 20,
  after?: string,
): Promise<UserFollowsResult | null> {
  const variables: Record<string, unknown> = { login, first };
  if (after) variables.after = after;

  const result = await gqlWithIntegrity(QUERIES.userFollowsPaginated, variables);
  const follows = (result?.data?.user as Record<string, Record<string, unknown>> | undefined)?.follows;
  if (!follows) return null;

  const edges = follows.edges as Array<{ cursor: string; node: { login: string } }> | undefined;

  return {
    totalCount: (follows.totalCount as number) || 0,
    follows: edges?.map((e) => ({ login: e.node.login, cursor: e.cursor })) || [],
    hasNextPage: !!(follows.pageInfo as Record<string, boolean> | undefined)?.hasNextPage,
  };
}

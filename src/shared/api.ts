// Stub API client — Phase 2 will replace with real fetch calls to himrate-platform

export interface Channel {
  id: string;
  twitch_id: string;
  display_name: string;
  avatar_url: string | null;
  is_live: boolean;
}

export interface TrustData {
  erv_number: number | null;
  erv_percent: number | null;
  erv_label: string | null;
  ccv: number | null;
  trust_index: number | null;
  rating: number | null;
  confidence: number | null;
}

export const api = {
  getChannel: async (_twitchId: string): Promise<Channel | null> => null,
  getTrust: async (_channelId: string): Promise<TrustData | null> => null,
};

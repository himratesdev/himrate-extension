// LITERAL PORT — wireframe slim/20_badge-modal.html (sp-modal-overlay).
// Badge SVG preview + 3 code tabs (HTML/Markdown/BBCode) + copy button.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface Props {
  channelLogin: string;
  tiScore: number;
  onClose: () => void;
}

type CodeTab = 'html' | 'markdown' | 'bbcode';

export function Frame20BadgeModal({ channelLogin, tiScore, onClose }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CodeTab>('html');
  const [copied, setCopied] = useState(false);

  const badgeUrl = `https://himrate.com/badge/${channelLogin}.svg`;
  const channelUrl = `https://himrate.com/c/${channelLogin}`;
  const altText = `HimRate TI: ${tiScore}`;

  const codeSnippets: Record<CodeTab, string> = {
    html: `<a href="${channelUrl}">\n  <img src="${badgeUrl}"\n    alt="${altText}" />\n</a>`,
    markdown: `[![${altText}](${badgeUrl})](${channelUrl})`,
    bbcode: `[url=${channelUrl}][img]${badgeUrl}[/img][/url]`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippets[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API may be blocked — silent fail
    }
  };

  return (
    <Modal title={t('sp.modal_badge_title')} onClose={onClose}>
      {/* Badge SVG preview — wireframe verbatim */}
      <div className="sp-badge-preview">
        <svg width="260" height="40" viewBox="0 0 260 40">
          <rect x="0" y="0" width="260" height="40" rx="8" fill="#059669" />
          <text
            x="16"
            y="25"
            fill="white"
            fontFamily="'Space Grotesk', Arial, sans-serif"
            fontSize="13"
            fontWeight="700"
          >{t('sp.badge_label_ti', { N: tiScore })}</text>
          <circle cx="240" cy="20" r="8" fill="white" opacity="0.3" />
          <text
            x="236"
            y="24"
            fill="white"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            fontWeight="700"
          >✓</text>
        </svg>
      </div>

      {/* Code format tabs */}
      <div className="sp-code-tabs">
        <button
          className={`sp-code-tab${tab === 'html' ? ' active' : ''}`}
          onClick={() => setTab('html')}
        >HTML</button>
        <button
          className={`sp-code-tab${tab === 'markdown' ? ' active' : ''}`}
          onClick={() => setTab('markdown')}
        >Markdown</button>
        <button
          className={`sp-code-tab${tab === 'bbcode' ? ' active' : ''}`}
          onClick={() => setTab('bbcode')}
        >BBCode</button>
      </div>

      {/* Code block + copy button */}
      <div className="sp-code-block">
        <button className="sp-code-copy" onClick={handleCopy}>
          {copied ? t('sp.code_copied') : t('sp.code_copy')}
        </button>
        <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {codeSnippets[tab]}
        </pre>
      </div>
    </Modal>
  );
}

// TASK-019: Content Script — Channel Detection + SPA Navigation
// Injected on twitch.tv pages. Detects channel from URL, sends to background.

import { extractChannel } from '../shared/utils';

let lastChannel: string | null = null;

function detectAndNotify(): void {
  const channel = extractChannel(window.location.href);

  if (channel === lastChannel) return; // debounce
  lastChannel = channel;

  chrome.runtime.sendMessage({
    action: 'CHANNEL_CHANGED',
    channel,
  }).catch(() => {
    // Background may not be ready yet (SW waking up)
  });
}

// Initial detection on page load
detectAndNotify();

// SPA detection: MutationObserver on <title> changes
// Twitch updates title when navigating between channels
const observer = new MutationObserver(() => {
  detectAndNotify();
});

const titleEl = document.querySelector('title');
if (titleEl) {
  observer.observe(titleEl, { childList: true });
}

// Fallback: poll URL every 2s (MutationObserver may miss some navigations)
let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    detectAndNotify();
  }
}, 2000);

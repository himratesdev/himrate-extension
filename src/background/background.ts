// HimRate Background Service Worker (MV3)
// Scaffold: empty. Phase 2: EventSub message routing, badge updates, side panel communication.

chrome.runtime.onInstalled.addListener(() => {
  console.log('HimRate Extension installed');
});

// Enable side panel on all URLs
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {
  // Side panel API not available (Chrome < 114)
});

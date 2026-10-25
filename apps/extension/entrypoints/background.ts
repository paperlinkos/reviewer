export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: { type?: string }, sender, sendResponse) => {
    if (message.type !== 'toggle-review' || !sender.tab?.id) return;
    const tabId = sender.tab.id;
    chrome.tabs.sendMessage(tabId, { type: 'toggle-review' }, () => {
      if (chrome.runtime.lastError) chrome.scripting.executeScript({ target: { tabId }, files: ['content-scripts/content.js'] }, () => chrome.tabs.sendMessage(tabId, { type: 'toggle-review' }));
    });
    sendResponse({ ok: true });
  });
});

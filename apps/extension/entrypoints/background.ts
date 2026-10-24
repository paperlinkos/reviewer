export default defineBackground(() => { chrome.runtime.onInstalled.addListener(() => console.info('Visual Feedback extension installed')); });

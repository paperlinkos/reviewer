export default defineContentScript({ matches: [], main() { // Site access is intentionally granted only later, for a user-started session.
  console.info('Visual Feedback content script ready');
} });

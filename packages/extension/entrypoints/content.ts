// Runs in ISOLATED world — bridges injected.ts (main world) and background.ts
// Uses CustomEvents to talk to injected.ts, chrome.runtime to talk to background

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',

  main() {
    // Inject the main-world script that hooks localStorage
    injectScript('/injected.js', { keepInDom: true });

    // Listen for localStorage changes from injected.ts
    document.addEventListener('stashbridge:storage-change', ((e: CustomEvent) => {
      const { key, value, origin, timestamp } = e.detail;
      browser.runtime.sendMessage({
        type: 'LOCAL_CHANGE',
        origin,
        key,
        value,
        timestamp,
      });
    }) as EventListener);

    // Listen for remote changes from background.ts to apply locally
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'REMOTE_CHANGE') {
        document.dispatchEvent(
          new CustomEvent('stashbridge:storage-write', {
            detail: { key: message.key, value: message.value },
          })
        );
      }
    });
  },
});

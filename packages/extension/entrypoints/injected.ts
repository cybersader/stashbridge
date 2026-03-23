// Runs in the page's MAIN world — has access to localStorage
// Communicates with content.ts via CustomEvents on document

export default defineUnlistedScript({
  main() {
    let suppressCapture = false;
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    // Intercept setItem
    Storage.prototype.setItem = function (key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (!suppressCapture) {
        document.dispatchEvent(
          new CustomEvent('stashbridge:storage-change', {
            detail: { key, value, origin: location.origin, timestamp: Date.now() },
          })
        );
      }
    };

    // Intercept removeItem
    Storage.prototype.removeItem = function (key: string) {
      originalRemoveItem.call(this, key);
      if (!suppressCapture) {
        document.dispatchEvent(
          new CustomEvent('stashbridge:storage-change', {
            detail: { key, value: '', origin: location.origin, timestamp: Date.now() },
          })
        );
      }
    };

    // Listen for remote changes to apply
    document.addEventListener('stashbridge:storage-write', ((e: CustomEvent) => {
      suppressCapture = true;
      try {
        if (e.detail.value === '') {
          originalRemoveItem.call(localStorage, e.detail.key);
        } else {
          originalSetItem.call(localStorage, e.detail.key, e.detail.value);
        }
      } finally {
        suppressCapture = false;
      }
    }) as EventListener);

    // Also capture cross-tab storage events
    window.addEventListener('storage', (e) => {
      if (e.key && e.storageArea === localStorage && !suppressCapture) {
        document.dispatchEvent(
          new CustomEvent('stashbridge:storage-change', {
            detail: {
              key: e.key,
              value: e.newValue ?? '',
              origin: location.origin,
              timestamp: Date.now(),
            },
          })
        );
      }
    });
  },
});

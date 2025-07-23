import { useEffect } from 'react';

/**
 * Adds global keyboard shortcut listener.
 * @param {string[]} keys - Array of key combos e.g. ['ctrl+k','meta+k']
 * @param {() => void} callback - Fired when any combo is pressed
 */
export function useHotkeys(keys, callback) {
  useEffect(() => {
    function handler(e) {
      const combo =
        (e.ctrlKey ? 'ctrl+' : '') +
        (e.metaKey ? 'meta+' : '') +
        (e.shiftKey ? 'shift+' : '') +
        e.key.toLowerCase();

      if (keys.includes(combo)) {
        e.preventDefault();
        callback();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keys, callback]);
}

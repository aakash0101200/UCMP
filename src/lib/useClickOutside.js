import { useEffect } from 'react';

/**
 * Runs cb when a click / focus occurs outside the ref element.
 * @param {import('react').RefObject} ref
 * @param {() => void} cb
 */
export function useClickOutside(ref, cb) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      cb();
    }
    document.addEventListener('mousedown', listener);
    document.addEventListener('focusin', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('focusin', listener);
    };
  }, [ref, cb]);
}

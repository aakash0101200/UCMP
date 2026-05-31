import { useEffect } from 'react';

/**
 * LocationAccessGuard
 * ─────────────────────────────────────────────────────────────
 * Silently fires the browser's native geolocation prompt as soon
 * as `isOpen` becomes true.  No custom modal — the browser handles
 * the "Allow / Deny" UI natively.
 *
 * Props:
 *   isOpen    – boolean  – trigger the request when true
 *   onSuccess – ({ latitude, longitude, accuracy }) => void
 *   onReject  – (errorCode: 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED') => void
 *   onClose   – () => void  – called after success or unrecoverable failure
 */
export default function LocationAccessGuard({ isOpen, onSuccess, onReject, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    if (!navigator.geolocation) {
      onReject?.('UNSUPPORTED');
      onClose?.();
      return;
    }

    // Fire the native browser prompt immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess?.({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        onClose?.();
      },
      (err) => {
        const code =
          err.code === err.PERMISSION_DENIED ? 'DENIED' :
            err.code === err.POSITION_UNAVAILABLE ? 'UNAVAILABLE' :
              err.code === err.TIMEOUT ? 'TIMEOUT' :
                'UNSUPPORTED';
        onReject?.(code);
        onClose?.();
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, [isOpen]);

  // Renders nothing — the native browser dialog does all the work
  return null;
}

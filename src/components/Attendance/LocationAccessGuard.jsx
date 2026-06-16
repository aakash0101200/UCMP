import { useEffect, useRef } from 'react';

/**
 * LocationAccessGuard
 * ─────────────────────────────────────────────────────────────
 * Fires the browser's native geolocation prompt as soon as
 * `isOpen` becomes true.
 *
 * Uses a progressive fallback strategy:
 *   1. Try HIGH ACCURACY first (GPS chip — best for outdoors)
 *      with a short timeout of 8 seconds.
 *   2. If that fails with TIMEOUT or POSITION_UNAVAILABLE,
 *      automatically retry with LOW ACCURACY (Wi-Fi/cell tower
 *      triangulation — much more reliable indoors/auditoriums)
 *      with a longer timeout of 15 seconds.
 *
 * The `accuracy` (in meters) of the reading is always passed
 * to onSuccess so the backend can make intelligent decisions.
 *
 * Props:
 *   isOpen    – boolean  – trigger the request when true
 *   onSuccess – ({ latitude, longitude, accuracy }) => void
 *   onReject  – (errorCode: 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED') => void
 *   onClose   – () => void  – called after success or unrecoverable failure
 */
export default function LocationAccessGuard({ isOpen, onSuccess, onReject, onClose }) {
  const attemptedFallbackRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      attemptedFallbackRef.current = false;
      return;
    }

    if (!navigator.geolocation) {
      onReject?.('UNSUPPORTED');
      onClose?.();
      return;
    }

    const handleSuccess = (pos) => {
      onSuccess?.({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      onClose?.();
    };

    const mapErrorCode = (err) =>
      err.code === err.PERMISSION_DENIED ? 'DENIED' :
        err.code === err.POSITION_UNAVAILABLE ? 'UNAVAILABLE' :
          err.code === err.TIMEOUT ? 'TIMEOUT' :
            'UNSUPPORTED';

    const handleError = (err) => {
      const code = mapErrorCode(err);

      // If high-accuracy GPS failed due to timeout or position unavailability
      // (common indoors), automatically retry with low-accuracy mode
      // which uses Wi-Fi/cell tower triangulation
      if (!attemptedFallbackRef.current && (code === 'TIMEOUT' || code === 'UNAVAILABLE')) {
        attemptedFallbackRef.current = true;
        console.warn(
          '[LocationAccessGuard] High-accuracy GPS failed, falling back to network-based location...'
        );
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (fallbackErr) => {
            // Both strategies failed — report the original error
            onReject?.(mapErrorCode(fallbackErr));
            onClose?.();
          },
          {
            enableHighAccuracy: false,  // Use Wi-Fi/cell tower
            timeout: 15000,             // Longer timeout for network resolution
            maximumAge: 60000,          // Accept a cached position up to 1 minute old
          }
        );
        return;
      }

      // Permission denied or both attempts failed
      onReject?.(code);
      onClose?.();
    };

    // Step 1: Try high-accuracy (GPS chip) first
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 8000,     // 8 seconds — enough for outdoor GPS lock
        maximumAge: 0,     // Force a fresh reading
      }
    );
  }, [isOpen]);

  // Renders nothing — the native browser dialog does all the work
  return null;
}

/**
 * Generates a stable, unique browser fingerprint using browser and screen characteristics.
 * Returns a 16-character hexadecimal string representing the device fingerprint.
 */
export const getDeviceFingerprint = () => {
  try {
    const parts = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.colorDepth || '',
      screen.width || '',
      screen.height || '',
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'N/A',
      navigator.deviceMemory || 'N/A'
    ];

    const rawString = parts.join('|');
    
    // DJB2 Hash Algorithm (Hash 1)
    let hash1 = 5381;
    for (let i = 0; i < rawString.length; i++) {
      hash1 = ((hash1 << 5) + hash1) + rawString.charCodeAt(i);
    }
    const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');

    // SDBM Hash Algorithm (Hash 2)
    let hash2 = 0;
    for (let i = 0; i < rawString.length; i++) {
      hash2 = rawString.charCodeAt(i) + (hash2 << 6) + (hash2 << 16) - hash2;
    }
    const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');

    return `${hex1}${hex2}`;
  } catch (e) {
    console.error("Failed to generate device fingerprint, falling back to random UUID", e);
    // Safe fallback: Retrieve or generate a persistent mock fingerprint in localStorage
    let fallback = localStorage.getItem("device_fingerprint_fallback");
    if (!fallback) {
      fallback = 'fb_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("device_fingerprint_fallback", fallback);
    }
    return fallback;
  }
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, AlertTriangle, Smartphone, Laptop, Settings,
  HelpCircle, RefreshCw, CheckCircle2, ShieldAlert, X
} from 'lucide-react';

export default function LocationAccessGuard({ isOpen, onClose, onSuccess, onReject }) {
  const [checking, setChecking] = useState(false);
  const [permissionState, setPermissionState] = useState('checking'); // 'checking', 'granted', 'prompt', 'denied', 'unsupported'
  const [errorType, setErrorType] = useState(null); // 'PERMISSION_DENIED', 'POSITION_UNAVAILABLE', 'TIMEOUT', 'HTTPS', 'UNKNOWN'
  const [activeTab, setActiveTab] = useState('ios-safari'); // 'ios-safari' | 'chrome-mobile' | 'desktop' | 'system-gps'

  // Run a quick pre-flight check on load/mount
  useEffect(() => {
    if (!isOpen) return;

    // Check if secure context
    const isSecure = window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      setPermissionState('unsupported');
      setErrorType('HTTPS');
      return;
    }

    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      setErrorType('UNKNOWN');
      return;
    }

    const runSilentProbe = () => {
      // Probe with very low timeout to see if permission is cached
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPermissionState('granted');
          onSuccess({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
          onClose();
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionState('denied');
            setErrorType('PERMISSION_DENIED');
          } else {
            // Either timeout or position unavailable means we probably need to prompt
            setPermissionState('prompt');
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 250,
          maximumAge: 1000 * 60 * 10 // 10 minutes cache
        }
      );
    };

    // Try modern Permissions API first
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'granted') {
            setPermissionState('granted');
            triggerRealGeolocation();
          } else if (status.state === 'denied') {
            setPermissionState('denied');
            setErrorType('PERMISSION_DENIED');
          } else {
            // status.state === 'prompt' - run silent check to be sure (since some browsers report prompt incorrectly)
            runSilentProbe();
          }

          status.onchange = () => {
            if (status.state === 'granted') {
              setPermissionState('granted');
              triggerRealGeolocation();
            } else {
              setPermissionState(status.state);
            }
          };
        })
        .catch(() => {
          // If query fails, fall back to silent probe
          runSilentProbe();
        });
    } else {
      // iOS Safari fallback
      runSilentProbe();
    }
  }, [isOpen]);

  const triggerRealGeolocation = () => {
    setChecking(true);
    setErrorType(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setChecking(false);
        setPermissionState('granted');
        onSuccess({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        onClose();
      },
      (err) => {
        setChecking(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setPermissionState('denied');
            setErrorType('PERMISSION_DENIED');
            break;
          case err.POSITION_UNAVAILABLE:
            setErrorType('POSITION_UNAVAILABLE');
            break;
          case err.TIMEOUT:
            setErrorType('TIMEOUT');
            break;
          default:
            setErrorType('UNKNOWN');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  if (!isOpen || permissionState === 'granted' || permissionState === 'checking') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {/* Modal Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/40">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <MapPin className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Location Verification</h3>
                <p className="text-xs text-neutral-400">Classroom Presence Security</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

            {/* 1. SECURE HTTPS WARNING */}
            {errorType === 'HTTPS' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/15 border border-red-500/25 rounded-2xl flex items-start gap-3 text-red-400">
                  <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Security Restriction</h4>
                    <p className="text-xs mt-1 leading-relaxed text-red-300/90">
                      Browser geolocation APIs require a secure HTTPS connection. The device will not allow location lookup over unencrypted HTTP protocol.
                    </p>
                  </div>
                </div>
                <div className="text-sm text-neutral-400 leading-relaxed">
                  Please access the application via a secure secure address (e.g., <strong>https://yourdomain.com</strong>) or use localhost for development.
                </div>
              </div>
            )}

            {/* 2. PRE-PROMPT (Explain-First Context) */}
            {errorType !== 'HTTPS' && permissionState !== 'denied' && (
              <div className="space-y-5">
                <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl text-indigo-200 text-xs leading-relaxed flex gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-300 block mb-1">Why is my location verified?</strong>
                    This system compares your coordinates against your professor's location in real-time to confirm physical presence inside the classroom. Geolocation coordinates are encrypted and discarded immediately after verification.
                  </div>
                </div>

                {errorType && errorType !== 'PERMISSION_DENIED' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-amber-400">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      {errorType === 'POSITION_UNAVAILABLE' && (
                        <>
                          <strong className="block mb-0.5">GPS Hardware Disabled</strong>
                          Your device is currently unable to lock on your position. Make sure your phone's GPS/Location Service toggle is enabled in system settings.
                        </>
                      )}
                      {errorType === 'TIMEOUT' && (
                        <>
                          <strong className="block mb-0.5">GPS Signal Timeout</strong>
                          It took too long to retrieve coordinates. If you are deep indoors or have poor reception, step near a window, or toggle your device's Wi-Fi Off to force mobile data lookup.
                        </>
                      )}
                      {errorType === 'UNKNOWN' && (
                        <>
                          <strong className="block mb-0.5">Device Error</strong>
                          Could not acquire GPS position. Check your system browser settings.
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-white text-base">Request GPS Verification</h4>
                  <p className="text-xs text-neutral-400 max-w-xs mt-1.5 leading-relaxed">
                    Tap the button below to prompt the system/browser permission request. Make sure to click <strong>"Allow"</strong> or <strong>"While Using App"</strong>.
                  </p>
                </div>

                <button
                  onClick={triggerRealGeolocation}
                  disabled={checking}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-semibold rounded-2xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Acquiring Satellite Lock...
                    </>
                  ) : (
                    'Grant & Verify Location'
                  )}
                </button>
              </div>
            )}

            {/* 3. DENIED STATE / DETAILED SYSTEM TROUBLESHOOTER */}
            {permissionState === 'denied' && (
              <div className="space-y-6">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block mb-0.5 text-sm">Location Access Blocked</strong>
                    Your browser has cached a block instruction. We cannot trigger the pop-up anymore. You must manually reset the setting using the instructions below.
                  </div>
                </div>

                {/* Tab selector */}
                <div className="flex bg-neutral-950 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'ios-safari', label: 'iOS Safari', icon: Smartphone },
                    { id: 'chrome-mobile', label: 'Chrome Mobile', icon: Smartphone },
                    { id: 'desktop', label: 'Desktop (Chrome/Edge)', icon: Laptop },
                    { id: 'system-gps', label: 'System Settings', icon: Settings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-all ${activeTab === tab.id
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab contents */}
                <div className="bg-neutral-950/40 p-4 border border-neutral-800 rounded-2xl text-sm leading-relaxed text-neutral-300">
                  {activeTab === 'ios-safari' && (
                    <ol className="list-decimal pl-5 space-y-2.5 text-xs text-neutral-400">
                      <li>
                        Look at your browser's search/address bar at the bottom or top of the screen.
                      </li>
                      <li>
                        Tap the <span className="font-bold text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">aA</span> icon to open the website menu.
                      </li>
                      <li>
                        Select <span className="text-white font-semibold">Website Settings</span>.
                      </li>
                      <li>
                        Find <span className="text-white font-semibold">Location</span> and change it from Deny/Ask to <span className="text-indigo-400 font-bold">Allow</span>.
                      </li>
                      <li>
                        Refresh the page and submit attendance again.
                      </li>
                    </ol>
                  )}

                  {activeTab === 'chrome-mobile' && (
                    <ol className="list-decimal pl-5 space-y-2.5 text-xs text-neutral-400">
                      <li>
                        Tap the address bar lock/info icon (<span className="text-white font-semibold">🔒</span> or <span className="text-white font-semibold">ⓘ</span>) next to the URL.
                      </li>
                      <li>
                        Tap <span className="text-white font-semibold">Permissions</span> or <span className="text-white font-semibold">Site Settings</span>.
                      </li>
                      <li>
                        Locate <span className="text-white font-semibold">Location</span> and select <span className="text-indigo-400 font-bold">Allow</span> (or click <span className="text-white font-semibold">Reset permissions</span>).
                      </li>
                      <li>
                        Refresh the tab and retry verification.
                      </li>
                    </ol>
                  )}

                  {activeTab === 'desktop' && (
                    <ol className="list-decimal pl-5 space-y-2.5 text-xs text-neutral-400">
                      <li>
                        Look directly to the left of the website URL in the address bar at the top of your screen.
                      </li>
                      <li>
                        Click the lock icon (<span className="text-white font-semibold">🔒</span>).
                      </li>
                      <li>
                        Locate the <span className="text-white font-semibold">Location</span> toggle switch and switch it to <span className="text-indigo-400 font-bold">ON</span> or choose <span className="text-indigo-400 font-bold">Allow</span>.
                      </li>
                      <li>
                        Reload the page when prompted.
                      </li>
                    </ol>
                  )}

                  {activeTab === 'system-gps' && (
                    <ul className="list-disc pl-5 space-y-3.5 text-xs text-neutral-400">
                      <li>
                        <strong className="text-white block">Apple iOS (iPhone/iPad):</strong>
                        Go to Settings → Privacy & Security → Location Services. Turn it ON. Then scroll down to Safari/Chrome in that list and ensure access is set to "While Using the App".
                      </li>
                      <li>
                        <strong className="text-white block">Android:</strong>
                        Swipe down from the top and toggle the Location / GPS icon ON. Then go to Settings → Apps → Chrome (or browser) → Permissions → Location → select "Allow only while using the app".
                      </li>
                      <li>
                        <strong className="text-white block">macOS Laptop/Desktop:</strong>
                        Open System Settings → Privacy & Security → Location Services. Ensure Location Services is checked/ON, and enable it for your browser in the list.
                      </li>
                    </ul>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPermissionState('prompt');
                      setErrorType(null);
                    }}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl text-xs transition border border-neutral-700"
                  >
                    Reset & Retry Setup
                  </button>
                  <button
                    onClick={triggerRealGeolocation}
                    disabled={checking}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                    Test Live Connection
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer Privacy Sign */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 text-center text-[10px] text-neutral-500">
            Secure, end-to-end encrypted proximity verification system.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

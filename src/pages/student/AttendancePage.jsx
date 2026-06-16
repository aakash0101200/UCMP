import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, MapPin,
  BookOpen, Loader2, RefreshCw, History, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getAttendanceSummary, getAttendanceHistory,
  getActiveSession, markAttendance
} from '../../Services/attendance';
import { useWebSocket } from '../../hooks/useWebSocket';
import LocationAccessGuard from '../../components/Attendance/LocationAccessGuard';

// ── Colour helpers ─────────────────────────────────────────────────────────
function getStatusColor(pct, totalClasses) {
  if (totalClasses === 0) {
    return { ring: '#94a3b8', text: 'text-slate-600 dark:text-zinc-400', bg: 'bg-slate-100 dark:bg-zinc-800', bar: '#cbd5e1', label: 'NO CLASSES HELD YET' };
  }
  if (pct >= 75) return { ring: '#22c55e', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40', bar: '#16a34a', label: 'SAFE' };
  if (pct >= 60) return { ring: '#f59e0b', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/40', bar: '#d97706', label: 'WARNING' };
  return { ring: '#ef4444', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/40', bar: '#dc2626', label: 'DANGER' };
}

// ── Subject Attendance Bar Card ────────────────────────────────────────────
function SubjectCard({ subject, index }) {
  const pct = subject.totalClasses > 0 ? (subject.attended / subject.totalClasses) * 100 : 0;
  const c = getStatusColor(pct, subject.totalClasses);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="p-3 bg-background border border-border/50 rounded-xl hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-sm font-semibold">{subject.subjectCode}</span>
          <span className="ml-2 text-xs text-muted-foreground">{subject.subjectName}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
          {c.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ delay: index * 0.06 + 0.2, duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: c.bar }}
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <span className="font-semibold text-foreground">{subject.totalClasses > 0 ? `${pct.toFixed(1)}%` : '--'}</span>
          <span>({subject.attended}/{subject.totalClasses})</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Live Scanner Panel ─────────────────────────────────────────────────────
function ScannerPanel({ onSuccess }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showLocationGuard, setShowLocationGuard] = useState(false);
  const locationGrantedRef = React.useRef(false);

  // ── Race-condition guard ─────────────────────────────────────────────────
  // Tracks whether WebSocket has already set a definitive session state.
  // If WS fires before the slow HTTP response returns, the HTTP result
  // must NOT overwrite what WebSocket already established.
  const wsUpdatedRef = React.useRef(false);

  const sectionId = localStorage.getItem('sectionId');
  const wsTopic = sectionId ? `/topic/session/${sectionId}` : null;

  useWebSocket(
    wsTopic,
    useCallback((event) => {
      console.log('Received session event via WebSocket:', event);
      if (event.sessionId) {
        // Mark that WS has spoken — HTTP must not overwrite after this
        wsUpdatedRef.current = true;

        if (event.startTime) {
          // Session Started
          setActiveSession({
            id: event.sessionId,
            sectionName: event.sectionName
          });
          setLoadingSession(false);
          setStatus('idle');
          setMessage('');
          setCode('');
          toast.info(`New class session started: ${event.subjectName} (${event.sectionName})`);
        } else {
          // Session Ended
          setActiveSession(null);
          setStatus('idle');
          setMessage('Session ended by instructor.');
          toast.warn('Class session has ended.');
        }
      }
    }, [])
  );

  useEffect(() => {
    let cancelled = false; // cleanup guard for unmount

    getActiveSession()
      .then(r => {
        // Only apply HTTP result if WebSocket hasn't already set the state
        if (!cancelled && !wsUpdatedRef.current) {
          setActiveSession(r.data);
        }
      })
      .catch(() => {
        // Only null-out if WebSocket hasn't already provided a session
        if (!cancelled && !wsUpdatedRef.current) {
          setActiveSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSession(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleMark = () => {
    if (!activeSession) return setMessage('No active class session found.');
    if (code.length !== 6) return setMessage('Enter the 6-digit code.');

    // Check HTTPS or local
    const isSecure = window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      setStatus('error');
      setMessage("Security Error: Geolocation hardware APIs require a secure HTTPS connection.");
      return;
    }

    // Open Location Access Guard modal
    locationGrantedRef.current = false;
    setShowLocationGuard(true);
  };

  const handleLocationGranted = async (coords) => {
    locationGrantedRef.current = true;
    setStatus('loading');
    setMessage('');
    try {
      await markAttendance({
        sessionId: activeSession.id,
        code,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      setStatus('success');
      setMessage('Attendance marked successfully!');
      toast.success('Attendance recorded ✓');
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      // Backend returns error as plain string body, not { message: "..." }
      const backendMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message;
      setMessage(backendMsg || 'Failed to mark attendance.');
    }
  };

  const handleLocationRejected = (errorCode) => {
    const msgs = {
      DENIED: 'Location access was denied. Please allow location permissions in your browser settings and try again.',
      UNAVAILABLE: 'Could not determine your location. Please check your device\'s GPS/location services.',
      TIMEOUT: 'Location request timed out. Please ensure you have a clear GPS signal and try again.',
      UNSUPPORTED: 'Your browser does not support geolocation. Please use a modern browser.'
    };
    setStatus('error');
    setMessage(msgs[errorCode] || 'Location access failed. Please try again.');
    toast.error('Location access failed — attendance not submitted.');
  };

  const handleLocationGuardClose = () => {
    setShowLocationGuard(false);
    // If location was never granted (user dismissed the prompt), reset to idle
    if (!locationGrantedRef.current && status !== 'loading' && status !== 'success') {
      // Leave any existing error message visible
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${activeSession ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
        <h3 className="font-semibold text-base">Live Class Verification</h3>
      </div>

      {loadingSession ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
      ) : activeSession ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">
          Active session: <span className="font-semibold">{activeSession.sectionName || `#${activeSession.id}`}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mb-4">No active session for your class right now.</p>
      )}

      <div className="flex flex-col items-center gap-5 w-full">
        {/* Passcode Segmented Inputs */}
        <div className="relative w-full max-w-[260px] mx-auto">
          {/* Hidden input overlaying the fields */}
          <input
            type="text"
            pattern="\d*"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            disabled={!activeSession || status === 'success'}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            placeholder=""
          />
          {/* Visual Segmented Fields */}
          <div className="flex justify-center gap-2 w-full">
            {Array.from({ length: 6 }).map((_, idx) => {
              const digit = code[idx] || '';
              const isFocused = code.length === idx && activeSession && status !== 'success';
              return (
                <div
                  key={idx}
                  className={`
                    flex-1 aspect-[3/4] max-w-[36px] min-h-[44px]
                    flex items-center justify-center
                    text-xl font-semibold font-mono
                    rounded-xl border transition-all duration-200
                    ${isFocused
                      ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 bg-background shadow-md'
                      : 'border-border bg-muted/10 dark:bg-muted/5'
                    }
                    ${digit ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-muted-foreground/30'}
                    ${(!activeSession || status === 'success') ? 'opacity-50' : ''}
                  `}
                >
                  {digit || (isFocused ? '|' : '·')}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleMark}
          disabled={!activeSession || status === 'loading' || showLocationGuard || status === 'success'}
          className={`w-full max-w-[260px] py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2
            ${(status === 'loading' || showLocationGuard) ? 'bg-indigo-400 cursor-not-allowed'
              : status === 'success' ? 'bg-emerald-600'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}`}
        >
          {(status === 'loading' || showLocationGuard) && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {(status === 'loading' || showLocationGuard) ? 'Verifying...' : status === 'success' ? 'Marked!' : 'Submit Attendance'}
        </button>

        {message && (
          <div className={`w-full max-w-[260px] p-3 rounded-xl text-center text-sm font-medium
            ${status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Location Access Pre-Prompt and Troubleshooting Guard Modal */}
      <LocationAccessGuard
        isOpen={showLocationGuard}
        onClose={handleLocationGuardClose}
        onSuccess={handleLocationGranted}
        onReject={handleLocationRejected}
      />
    </div>
  );
}

// ── History Item ───────────────────────────────────────────────────────────
function HistoryItem({ record, index }) {
  const date = new Date(record.markedAt);
  const isManual = record.markedBy === 'FACULTY_MANUAL';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-foreground">{record.subjectName || 'General Class'}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {record.sectionName} · {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${isManual
          ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          }`}>
          {isManual ? 'Faculty Manual' : 'TOTP Verified'}
        </span>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Present</span>
      </div>
    </motion.div>
  );
}

// ── Main Attendance Page ───────────────────────────────────────────────────
export default function AttendancePage() {
  const [summary, setSummary] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectsExpanded, setSubjectsExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, histRes] = await Promise.allSettled([
        getAttendanceSummary(),
        getAttendanceHistory()
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data || []);
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data || []);
    } catch {
      toast.error('Could not load attendance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Compute overall average
  const activeSubjects = summary.filter(s => s.totalClasses > 0);
  const avg = activeSubjects.length
    ? activeSubjects.reduce((s, x) => s + (x.attended / x.totalClasses) * 100, 0) / activeSubjects.length
    : 0;
  const avgColor = getStatusColor(avg, activeSubjects.length);

  const safeCount = summary.filter(s => s.totalClasses > 0 && ((s.attended / s.totalClasses) * 100) >= 75).length;
  const warnCount = summary.filter(s => s.totalClasses > 0 && ((s.attended / s.totalClasses) * 100) >= 60 && ((s.attended / s.totalClasses) * 100) < 75).length;
  const dangerCount = summary.filter(s => s.totalClasses > 0 && ((s.attended / s.totalClasses) * 100) < 60).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Attendance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track your presence across all subjects</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="p-2 hover:bg-muted/50 rounded-lg transition-colors border border-border/40"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top Grid: Overall Attendance & Live Class Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Overall Gauge */}
        <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
              Overall Attendance
            </h3>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="w-28 h-28 shrink-0">
                  <CircularProgressbar
                    value={avg}
                    text={activeSubjects.length > 0 ? `${avg.toFixed(1)}%` : '--'}
                    styles={buildStyles({
                      textSize: '16px',
                      textColor: 'currentColor',
                      pathColor: avgColor.ring,
                      trailColor: 'var(--color-muted)',
                      pathTransitionDuration: 0.8,
                    })}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{safeCount} Safe</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{warnCount} Warn</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/10 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{dangerCount} Danger</span>
                    </div>
                  </div>

                  <p className="text-left text-xs text-muted-foreground max-w-xs leading-relaxed">
                    {activeSubjects.length === 0
                      ? 'No class sessions conducted yet.'
                      : avg >= 75
                        ? '✓ You meet the 75% requirement'
                        : avg >= 60
                          ? `⚠ ${(75 - avg).toFixed(1)}% below the requirement`
                          : '✗ Critical — contact your coordinator'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Scanner */}
        <ScannerPanel onSuccess={fetchAll} />
      </div>

      {/* Bottom Collapsible Sections */}
      <div className="space-y-4">
        {/* Accordion 1: Subject-wise Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setSubjectsExpanded(!subjectsExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-sm">Subject-wise Breakdown</span>
              {!loading && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-full font-medium">
                  {summary.length} {summary.length === 1 ? 'subject' : 'subjects'}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                subjectsExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {subjectsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border/30 pt-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : summary.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <BookOpen className="w-10 h-10 text-muted-foreground/20 mb-2" />
                      <p className="font-medium text-sm">No attendance data yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Attendance records will appear here after your first class.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {summary.map((s, i) => <SubjectCard key={s.subjectId} subject={s} index={i} />)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: Attendance History */}
        <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-sm">Attendance History</span>
              {!loading && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-full font-medium">
                  {history.length} {history.length === 1 ? 'record' : 'records'}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                historyExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {historyExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border/30 pt-2">
                  {loading ? (
                    <div className="space-y-2 pt-2">
                      {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />)}
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <History className="w-10 h-10 text-muted-foreground/20 mb-2" />
                      <p className="font-medium text-sm">No history yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sessions you attend will appear in this log.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto pr-1 divide-y divide-border/20">
                      {history.map((r, i) => <HistoryItem key={i} record={r} index={i} />)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
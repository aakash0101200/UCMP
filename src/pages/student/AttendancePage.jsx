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

// ── Colour helpers ─────────────────────────────────────────────────────────
function getStatusColor(pct) {
  if (pct >= 75) return { ring: '#22c55e', text: 'text-emerald-500', bg: 'bg-emerald-500/10', bar: '#16a34a', label: 'SAFE' };
  if (pct >= 60) return { ring: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500/10', bar: '#d97706', label: 'WARNING' };
  return { ring: '#ef4444', text: 'text-red-500', bg: 'bg-red-500/10', bar: '#dc2626', label: 'DANGER' };
}

// ── Subject Attendance Bar Card ────────────────────────────────────────────
function SubjectCard({ subject, index }) {
  const pct = subject.percentage ?? 0;
  const c = getStatusColor(pct);
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
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ delay: index * 0.06 + 0.2, duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: c.bar }}
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <span className="font-semibold text-foreground">{pct.toFixed(1)}%</span>
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

  useEffect(() => {
    getActiveSession()
      .then(r => setActiveSession(r.data))
      .catch(() => setActiveSession(null))
      .finally(() => setLoadingSession(false));
  }, []);

  const handleMark = () => {
    if (!activeSession) return setMessage('No active class session found.');
    if (code.length !== 6) return setMessage('Enter the 6-digit code.');
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          await markAttendance({ sessionId: activeSession.id, code, latitude: lat, longitude: lon });
          setStatus('success');
          setMessage('Attendance marked successfully!');
          toast.success('Attendance recorded ✓');
          onSuccess?.();
        } catch (err) {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Failed to mark attendance.');
        }
      },
      () => { setStatus('error'); setMessage('Location access denied — please enable GPS.'); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-background border border-border/50 rounded-xl p-5 shadow-sm">
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

      <div className="flex flex-col items-center gap-4">
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          disabled={!activeSession || status === 'success'}
          className="w-full max-w-[220px] text-center text-4xl tracking-[0.5em] font-mono bg-muted/30 dark:bg-muted/20 border border-border rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
        />
        <button
          onClick={handleMark}
          disabled={!activeSession || status === 'loading' || status === 'success'}
          className={`w-full max-w-[220px] py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2
            ${status === 'loading' ? 'bg-indigo-400 cursor-not-allowed'
              : status === 'success' ? 'bg-emerald-600'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}`}
        >
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Marked!' : 'Submit Attendance'}
        </button>

        {message && (
          <div className={`w-full max-w-[220px] p-3 rounded-xl text-center text-sm font-medium
            ${status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

// ── History Item ───────────────────────────────────────────────────────────
function HistoryItem({ record, index }) {
  const date = new Date(record.markedAt);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0"
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <div>
          <div className="text-sm font-medium">{record.sectionName}</div>
          <div className="text-xs text-muted-foreground">{date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Present</span>
    </motion.div>
  );
}

// ── Main Attendance Page ───────────────────────────────────────────────────
export default function AttendancePage() {
  const [summary, setSummary] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview'); // 'overview' | 'history'

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
  const avg = summary.length
    ? summary.reduce((s, x) => s + x.percentage, 0) / summary.length
    : 0;
  const avgColor = getStatusColor(avg);

  const safeCount    = summary.filter(s => s.percentage >= 75).length;
  const warnCount    = summary.filter(s => s.percentage >= 60 && s.percentage < 75).length;
  const dangerCount  = summary.filter(s => s.percentage < 60).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Attendance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track your presence across all subjects</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: Overall + Scanner ─────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Overall Gauge */}
          <div className="bg-background border border-border/50 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Overall Attendance
            </h3>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-36 h-36">
                  <CircularProgressbar
                    value={avg}
                    text={`${avg.toFixed(1)}%`}
                    styles={buildStyles({
                      textSize: '16px',
                      textColor: 'currentColor',
                      pathColor: avgColor.ring,
                      trailColor: 'var(--color-muted)',
                      pathTransitionDuration: 0.8,
                    })}
                  />
                </div>

                {/* Stat pills */}
                <div className="flex gap-2 flex-wrap justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{safeCount} Safe</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{warnCount} Warning</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-red-500">{dangerCount} Danger</span>
                  </div>
                </div>

                {/* Requirement note */}
                <p className="text-center text-xs text-muted-foreground">
                  {avg >= 75
                    ? '✓ You meet the 75% requirement'
                    : avg >= 60
                    ? `⚠ ${(75 - avg).toFixed(1)}% below the requirement`
                    : '✗ Critical — contact your coordinator'}
                </p>
              </div>
            )}
          </div>

          {/* Live Scanner */}
          <ScannerPanel onSuccess={fetchAll} />
        </div>

        {/* ── RIGHT: Subject List + History ───────────────────────────── */}
        <div className="lg:col-span-2">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-muted/40 rounded-xl mb-4 w-fit">
            {[
              { key: 'overview', icon: BookOpen, label: 'Subjects' },
              { key: 'history', icon: History, label: 'History' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                  tab === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-background border border-border/50 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Subject-wise Breakdown</h3>
                  <span className="text-xs text-muted-foreground">{summary.length} subjects</span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : summary.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/20 mb-3" />
                    <p className="font-medium">No attendance data yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Attendance records will appear here after your first class.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {summary.map((s, i) => <SubjectCard key={s.subjectId} subject={s} index={i} />)}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-background border border-border/50 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Attendance History</h3>
                  <span className="text-xs text-muted-foreground">{history.length} records</span>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />)}
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <History className="w-12 h-12 text-muted-foreground/20 mb-3" />
                    <p className="font-medium">No history yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sessions you attend will appear in this log.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto pr-1">
                    {history.map((r, i) => <HistoryItem key={i} record={r} index={i} />)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
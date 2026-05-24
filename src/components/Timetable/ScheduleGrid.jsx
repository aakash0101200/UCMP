import React, { useState, useCallback } from 'react';
import { Clock, MapPin, User, X, Check, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { createTimetableEntry, validateTimetableEntry, deleteTimetableEntry } from '../../Services/timetable';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat' };

const TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '9 AM' },
  { start: '10:00', end: '11:00', label: '10 AM' },
  { start: '11:00', end: '12:00', label: '11 AM' },
  { start: '12:00', end: '13:00', label: '12 PM' },
  { start: '14:00', end: '15:00', label: '2 PM' },
  { start: '15:00', end: '16:00', label: '3 PM' },
  { start: '16:00', end: '17:00', label: '4 PM' },
];

function getSubjectCategory(code = '', name = '') {
  const c = String(code).toLowerCase();
  const n = String(name).toLowerCase();

  if (n.includes('lab') || n.includes('programming') || n.includes('practical') || n.includes('workshop') || c.endsWith('l') || c.includes('lab')) {
    return 'LABS_PROG';
  }
  if (n.includes('math') || n.includes('algebra') || n.includes('calculus') || n.includes('discrete') || n.includes('theory') || n.includes('probability') || n.includes('statistics') || c.startsWith('ma') || c.startsWith('mth')) {
    return 'MATH_THEORY';
  }
  return 'CORE_SYSTEMS';
}

function getZenithStyles(subjectCode, subjectName) {
  const cat = getSubjectCategory(subjectCode, subjectName);
  if (cat === 'MATH_THEORY') {
    return {
      bg: 'bg-emerald-55/90 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border border-emerald-200/80 dark:border-emerald-500/20'
    };
  } else if (cat === 'LABS_PROG') {
    return {
      bg: 'bg-rose-55/90 dark:bg-rose-500/10',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border border-rose-200/80 dark:border-rose-500/20'
    };
  } else {
    return {
      bg: 'bg-indigo-55/90 dark:bg-indigo-500/10',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border border-indigo-200/80 dark:border-indigo-500/20'
    };
  }
}

// Normalize "09:00:00" → "09:00"
function normalizeTime(t) {
  if (!t) return '';
  return String(t).substring(0, 5);
}

// ── Placement Modal ──────────────────────────────────────────────────────────
function PlacementModal({ assignment, day, slot, rooms, onConfirm, onCancel, isValidating }) {
  const [selectedRoom, setSelectedRoom] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-background border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-1">Place on Schedule</h3>
        <p className="text-sm text-muted-foreground mb-5">
          <span className="font-semibold text-foreground">{assignment.subjectCode}</span>
          {' '}— {DAY_SHORT[day]}, {slot.label}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-indigo-400" />
            <span>{assignment.facultyName || assignment.facultyCollegeId}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{slot.start} – {slot.end}</span>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Room
            </label>
            <select
              value={selectedRoom}
              onChange={e => setSelectedRoom(e.target.value)}
              className="w-full text-sm border border-border/50 rounded-lg px-3 py-2 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Room...</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.building}, cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedRoom)}
            disabled={!selectedRoom || isValidating}
            className="flex-1 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isValidating ? 'Validating...' : 'Place Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ entry, onConfirm, onCancel }) {
  const color = getZenithStyles(entry.subjectCode, entry.subjectName);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-background border border-border rounded-xl shadow-2xl p-5 w-80 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.bg} ${color.border}`}>
            <span className={`text-xs font-bold ${color.text}`}>{entry.subjectCode?.slice(0, 3)}</span>
          </div>
          <div>
            <div className="font-semibold text-sm">{entry.subjectCode} — {entry.subjectName}</div>
            <div className="text-xs text-muted-foreground">{entry.roomName} · {entry.facultyName}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Remove this entry from the schedule?</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(entry.id)}
            className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Grid ────────────────────────────────────────────────────────────────
export default function ScheduleGrid({ entries, assignments, rooms, term, sectionId, onEntryChange }) {
  const [hoverCell, setHoverCell] = useState(null);
  const [placementModal, setPlacementModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);   // ← replaces confirm()
  const [isValidating, setIsValidating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Build lookup map "DAY|HH:mm" → entry
  const entryMap = {};
  (entries || []).forEach(e => {
    const key = `${e.day}|${normalizeTime(e.startTime)}`;
    entryMap[key] = e;
  });

  // Count placed slots per assignment key
  const placedCounts = {};
  (entries || []).forEach(e => {
    const k = `${e.subjectId}-${e.facultyId}-${e.sectionId}`;
    placedCounts[k] = (placedCounts[k] || 0) + 1;
  });

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (e, assignment) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(assignment));
  };

  const handleDragOver = useCallback((e, day, slot) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setHoverCell(`${day}|${slot.start}`);
  }, []);

  const handleDragLeave = useCallback(() => setHoverCell(null), []);

  const handleDrop = useCallback((e, day, slot) => {
    e.preventDefault();
    setHoverCell(null);
    try {
      const assignment = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (entryMap[`${day}|${slot.start}`]) {
        toast.warning('This slot is already occupied!');
        return;
      }
      setPlacementModal({ assignment, day, slot });
    } catch { /* ignore malformed drag */ }
  }, [entryMap]);

  // ── Place entry ───────────────────────────────────────────────────────────
  const handleConfirmPlacement = async (roomId) => {
    if (!placementModal || !roomId) return;
    const { assignment, day, slot } = placementModal;
    setIsValidating(true);
    try {
      const payload = {
        subjectId: assignment.subjectId,
        facultyId: assignment.facultyId,
        sectionId: assignment.sectionId || sectionId,
        roomId: parseInt(roomId),
        day,
        startTime: slot.start,
        endTime: slot.end,
        academicTerm: term,
        entryType: 'REGULAR',
      };

      const valRes = await validateTimetableEntry(payload);
      if (valRes.data?.hasConflicts) {
        toast.error(`Conflict: ${valRes.data.conflicts?.join(', ') || 'Unknown conflict'}`);
        return;
      }

      await createTimetableEntry(payload);
      toast.success(`${assignment.subjectCode} placed on ${DAY_SHORT[day]} ${slot.label}`);
      setPlacementModal(null);
      onEntryChange?.();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to place entry');
    } finally {
      setIsValidating(false);
    }
  };

  // ── Delete entry (via inline modal — no browser confirm()) ────────────────
  const handleDeleteConfirmed = async (entryId) => {
    if (!entryId) { toast.error('Invalid entry ID'); return; }
    setIsDeleting(true);
    try {
      await deleteTimetableEntry(entryId);
      toast.success('Entry removed');
      setDeleteModal(null);
      onEntryChange?.();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to remove entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* ── Draggable Assignment Chips ──────────────────────────────────── */}
      {assignments?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Drag assignments onto the grid ↓
          </p>
          <div className="flex flex-wrap gap-2">
            {assignments.map(a => {
              const k = `${a.subjectId}-${a.facultyId}-${a.sectionId}`;
              const remaining = a.weeklySlots - (placedCounts[k] || 0);
              if (remaining <= 0) return null;
              const c = getZenithStyles(a.subjectCode, a.subjectName);
              return (
                <div
                  key={a.id}
                  draggable
                  onDragStart={e => handleDragStart(e, a)}
                  className={`px-3 py-2 rounded-xl cursor-grab active:cursor-grabbing select-none transition-all hover:scale-[1.02] hover:shadow-md ${c.bg} ${c.border}`}
                >
                  <div className={`text-sm font-semibold ${c.text}`}>{a.subjectCode}</div>
                  <div className="text-[10px] opacity-80">
                    {a.facultyName || a.facultyCollegeId} · {remaining} left
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Schedule Grid ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#F8F9FA] dark:bg-[#161B26] p-1.5 shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-100/50 dark:bg-[#111622]/40">
              <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-r border-slate-200/50 dark:border-slate-800/80 w-16 text-center">
                <Clock className="w-4 h-4 mx-auto" />
              </th>
              {DAYS.map(d => (
                <th key={d} className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-r border-slate-200/50 dark:border-slate-800/80 text-center uppercase tracking-wider">
                  {DAY_SHORT[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, si) => {
              const isLunchBefore = slot.start === '14:00' && TIME_SLOTS[si - 1]?.end === '13:00';
              return (
                <React.Fragment key={slot.start}>
                  {isLunchBefore && (
                    <tr>
                      <td colSpan={DAYS.length + 1} className="text-center text-[10px] text-slate-400/60 py-2 bg-slate-100/30 dark:bg-slate-900/20 border-b border-slate-200/50 dark:border-slate-800/80 italic">
                        — Lunch Break (1:00 – 2:00 PM) —
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-3 text-xs font-medium text-slate-500 dark:text-slate-400 text-center border-r border-b border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#111622]/30 whitespace-nowrap">
                      {slot.label}
                    </td>
                    {DAYS.map(day => {
                      const cellKey = `${day}|${slot.start}`;
                      const entry = entryMap[cellKey];
                      const isHover = hoverCell === cellKey;
                      const c = entry ? getZenithStyles(entry.subjectCode, entry.subjectName) : null;

                      return (
                        <td
                          key={cellKey}
                          className={`border-r border-b border-slate-200/50 dark:border-slate-800/80 p-1.5 h-[90px] bg-white dark:bg-[#161B26] align-top transition-colors relative overflow-visible
                            ${isHover ? 'bg-indigo-500/5 ring-2 ring-inset ring-indigo-500/30' : 'hover:bg-slate-50/80 dark:hover:bg-[#1C2333]/50'}
                          `}
                          onDragOver={e => handleDragOver(e, day, slot)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, day, slot)}
                        >
                          {entry ? (
                            /* Entry card — click anywhere on it to delete */
                            <div
                              className={`h-full rounded-xl p-2 relative cursor-pointer group/card flex flex-col justify-between ${c.bg} ${c.border} hover:scale-[1.01] transition-transform`}
                              title="Click to remove"
                              onClick={() => setDeleteModal(entry)}
                            >
                              {/* Hover indicator */}
                              <div className="absolute inset-0 bg-red-500/0 group-hover/card:bg-red-500/5 rounded-xl transition-colors flex items-start justify-end p-1 pointer-events-none">
                                <X className="w-3.5 h-3.5 text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                              </div>
                              <div className={`text-[11px] font-bold truncate ${c.text}`}>
                                {entry.subjectCode}
                              </div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-1">
                                {entry.roomName} · {entry.facultyName}
                              </div>
                            </div>
                          ) : (
                            isHover && (
                              <div className="h-full flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] text-indigo-400 font-medium animate-pulse">Drop here</span>
                              </div>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Placement Modal ─────────────────────────────────────────────── */}
      {placementModal && (
        <PlacementModal
          assignment={placementModal.assignment}
          day={placementModal.day}
          slot={placementModal.slot}
          rooms={rooms || []}
          onConfirm={handleConfirmPlacement}
          onCancel={() => setPlacementModal(null)}
          isValidating={isValidating}
        />
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
      {deleteModal && (
        <DeleteConfirm
          entry={deleteModal}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </>
  );
}

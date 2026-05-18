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

const SUBJECT_COLORS = [
  { bg: 'bg-indigo-100 dark:bg-indigo-500/15', border: 'border-l-4 border-indigo-500', text: 'text-indigo-800 dark:text-indigo-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-500/15', border: 'border-l-4 border-emerald-500', text: 'text-emerald-800 dark:text-emerald-300' },
  { bg: 'bg-amber-100 dark:bg-amber-500/15', border: 'border-l-4 border-amber-500', text: 'text-amber-800 dark:text-amber-300' },
  { bg: 'bg-rose-100 dark:bg-rose-500/15', border: 'border-l-4 border-rose-500', text: 'text-rose-800 dark:text-rose-300' },
  { bg: 'bg-cyan-100 dark:bg-cyan-500/15', border: 'border-l-4 border-cyan-500', text: 'text-cyan-800 dark:text-cyan-300' },
  { bg: 'bg-violet-100 dark:bg-violet-500/15', border: 'border-l-4 border-violet-500', text: 'text-violet-800 dark:text-violet-300' },
  { bg: 'bg-orange-100 dark:bg-orange-500/15', border: 'border-l-4 border-orange-500', text: 'text-orange-800 dark:text-orange-300' },
  { bg: 'bg-pink-100 dark:bg-pink-500/15', border: 'border-l-4 border-pink-500', text: 'text-pink-800 dark:text-pink-300' },
];

function getColor(subjectId) {
  return SUBJECT_COLORS[(subjectId || 0) % SUBJECT_COLORS.length];
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

// ── Delete Confirmation Overlay (inline, no confirm() dialog needed) ─────────
function DeleteConfirm({ entry, onConfirm, onCancel }) {
  const color = getColor(entry.subjectId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-background border border-border rounded-xl shadow-2xl p-5 w-80 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.bg} ${color.border}`}>
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
              const c = getColor(a.subjectId);
              return (
                <div
                  key={a.id}
                  draggable
                  onDragStart={e => handleDragStart(e, a)}
                  className={`px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none transition-all hover:scale-[1.02] hover:shadow-md ${c.bg} ${c.border}`}
                >
                  <div className={`text-sm font-semibold ${c.text}`}>{a.subjectCode}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {a.facultyName || a.facultyCollegeId} · {remaining} left
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Schedule Grid ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-muted/30">
              <th className="p-2 text-xs font-semibold text-muted-foreground border-b border-r border-border/30 w-16 text-center">
                <Clock className="w-4 h-4 mx-auto" />
              </th>
              {DAYS.map(d => (
                <th key={d} className="p-2 text-xs font-semibold text-muted-foreground border-b border-r border-border/30 text-center uppercase tracking-wider">
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
                      <td colSpan={DAYS.length + 1} className="text-center text-[10px] text-muted-foreground/60 py-1 bg-muted/10 border-b border-border/20 italic">
                        — Lunch Break (1:00 – 2:00 PM) —
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2 text-[11px] font-mono text-muted-foreground text-center border-r border-b border-border/20 bg-muted/10 whitespace-nowrap">
                      {slot.label}
                    </td>
                    {DAYS.map(day => {
                      const cellKey = `${day}|${slot.start}`;
                      const entry = entryMap[cellKey];
                      const isHover = hoverCell === cellKey;
                      const c = entry ? getColor(entry.subjectId) : null;

                      return (
                        <td
                          key={cellKey}
                          className={`border-r border-b border-border/20 p-1 h-[72px] align-top transition-colors relative overflow-visible
                            ${isHover ? 'bg-indigo-500/10 ring-2 ring-inset ring-indigo-500/40' : 'hover:bg-muted/20'}
                          `}
                          onDragOver={e => handleDragOver(e, day, slot)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, day, slot)}
                        >
                          {entry ? (
                            /* Entry card — click anywhere on it to delete */
                            <div
                              className={`h-full rounded-md p-1.5 relative cursor-pointer group/card ${c.bg} ${c.border}`}
                              title="Click to remove"
                              onClick={() => setDeleteModal(entry)}
                            >
                              {/* Hover indicator */}
                              <div className="absolute inset-0 bg-red-500/0 group-hover/card:bg-red-500/8 rounded-md transition-colors flex items-start justify-end p-1 pointer-events-none">
                                <X className="w-3.5 h-3.5 text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                              </div>
                              <div className={`text-[11px] font-semibold truncate ${c.text}`}>
                                {entry.subjectCode || entry.subjectName}
                              </div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{entry.roomName}</div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{entry.facultyName}</div>
                            </div>
                          ) : (
                            isHover && (
                              <div className="h-full flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] text-indigo-400 font-medium">Drop here</span>
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

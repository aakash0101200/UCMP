import React, { useState, useEffect } from 'react';
import { getSectionSchedule, getFacultySchedule, getResolvedSectionSchedule, getResolvedFacultySchedule, cancelClass, getAcademicTerms } from '../../Services/timetable';
import { getProfile } from '../../Services/profile';
import { getActiveRole } from '../../Services/auth';
import { Clock, MapPin, User, BookOpen, AlertCircle, Loader2, LayoutGrid, List, AlertTriangle, X, HelpCircle, Layers, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat' };
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', // Lunch
  '14:00', '15:00', '16:00'
];

const SUBJECT_COLORS = [
  { bg: 'bg-indigo-500/15 dark:bg-indigo-500/25', border: 'border-indigo-500/40', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  { bg: 'bg-emerald-500/15 dark:bg-emerald-500/25', border: 'border-emerald-500/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-500/15 dark:bg-amber-500/25', border: 'border-amber-500/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  { bg: 'bg-rose-500/15 dark:bg-rose-500/25', border: 'border-rose-500/40', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-500/15 dark:bg-cyan-500/25', border: 'border-cyan-500/40', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
  { bg: 'bg-violet-500/15 dark:bg-violet-500/25', border: 'border-violet-500/40', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  { bg: 'bg-orange-500/15 dark:bg-orange-500/25', border: 'border-orange-500/40', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  { bg: 'bg-pink-500/15 dark:bg-pink-500/25', border: 'border-pink-500/40', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
];

function getSubjectColor(subjectCode, colorMap) {
  if (!colorMap.has(subjectCode)) {
    colorMap.set(subjectCode, SUBJECT_COLORS[colorMap.size % SUBJECT_COLORS.length]);
  }
  return colorMap.get(subjectCode);
}

function getCurrentDay() {
  return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getDay()];
}

function isCurrentSlot(day, timeStr) {
  const now = new Date();
  if (day !== getCurrentDay()) return false;
  return now.getHours() === parseInt(timeStr.split(':')[0]);
}

function getDatesForCurrentWeek() {
  const current = new Date();
  const day = current.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);

  const dates = {};
  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    dates[dayNames[i]] = `${year}-${month}-${date}`;
  }
  return dates;
}

function getOverrideTooltip(entry) {
  if (!entry) return undefined;
  if (entry.isCancelled) return `CANCELLED: ${entry.overrideReason || 'No reason provided'}`;
  let tooltip = '';
  if (entry.isSubstituted) {
    tooltip += `SUBSTITUTED: ${entry.originalFacultyName || 'Original'} replaced by ${entry.facultyName || 'Substitute'}. `;
  }
  if (entry.isRoomChanged) {
    tooltip += `ROOM SHIFT: Originally ${entry.originalRoomName || 'Original Room'}, moved to ${entry.roomName || 'New Room'}. `;
  }
  if (entry.overrideType === 'MERGED_CLASS') {
    tooltip += `MERGED: Combined with sections ${entry.mergedSectionNames?.join(', ') || 'N/A'}. `;
  }
  if (entry.overrideReason) {
    tooltip += `Reason: ${entry.overrideReason}`;
  }
  return tooltip || undefined;
}

// Hook: detect mobile screen
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

export default function WeeklyScheduleGrid({ term = '2026-27-ODD' }) {
  const isMobile = useIsMobile();
  const [selectedTerm, setSelectedTerm] = useState(term);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'grid');
  const [mobileDay, setMobileDay] = useState(getCurrentDay()); // Mobile: show one day at a time
  const role = getActiveRole();

  useEffect(() => {
    setSelectedTerm(term);
  }, [term]);

  useEffect(() => {
    async function loadTerms() {
      try {
        const res = await getAcademicTerms();
        if (res.data && res.data.length > 0) {
          setAvailableTerms(res.data);
          if (!res.data.includes(term)) {
            setSelectedTerm(res.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load academic terms in grid:", err);
      }
    }
    loadTerms();
  }, []);

  // Cancellation Modal States
  const [selectedEntryForCancel, setSelectedEntryForCancel] = useState(null);
  const [cancellationDate, setCancellationDate] = useState(new Date().toISOString().substring(0, 10));
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleOpenCancelModal = (entry) => {
    if (role !== 'FACULTY') return;
    setSelectedEntryForCancel(entry);
    setCancellationDate(new Date().toISOString().substring(0, 10));
    setCancellationReason('');
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntryForCancel) return;
    setIsSubmittingCancel(true);
    try {
      await cancelClass(selectedEntryForCancel.id, {
        cancellationDate,
        reason: cancellationReason
      });
      toast.success(`Class successfully cancelled for ${cancellationDate}`);
      setSelectedEntryForCancel(null);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data || "Failed to cancel class";
      toast.error(typeof errMsg === 'string' ? errMsg : "Failed to cancel class");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Auto-switch to list on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'grid') setViewMode('list');
  }, [isMobile]);

  useEffect(() => {
    async function fetchSchedule() {
      setLoading(true);
      setError(null);
      try {
        const collegeId = localStorage.getItem('collegeId');
        const profileRes = await getProfile(collegeId);
        const profile = profileRes.data;

        let resEntries = [];
        const weekDates = getDatesForCurrentWeek();

        if (role === 'STUDENT' && profile.student?.sectionId) {
          const promises = Object.values(weekDates).map(dateStr =>
            getResolvedSectionSchedule(profile.student.sectionId, dateStr, selectedTerm)
              .then(res => res.data || [])
              .catch(err => {
                console.error(`Failed to load resolved section schedule for ${dateStr}:`, err);
                return [];
              })
          );
          const results = await Promise.all(promises);
          resEntries = results.flat();
        } else if (role === 'FACULTY' && profile.faculty?.facultyId) {
          const promises = Object.values(weekDates).map(dateStr =>
            getResolvedFacultySchedule(profile.faculty.facultyId, dateStr, selectedTerm)
              .then(res => res.data || [])
              .catch(err => {
                console.error(`Failed to load resolved faculty schedule for ${dateStr}:`, err);
                return [];
              })
          );
          const results = await Promise.all(promises);
          resEntries = results.flat();
        } else {
          setError('No schedule data available for your role.');
          setLoading(false);
          return;
        }
        setEntries(resEntries);
      } catch (err) {
        console.error('Failed to load schedule:', err);
        setError('Failed to load schedule. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [role, selectedTerm]);

  // Build lookup: "MONDAY|09:00" → entry
  // Backend sends startTime as "09:00:00" (with seconds), normalize to "09:00"
  const scheduleMap = {};
  const colorMap = new Map();
  entries.forEach((e) => {
    const normalizedTime = e.startTime?.substring(0, 5);
    const key = `${e.day}|${normalizedTime}`;
    scheduleMap[key] = e;
  });

  const today = getCurrentDay();

  // ─── Loading / Error / Empty states ────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-muted-foreground">Loading schedule...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            {role === 'STUDENT' ? 'My Class Schedule' : 'My Teaching Schedule'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Term:</span>
            {availableTerms.length > 0 ? (
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="text-xs border border-border/50 rounded px-1.5 py-0.5 bg-background text-foreground shadow-sm font-medium focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {availableTerms.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ) : (
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{selectedTerm}</span>
            )}
            <span className="text-xs text-muted-foreground ml-2">{entries.length} classes/week</span>
          </div>
        </div>
        {/* View toggle — hide grid option on mobile */}
        {entries.length > 0 && (
          <div className="flex gap-1 bg-muted rounded-lg p-1 self-start sm:self-auto">
            {!isMobile && (
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5
                  ${viewMode === 'grid' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
            )}
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5
                ${viewMode === 'list' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 border border-dashed border-border/50 rounded-xl bg-background">
          <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-muted-foreground font-semibold">No schedule found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Timetable for term <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{selectedTerm}</span> hasn't been generated yet.
          </p>
        </div>
      ) : (
        <>
          {/* ─── MOBILE DAY PICKER (only in list mode on mobile) ──────────── */}
          {isMobile && viewMode === 'list' && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setMobileDay('ALL')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full transition-all
              ${mobileDay === 'ALL' ? 'bg-indigo-500 text-white font-medium shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            All
          </button>
          {DAYS.map(day => {
            const hasClasses = entries.some(e => e.day === day);
            return (
              <button
                key={day}
                onClick={() => setMobileDay(day)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full transition-all relative
                  ${mobileDay === day
                    ? 'bg-indigo-500 text-white font-medium shadow-sm'
                    : day === today
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                  ${!hasClasses ? 'opacity-50' : ''}`}
              >
                {DAY_SHORT[day]}
                {day === today && mobileDay !== day && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {viewMode === 'grid' ? (
        /* ─── GRID VIEW (tablet+desktop) ───────────────────────────────── */
        <div className="overflow-x-auto rounded-xl border border-border/50 bg-background">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="w-16 lg:w-20 px-2 lg:px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-left border-b border-border/50 sticky left-0 bg-background z-10">
                  <Clock className="h-3.5 w-3.5 inline mr-1" />Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`px-1 lg:px-2 py-3 text-xs font-medium uppercase tracking-wider text-center border-b border-border/50 transition-colors
                      ${day === today ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-muted-foreground'}`}
                  >
                    {DAY_SHORT[day]}
                    {day === today && <span className="block text-[10px] font-normal">Today</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => {
                const isLunch = time === '13:00';
                return (
                  <tr key={time} className={isLunch ? 'bg-muted/30' : ''}>
                    <td className="px-2 lg:px-3 py-1 text-xs font-mono text-muted-foreground border-r border-border/30 whitespace-nowrap sticky left-0 bg-background z-10">
                      {time}
                    </td>
                    {DAYS.map((day) => {
                      if (isLunch) {
                        return day === 'MONDAY' ? (
                          <td key={day} colSpan={6} className="text-center py-2 text-xs text-muted-foreground italic">
                            🍽️ Lunch Break
                          </td>
                        ) : null;
                      }
                      const entry = scheduleMap[`${day}|${time}`];
                      const isCurrent = isCurrentSlot(day, time);
                      if (!entry) {
                        return (
                          <td key={day} className={`p-0.5 lg:p-1 border border-border/20 ${day === today ? 'bg-indigo-500/5' : ''}`}>
                            <div className="h-14 lg:h-16" />
                          </td>
                        );
                      }
                      const colors = getSubjectColor(entry.subjectCode, colorMap);
                      const isCancelled = entry.isCancelled;
                      const tooltip = getOverrideTooltip(entry);
                      
                      // Soft-red background/border if cancelled
                      const cellBg = isCancelled 
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30' 
                        : `${colors.bg} ${colors.border}`;
                      const textStyle = isCancelled 
                        ? 'line-through text-rose-700/60 dark:text-rose-400/60' 
                        : colors.text;

                      const badges = [];
                      if (entry.isCancelled) badges.push({ text: 'Cancelled', class: 'bg-rose-500/25 text-rose-700 dark:text-rose-400 border-rose-500/30' });
                      if (entry.isSubstituted) badges.push({ text: 'Sub', class: 'bg-amber-500/25 text-amber-700 dark:text-amber-400 border-amber-500/30' });
                      if (entry.isRoomChanged) badges.push({ text: 'Room', class: 'bg-blue-500/25 text-blue-700 dark:text-blue-400 border-blue-500/30' });
                      if (entry.isTimeChanged) badges.push({ text: 'Shift', class: 'bg-purple-500/25 text-purple-700 dark:text-purple-400 border-purple-500/30' });
                      if (entry.overrideType === 'MERGED_CLASS') badges.push({ text: 'Merged', class: 'bg-teal-500/25 text-teal-700 dark:text-teal-400 border-teal-500/30' });
                      if (entry.entryType === 'EXTRA' || entry.overrideType === 'EXTRA_CLASS') badges.push({ text: 'Extra', class: 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' });

                      return (
                        <td key={day} className="p-0.5 lg:p-1 border border-border/20">
                          <div 
                            onClick={() => handleOpenCancelModal(entry)}
                            title={tooltip}
                            className={`relative rounded-lg p-1.5 lg:p-2 h-14 lg:h-16 ${cellBg} transition-all hover:scale-[1.02] overflow-hidden
                              ${role === 'FACULTY' ? 'cursor-pointer hover:border-red-500/50' : 'cursor-default'}
                              ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-background' : ''}`}
                          >
                            {isCurrent && !isCancelled && (
                              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            )}
                            
                            {/* Tiny Badges Indicator */}
                            <div className="absolute top-1 right-1 flex gap-0.5">
                              {badges.map((b, idx) => (
                                <span key={idx} className={`text-[6px] lg:text-[7px] font-bold px-0.5 lg:px-1 py-0.2 rounded border ${b.class}`}>
                                  {b.text}
                                </span>
                              ))}
                            </div>

                            <p className={`text-[10px] lg:text-xs font-semibold truncate ${textStyle}`}>
                              {entry.subjectCode}
                            </p>
                            <p className={`text-[9px] lg:text-[10px] text-muted-foreground truncate mt-0.5 ${isCancelled ? 'line-through' : ''}`}>
                              {entry.subjectName}
                            </p>
                            <div className="flex items-center gap-1 lg:gap-2 mt-0.5 lg:mt-1">
                              <span className={`text-[9px] lg:text-[10px] text-muted-foreground flex items-center gap-0.5 truncate ${isCancelled ? 'line-through' : ''}`}>
                                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                {entry.isRoomChanged ? (
                                  <span className="truncate">
                                    <span className="line-through text-muted-foreground/60 mr-0.5">{entry.originalRoomName}</span>
                                    <strong className="text-foreground font-semibold dark:text-white">{entry.roomName}</strong>
                                  </span>
                                ) : (
                                  <span className="truncate">{entry.roomName}</span>
                                )}
                              </span>
                              {role === 'STUDENT' && (
                                <span className={`text-[9px] lg:text-[10px] text-muted-foreground items-center gap-0.5 hidden xl:flex truncate ${isCancelled ? 'line-through' : ''}`}>
                                  <User className="h-2.5 w-2.5 flex-shrink-0" />
                                  {entry.isSubstituted ? (
                                    <span className="truncate">
                                      <span className="line-through text-muted-foreground/60 mr-0.5">{entry.originalFacultyName?.split(' ')[0]}</span>
                                      <strong className="text-foreground font-semibold dark:text-white">{entry.facultyName?.split(' ')[0]}</strong>
                                    </span>
                                  ) : (
                                    <span className="truncate">{entry.facultyName?.split(' ')[0]}</span>
                                  )}
                                </span>
                              )}
                              {role === 'FACULTY' && (
                                <span className={`text-[9px] lg:text-[10px] text-muted-foreground items-center gap-0.5 hidden xl:flex truncate ${isCancelled ? 'line-through' : ''}`}>
                                  {entry.sectionName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ─── LIST VIEW (all screens) ──────────────────────────────────── */
        <div className="space-y-4">
          {DAYS
            .filter(day => {
              if (isMobile && mobileDay !== 'ALL') return day === mobileDay;
              return entries.some(e => e.day === day);
            })
            .map((day) => {
              const dayEntries = entries
                .filter(e => e.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (dayEntries.length === 0 && isMobile && mobileDay === day) {
                return (
                  <div key={day} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No classes on {DAY_SHORT[day]}</p>
                  </div>
                );
              }
              if (dayEntries.length === 0) return null;

              return (
                <div key={day}>
                  <h3 className={`text-sm font-semibold mb-2 ${day === today ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`}>
                    {day === today ? `📍 ${DAY_SHORT[day]} — Today` : DAY_SHORT[day]}
                  </h3>
                  <div className="space-y-2">
                    {dayEntries.map((entry) => {
                      const colors = getSubjectColor(entry.subjectCode, colorMap);
                      const isCancelled = entry.isCancelled;
                      const tooltip = getOverrideTooltip(entry);
                      const startNorm = entry.startTime?.substring(0, 5);
                      const endNorm = entry.endTime?.substring(0, 5);

                      // Soft-red background/border if cancelled
                      const cellBg = isCancelled 
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30' 
                        : `${colors.bg} ${colors.border}`;
                      const textStyle = isCancelled 
                        ? 'line-through text-rose-700/60 dark:text-rose-400/60 font-semibold truncate' 
                        : `font-semibold truncate ${colors.text}`;

                      const badges = [];
                      if (entry.isCancelled) badges.push({ text: 'Cancelled', class: 'bg-rose-500/25 text-rose-700 dark:text-rose-400 border-rose-500/30' });
                      if (entry.isSubstituted) badges.push({ text: 'Subbed', class: 'bg-amber-500/25 text-amber-700 dark:text-amber-400 border-amber-500/30' });
                      if (entry.isRoomChanged) badges.push({ text: 'Room Shift', class: 'bg-blue-500/25 text-blue-700 dark:text-blue-400 border-blue-500/30' });
                      if (entry.isTimeChanged) badges.push({ text: 'Time Shift', class: 'bg-purple-500/25 text-purple-700 dark:text-purple-400 border-purple-500/30' });
                      if (entry.overrideType === 'MERGED_CLASS') badges.push({ text: 'Merged', class: 'bg-teal-500/25 text-teal-700 dark:text-teal-400 border-teal-500/30' });
                      if (entry.entryType === 'EXTRA' || entry.overrideType === 'EXTRA_CLASS') badges.push({ text: 'Extra Class', class: 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' });

                      return (
                        <div 
                          key={entry.id} 
                          onClick={() => handleOpenCancelModal(entry)}
                          title={tooltip}
                          className={`flex items-center gap-3 sm:gap-4 rounded-xl p-2.5 sm:p-3 ${cellBg} transition-all
                            ${role === 'FACULTY' ? 'cursor-pointer hover:border-red-500/50 hover:scale-[1.01]' : ''}`}
                        >
                          <div className={`text-center min-w-[50px] sm:min-w-[60px] ${isCancelled ? 'line-through text-muted-foreground/60' : ''}`}>
                            <p className="text-xs font-mono font-bold">{startNorm}</p>
                            <p className="text-[10px] text-muted-foreground">{endNorm}</p>
                          </div>
                          <div className={`w-1 h-10 rounded-full flex-shrink-0 ${isCancelled ? 'bg-rose-500/40' : colors.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm ${textStyle}`}>{entry.subjectName}</p>
                              {badges.map((b, idx) => (
                                <span key={idx} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border leading-none ${b.class}`}>
                                  {b.text}
                                </span>
                              ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                              <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isCancelled ? 'line-through' : ''}`}>
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                {entry.isRoomChanged ? (
                                  <span>
                                    <span className="line-through text-muted-foreground/60 mr-1">{entry.originalRoomName}</span>
                                    <strong className="text-foreground dark:text-white font-semibold">{entry.roomName}</strong>
                                  </span>
                                ) : (
                                  entry.roomName
                                )}
                              </span>
                              <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isCancelled ? 'line-through' : ''}`}>
                                <User className="h-3.5 w-3.5 flex-shrink-0" />
                                {role === 'STUDENT' ? (
                                  entry.isSubstituted ? (
                                    <span>
                                      <span className="line-through text-muted-foreground/60 mr-1">{entry.originalFacultyName}</span>
                                      <strong className="text-foreground dark:text-white font-semibold">{entry.facultyName}</strong>
                                    </span>
                                  ) : (
                                    entry.facultyName
                                  )
                                ) : (
                                  entry.sectionName
                                )}
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded hidden sm:block ${isCancelled ? 'line-through' : ''}`}>
                            {entry.subjectCode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
        </>
      )}

      {/* Subject Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 border-t border-border/30">
        {[...colorMap.entries()].map(([code, colors]) => (
          <div key={code} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
            <span className="text-xs text-muted-foreground">{code}</span>
          </div>
        ))}
      </div>

      {/* Cancellation Modal */}
      {selectedEntryForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Cancel Class Exception</h3>
              </div>
              <button
                onClick={() => setSelectedEntryForCancel(null)}
                className="text-neutral-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6 p-4 bg-neutral-950/60 rounded-xl border border-neutral-850">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Class</span>
                <p className="text-sm font-bold text-white">{selectedEntryForCancel.subjectName} ({selectedEntryForCancel.subjectCode})</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Section</span>
                  <p className="text-xs text-neutral-300">{selectedEntryForCancel.sectionName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Time</span>
                  <p className="text-xs text-neutral-300 font-mono">{selectedEntryForCancel.startTime?.substring(0, 5)} - {selectedEntryForCancel.endTime?.substring(0, 5)}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Cancellation Date</label>
                <input
                  type="date"
                  required
                  value={cancellationDate}
                  onChange={e => setCancellationDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Reason for Cancellation</label>
                <textarea
                  required
                  placeholder="e.g. Faculty on official duty, guest lecture scheduled..."
                  value={cancellationReason}
                  onChange={e => setCancellationReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-[11px] text-red-400 leading-relaxed">
                <strong>Attention:</strong> Submitting this cancellation will immediately cancel this day's class, update status, and broadcast alert notifications to all enrolled students.
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEntryForCancel(null)}
                  className="px-4 py-2 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Keep Scheduled
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingCancel ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

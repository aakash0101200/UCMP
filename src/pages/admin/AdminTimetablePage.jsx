import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, AlertCircle, Plus, Loader2, BookOpen, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getAllSubjects,
  getAllSections,
  getAllFaculties,
  getAllRooms,
  createAssignment,
  getAssignments,
  deleteAssignment,
  getSectionSchedule,
  deleteTimetableEntry
} from '../../Services/timetable';
import ScheduleGrid from '../../components/Timetable/ScheduleGrid';

export default function AdminTimetablePage() {
  const [term, setTerm] = useState('2026-27-ODD');

  // Data lists
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected section for the grid view
  const [selectedSection, setSelectedSection] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    subjectId: '',
    sectionId: '',
    facultyId: '',
    weeklySlots: 4
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Inline delete confirmation state (replaces window.confirm)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [term]);

  // When selected section changes, fetch its schedule
  useEffect(() => {
    if (selectedSection) {
      fetchEntries();
    } else {
      setEntries([]);
    }
  }, [selectedSection, term]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subs, secs, facs, rms, assigns] = await Promise.all([
        getAllSubjects(),
        getAllSections(),
        getAllFaculties(),
        getAllRooms(),
        getAssignments(term)
      ]);
      setSubjects(subs.data || []);
      setSections(secs.data || []);
      setFaculties(facs.data || []);
      setRooms(rms.data || []);
      setAssignments(assigns.data || []);

      // Auto-select first section if none selected
      if (!selectedSection && secs.data?.length > 0) {
        setSelectedSection(String(secs.data[0].id));
      }
    } catch (error) {
      console.error("Error fetching timetable data:", error);
      toast.error("Failed to load timetable data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!selectedSection) return;
    try {
      const res = await getSectionSchedule(selectedSection, term);
      setEntries(res.data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setEntries([]);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.sectionId || !formData.facultyId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAssignment({
        subjectId: parseInt(formData.subjectId),
        sectionId: parseInt(formData.sectionId),
        facultyId: parseInt(formData.facultyId),
        academicTerm: term,
        weeklySlots: parseInt(formData.weeklySlots)
      });
      toast.success("Subject assignment created successfully!");
      setFormData({ subjectId: '', sectionId: '', facultyId: '', weeklySlots: 4 });
      const assigns = await getAssignments(term);
      setAssignments(assigns.data || []);
    } catch (error) {
      console.error("Assignment creation error:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await deleteAssignment(deleteConfirmId);
      toast.success('Assignment deleted');
      setDeleteConfirmId(null);
      const assigns = await getAssignments(term);
      setAssignments(assigns.data || []);
    } catch {
      toast.error('Failed to delete assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEntryChange = useCallback(() => {
    fetchEntries();
    // Refresh assignments too (to update slot counts)
    getAssignments(term).then(r => setAssignments(r.data || [])).catch(() => { });
  }, [selectedSection, term]);

  // Filter assignments by selected section for the grid
  const gridAssignments = selectedSection
    ? assignments.filter(a => String(a.sectionId) === String(selectedSection))
    : [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Timetable Builder</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage subject assignments and master schedules for term <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{term}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="text-sm border border-border/50 rounded-md px-3 py-1.5 bg-background shadow-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="2026-27-ODD">2026-27 ODD Term</option>
              <option value="2026-27-EVEN">2026-27 EVEN Term</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* ─── LEFT COLUMN: ASSIGNMENT CREATOR ──────────────────────────── */}
          <div className="xl:col-span-1 space-y-4">
            <div className="p-4 sm:p-5 bg-background border border-border/50 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> New Assignment
              </h3>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
                  <select
                    className="w-full text-sm border border-border/50 rounded-lg px-3 py-2 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section</label>
                  <select
                    className="w-full text-sm border border-border/50 rounded-lg px-3 py-2 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    required
                  >
                    <option value="">Select Section...</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Faculty</label>
                  <select
                    className="w-full text-sm border border-border/50 rounded-lg px-3 py-2 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    required
                  >
                    <option value="">Select Faculty...</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    Weekly Slots <span>{formData.weeklySlots}</span>
                  </label>
                  <input
                    type="range" min="1" max="8" step="1"
                    value={formData.weeklySlots}
                    onChange={(e) => setFormData({ ...formData, weeklySlots: e.target.value })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Assign Subject
                </button>
              </form>
            </div>

            {/* List of Draft Assignments */}
            <div className="p-4 bg-background border border-border/50 rounded-xl shadow-sm max-h-[400px] overflow-y-auto scrollbar-hide">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground flex items-center justify-between">
                Draft Assignments
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 py-0.5 px-2 rounded-full text-[10px]">
                  {assignments.length} Total
                </span>
              </h3>

              {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted-foreground text-xs">
                  No assignments created for this term yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.map(a => (
                    <div key={a.id} className="p-2.5 border border-border/50 rounded-lg hover:border-indigo-500/30 transition-colors bg-muted/10 group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm truncate pr-2" title={a.subjectName}>{a.subjectCode || 'Sub'}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono bg-background border border-border px-1.5 rounded text-muted-foreground">
                            {a.weeklySlots} slots
                          </span>
                          <button
                            onClick={() => setDeleteConfirmId(a.id)}
                            className="p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{a.facultyName || a.facultyCollegeId || `F${a.facultyId}`}</span>
                        <span className="flex items-center gap-0.5 font-medium px-1.5 bg-muted rounded">{a.sectionName || `S${a.sectionId}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: MASTER SCHEDULE CANVAS ─────────────────────── */}
          <div className="xl:col-span-3">
            <div className="p-4 bg-background border border-border/50 rounded-xl shadow-sm">

              {/* Section Picker + Refresh */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-sm">Schedule for:</h3>
                  <select
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                    className="text-sm border border-border/50 rounded-lg px-3 py-1.5 bg-muted/20 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="">Select Section...</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => { fetchEntries(); fetchData(); }}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {!selectedSection ? (
                <div className="min-h-[500px] flex flex-col items-center justify-center text-center">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground/20 mb-4" />
                  <h3 className="text-xl font-medium">Master Schedule Canvas</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-2">
                    Select a section above to view and edit its weekly schedule. Drag assignments from the left panel onto the grid.
                  </p>
                </div>
              ) : (
                <ScheduleGrid
                  entries={entries}
                  assignments={gridAssignments}
                  rooms={rooms}
                  term={term}
                  sectionId={parseInt(selectedSection)}
                  onEntryChange={handleEntryChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Delete Assignment Confirmation Modal ──────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-background border border-border rounded-xl shadow-2xl p-5 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-500/15">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="font-semibold text-sm">Delete Assignment</div>
                <div className="text-xs text-muted-foreground">This will not remove placed entries.</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this subject assignment?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAssignment}
                disabled={isDeleting}
                className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
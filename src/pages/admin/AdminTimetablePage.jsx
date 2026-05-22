import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  Plus, 
  Loader2, 
  BookOpen, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Search, 
  Shuffle, 
  X, 
  Layers, 
  Users, 
  ShieldAlert,
  Edit
} from 'lucide-react';
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
  getResolvedSectionSchedule,
  getResolvedFacultySchedule,
  getFacultyAvailability,
  createOverride,
  cancelOverride,
  getAocsMetrics,
  getAcademicTerms,
  createRoom,
  updateRoom,
  deleteRoom
} from '../../Services/timetable';

import ScheduleGrid from '../../components/Timetable/ScheduleGrid';

export default function AdminTimetablePage() {
  const [term, setTerm] = useState('2026-27-ODD');
  const [availableTerms, setAvailableTerms] = useState([]);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' or 'aocs'

  // Master Data Lists
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected section for the grid view
  const [selectedSection, setSelectedSection] = useState('');

  // Assignment Form State
  const [formData, setFormData] = useState({
    subjectId: '',
    sectionId: '',
    facultyId: '',
    weeklySlots: 4
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AOCS: Faculty Absence and Substitutions State
  const [selectedAbsFaculty, setSelectedAbsFaculty] = useState('');
  const [absDate, setAbsDate] = useState(new Date().toISOString().substring(0, 10));
  const [absFacultySchedule, setAbsFacultySchedule] = useState([]);
  const [loadingAbsSchedule, setLoadingAbsSchedule] = useState(false);

  // AOCS: Substitution Smart Selector States
  const [substitutionSlot, setSubstitutionSlot] = useState(null); // { entryId, subjectId, subjectName, startTime, endTime, date, sectionId }
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [customReason, setCustomReason] = useState('Faculty Unavailability');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  // AOCS: General Manual Override States
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [manualOverrideType, setManualOverrideType] = useState('ROOM_CHANGE');
  const [manualOverrideForm, setManualOverrideForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    timetableEntryId: '',
    newFacultyId: '',
    newRoomId: '',
    subjectId: '',
    sectionIds: [],
    newStartTime: '09:00',
    newEndTime: '10:00',
    reason: '',
    isRecurring: false,
    recurringPattern: 'WEEKLY',
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveTo: ''
  });

  // AOCS: Live Operational Metrics
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // AOCS: Searchable Slot Selector States
  const [manualOverrideSectionId, setManualOverrideSectionId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotSearchQuery, setSlotSearchQuery] = useState('');

  // Fetch slots for manual override slot picker
  useEffect(() => {
    if (manualOverrideSectionId && manualOverrideForm.date && showOverrideModal) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await getResolvedSectionSchedule(manualOverrideSectionId, manualOverrideForm.date, term);
          setAvailableSlots(res.data || []);
        } catch (err) {
          console.error("Error loading slots:", err);
          toast.error("Failed to load schedule slots for section");
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [manualOverrideSectionId, manualOverrideForm.date, term, showOverrideModal]);

  const closeOverrideModal = () => {
    setShowOverrideModal(false);
    setManualOverrideSectionId('');
    setSlotSearchQuery('');
    setAvailableSlots([]);
    setManualOverrideForm({
      date: new Date().toISOString().substring(0, 10),
      timetableEntryId: '',
      newFacultyId: '',
      newRoomId: '',
      subjectId: '',
      sectionIds: [],
      newStartTime: '09:00',
      newEndTime: '10:00',
      reason: '',
      isRecurring: false,
      recurringPattern: 'WEEKLY',
      effectiveFrom: new Date().toISOString().substring(0, 10),
      effectiveTo: ''
    });
  };

  // Room Management States
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomFilterType, setRoomFilterType] = useState('ALL');
  const [roomFilterStatus, setRoomFilterStatus] = useState('ALL');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    building: '',
    capacity: '',
    type: 'LECTURE_HALL',
    status: 'AVAILABLE'
  });
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [deleteRoomConfirmId, setDeleteRoomConfirmId] = useState(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);


  // Load dynamic academic terms on mount
  useEffect(() => {
    async function loadTerms() {
      try {
        const res = await getAcademicTerms();
        if (res.data && res.data.length > 0) {
          setAvailableTerms(res.data);
          if (!res.data.includes(term)) {
            setTerm(res.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load academic terms:", err);
      }
    }
    loadTerms();
  }, []);

  // Load master data on mount or term change
  useEffect(() => {
    fetchData();
  }, [term]);

  // Fetch resolved schedules for selected section or faculty when page state changes
  useEffect(() => {
    if (selectedSection && activeTab === 'canvas') {
      fetchEntries();
    }
  }, [selectedSection, term, activeTab]);

  useEffect(() => {
    if (selectedAbsFaculty && absDate && activeTab === 'aocs') {
      fetchAbsFacultySchedule();
    } else {
      setAbsFacultySchedule([]);
    }
  }, [selectedAbsFaculty, absDate, term, activeTab]);

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await getAocsMetrics(term);
      setMetrics(res.data);
    } catch (error) {
      console.error("Error fetching AOCS metrics:", error);
    } finally {
      setLoadingMetrics(false);
    }
  }, [term]);

  useEffect(() => {
    if (activeTab === 'aocs') {
      fetchMetrics();
    }
  }, [term, activeTab, fetchMetrics]);

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

      // Auto-select first section
      if (!selectedSection && secs.data?.length > 0) {
        setSelectedSection(String(secs.data[0].id));
      }
      // Auto-select first faculty for absence coordinator
      if (!selectedAbsFaculty && facs.data?.length > 0) {
        setSelectedAbsFaculty(String(facs.data[0].id));
      }
    } catch (error) {
      console.error("Error fetching timetable data:", error);
      toast.error("Failed to load master timetable data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!selectedSection) return;
    try {
      // For the drag-and-drop canvas, get template schedule
      const res = await getSectionSchedule(selectedSection, term);
      setEntries(res.data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setEntries([]);
    }
  };

  const fetchAbsFacultySchedule = async () => {
    if (!selectedAbsFaculty || !absDate) return;
    setLoadingAbsSchedule(true);
    try {
      const res = await getResolvedFacultySchedule(selectedAbsFaculty, absDate, term);
      setAbsFacultySchedule(res.data || []);
    } catch (error) {
      console.error("Error fetching resolved faculty schedule:", error);
      setAbsFacultySchedule([]);
      toast.error("Failed to load faculty schedule for selected date");
    } finally {
      setLoadingAbsSchedule(false);
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
    getAssignments(term).then(r => setAssignments(r.data || [])).catch(() => { });
  }, [selectedSection, term]);

  // AOCS: Register direct cancellation override
  const handleCancelSlot = async (slot) => {
    const reason = window.prompt("Reason for cancelling this slot:", "Faculty unavailability");
    if (reason === null) return; // Cancelled prompt
    
    setLoadingAbsSchedule(true);
    try {
      await createOverride({
        timetableEntryId: slot.id,
        overrideDate: absDate,
        overrideType: 'CANCELLED',
        academicTerm: term,
        reason: reason || "Cancelled class"
      });
      toast.success("Class cancellation registered successfully!");
      fetchAbsFacultySchedule();
      fetchMetrics();
    } catch (error) {
      console.error("Cancellation override error:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to register cancellation");
    } finally {
      setLoadingAbsSchedule(false);
    }
  };

  // AOCS: Smart Substitute availability retrieval
  const handleOpenSubstitutionSmartSelector = async (slot) => {
    setSubstitutionSlot(slot);
    setLoadingCandidates(true);
    setAvailableCandidates([]);
    try {
      const startTimeNorm = slot.startTime?.substring(0, 5);
      const endTimeNorm = slot.endTime?.substring(0, 5);
      
      const res = await getFacultyAvailability(
        absDate,
        startTimeNorm,
        endTimeNorm,
        slot.subjectId,
        term
      );
      setAvailableCandidates(res.data || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load available faculty candidates");
      setSubstitutionSlot(null);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // AOCS: Submit substitution override
  const handleConfirmSubstitution = async (candidateId) => {
    if (!substitutionSlot) return;
    setSubmittingOverride(true);
    try {
      await createOverride({
        timetableEntryId: substitutionSlot.id,
        overrideDate: absDate,
        overrideType: 'SUBSTITUTE',
        newFacultyId: candidateId,
        academicTerm: term,
        reason: customReason || "Faculty substitution"
      });
      toast.success("Substitution override created successfully!");
      setSubstitutionSlot(null);
      fetchAbsFacultySchedule();
      fetchMetrics();
    } catch (error) {
      console.error("Substitution override error:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to assign substitute");
    } finally {
      setSubmittingOverride(false);
    }
  };

  // AOCS: Revert override (Cancel/Soft Delete override)
  const handleRevertOverride = async (overrideId) => {
    if (!window.confirm("Are you sure you want to revert/remove this override? Status will return to template schedule.")) return;
    
    setLoadingAbsSchedule(true);
    try {
      await cancelOverride(overrideId);
      toast.success("Override successfully reverted!");
      fetchAbsFacultySchedule();
      fetchMetrics();
    } catch (error) {
      console.error("Revert override error:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to revert override");
    } finally {
      setLoadingAbsSchedule(false);
    }
  };

  // AOCS: General Override submission
  const handleManualOverrideSubmit = async (e) => {
    e.preventDefault();
    setSubmittingOverride(true);
    try {
      const payload = {
        overrideDate: manualOverrideForm.date,
        overrideType: manualOverrideType,
        academicTerm: term,
        reason: manualOverrideForm.reason || "Operational adjustment",
        isRecurring: manualOverrideForm.isRecurring || false,
        recurringPattern: manualOverrideForm.isRecurring ? manualOverrideForm.recurringPattern : null,
        effectiveFrom: manualOverrideForm.isRecurring ? (manualOverrideForm.effectiveFrom || null) : null,
        effectiveTo: manualOverrideForm.isRecurring ? (manualOverrideForm.effectiveTo || null) : null
      };

      if (manualOverrideForm.timetableEntryId) {
        payload.timetableEntryId = parseInt(manualOverrideForm.timetableEntryId);
      }
      if (manualOverrideForm.newFacultyId) {
        payload.newFacultyId = parseInt(manualOverrideForm.newFacultyId);
      }
      if (manualOverrideForm.newRoomId) {
        payload.newRoomId = parseInt(manualOverrideForm.newRoomId);
      }
      if (manualOverrideForm.subjectId) {
        payload.subjectId = parseInt(manualOverrideForm.subjectId);
      }
      if (manualOverrideForm.sectionIds?.length > 0) {
        payload.sectionIds = manualOverrideForm.sectionIds.map(id => parseInt(id));
      }
      if (manualOverrideForm.newStartTime) {
        payload.newStartTime = manualOverrideForm.newStartTime;
      }
      if (manualOverrideForm.newEndTime) {
        payload.newEndTime = manualOverrideForm.newEndTime;
      }

      await createOverride(payload);
      toast.success("Timetable override applied successfully!");
      closeOverrideModal();
      
      if (selectedAbsFaculty) {
        fetchAbsFacultySchedule();
      }
      fetchMetrics();
    } catch (error) {
      console.error("Manual override submission error:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to apply manual override");
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Room Management CRUD Handlers
  const fetchRoomsData = async () => {
    try {
      const res = await getAllRooms();
      setRooms(res.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to refresh rooms list");
    }
  };

  const handleRoomFormSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.name || !roomForm.building || !roomForm.capacity || !roomForm.type) {
      toast.error("Please fill all required fields");
      return;
    }
    if (parseInt(roomForm.capacity) < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    setSubmittingRoom(true);
    try {
      const payload = {
        name: roomForm.name.trim(),
        building: roomForm.building.trim(),
        capacity: parseInt(roomForm.capacity),
        type: roomForm.type,
        status: roomForm.status
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, payload);
        toast.success("Room updated successfully!");
      } else {
        await createRoom(payload);
        toast.success("Room created successfully!");
      }

      setShowRoomModal(false);
      setEditingRoom(null);
      setRoomForm({
        name: '',
        building: '',
        capacity: '',
        type: 'LECTURE_HALL',
        status: 'AVAILABLE'
      });
      await fetchRoomsData();
    } catch (error) {
      console.error("Room saving error:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to save room details");
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleConfirmDeleteRoom = async () => {
    if (!deleteRoomConfirmId) return;
    setIsDeletingRoom(true);
    try {
      await deleteRoom(deleteRoomConfirmId);
      toast.success("Room deleted successfully!");
      setDeleteRoomConfirmId(null);
      await fetchRoomsData();
    } catch (error) {
      console.error("Room deletion error:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to delete room");
    } finally {
      setIsDeletingRoom(false);
    }
  };

  const handleEditRoomClick = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      building: room.building,
      capacity: room.capacity,
      type: room.type,
      status: room.status
    });
    setShowRoomModal(true);
  };

  const gridAssignments = selectedSection
    ? assignments.filter(a => String(a.sectionId) === String(selectedSection))
    : [];

  return (
    <>
      <div className="space-y-6 text-left">
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Academic Operations Console (AOCS)</h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage master templates and real-time live timetable disruptions for term <span className="font-mono bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded">{term}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 bg-neutral-900 text-white shadow-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
            >
              {availableTerms.length > 0 ? (
                availableTerms.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))
              ) : (
                <>
                  <option value="2026-27-ODD">2026-27 ODD Term</option>
                  <option value="2026-27-EVEN">2026-27 EVEN Term</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Tab System Selector */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'canvas' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Master Timetable Canvas
          </button>
          <button
            onClick={() => setActiveTab('aocs')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'aocs' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Disruptions & Smart Substitutions
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'venues' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Manage Venues
          </button>
        </div>


        {/* ─── TAB 1: MASTER CANVAS ────────────────────────────────────────── */}
        {activeTab === 'canvas' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in duration-200">
            
            {/* Left Column: Assignment Creator */}
            <div className="xl:col-span-1 space-y-4">
              <div className="p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm">
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2 text-white">
                  <BookOpen className="w-4 h-4 text-indigo-500" /> New Assignment
                </h3>

                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                    <select
                      className="w-full text-sm border border-neutral-800 rounded-lg px-3 py-2 bg-neutral-950 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      required
                    >
                      <option value="">Select Subject...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section</label>
                    <select
                      className="w-full text-sm border border-neutral-800 rounded-lg px-3 py-2 bg-neutral-950 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      required
                    >
                      <option value="">Select Section...</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty</label>
                    <select
                      className="w-full text-sm border border-neutral-800 rounded-lg px-3 py-2 bg-neutral-950 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
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
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Assign Subject
                  </button>
                </form>
              </div>

              {/* Draft Assignments Log */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm max-h-[350px] overflow-y-auto">
                <h3 className="font-semibold text-xs mb-3 text-slate-400 flex items-center justify-between">
                  Draft Assignments
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded-full text-[10px]">
                    {assignments.length} Total
                  </span>
                </h3>

                {loading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-neutral-800 rounded-lg text-slate-500 text-xs">
                    No assignments created for this term yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignments.map(a => (
                      <div key={a.id} className="p-2 border border-neutral-800/80 rounded-lg hover:border-indigo-500/30 transition-colors bg-neutral-950/40 group">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-xs text-white truncate pr-2" title={a.subjectName}>{a.subjectCode || 'Sub'}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-mono bg-neutral-950 border border-neutral-800 px-1 rounded text-slate-400">
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
                        <div className="flex items-center gap-3 text-[9px] text-slate-400">
                          <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" />{a.facultyName || `F${a.facultyId}`}</span>
                          <span className="flex items-center gap-0.5 font-medium px-1 bg-neutral-800 rounded">{a.sectionName || `S${a.sectionId}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Timetable Canvas */}
            <div className="xl:col-span-3">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm">
                
                {/* Selector Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-sm text-slate-200">Schedule Canvas for:</h3>
                    <select
                      value={selectedSection}
                      onChange={e => setSelectedSection(e.target.value)}
                      className="text-sm border border-neutral-800 rounded-lg px-3 py-1 bg-neutral-950 text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Section...</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => { fetchEntries(); fetchData(); }}
                    className="p-1.5 hover:bg-neutral-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Refresh Schedule"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {!selectedSection ? (
                  <div className="min-h-[450px] flex flex-col items-center justify-center text-center">
                    <CalendarIcon className="w-16 h-16 text-slate-800 mb-4" />
                    <h3 className="text-lg font-bold text-white">Master Schedule Canvas</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-2">
                      Select a section above to start dragging active subject assignments onto the weekly timetable template.
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
        )}

        {/* ─── TAB 2: AOCS DISRUPTIONS & Smart Substitutions ────────────── */}
        {activeTab === 'aocs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Operational Control Center Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800/50 pb-3">
              <div>
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-500" /> Operational Control Center
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Real-time status updates and manual intervention tools.</p>
              </div>
              <button
                onClick={() => {
                  setManualOverrideSectionId(selectedSection || '');
                  setShowOverrideModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto hover:shadow-indigo-500/20 hover:shadow-lg"
              >
                <Plus className="w-4 h-4" /> Apply Manual Override
              </button>
            </div>

            {/* Live Operational Metrics Grid */}
            {loadingMetrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 bg-neutral-900/60 border border-neutral-850/80 rounded-xl animate-pulse h-[110px] flex flex-col justify-between">
                    <div className="h-3 bg-neutral-800 rounded w-2/3"></div>
                    <div className="h-6 bg-neutral-800 rounded w-1/3 mt-2"></div>
                    <div className="h-2 bg-neutral-800 rounded w-5/6 mt-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Active Overrides Today */}
                <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[110px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Overrides Today</span>
                    <Layers className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">{metrics?.activeOverridesCount ?? 0}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Exceptional routing rules active</div>
                </div>

                {/* Pending Substitutions */}
                <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[110px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Substitutions</span>
                    <Shuffle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">{metrics?.pendingReplacementsCount ?? 0}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Requires action / assignment</div>
                </div>

                {/* Faculty Utilization Rate */}
                <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[110px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Faculty Utilization</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">
                    {metrics?.facultyUtilizationRate !== undefined ? `${metrics.facultyUtilizationRate}%` : '0%'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Of total active faculty teaching today</div>
                </div>

                {/* Cancelled Classes Today */}
                <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[110px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cancelled Classes Today</span>
                    <X className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">{metrics?.cancelledClassesCount ?? 0}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Total scheduled hours cancelled</div>
                </div>

                {/* Live Ongoing Lectures */}
                <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[110px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Ongoing Lectures</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">{metrics?.liveOngoingLecturesCount ?? 0}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Currently active class sessions</div>
                </div>
              </div>
            )}

            {/* Core AOCS Operations Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Faculty Absence Coordinator */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-800 pb-3">
                    <h3 className="font-semibold text-base text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Faculty Absence Coordinator
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedAbsFaculty}
                        onChange={e => setSelectedAbsFaculty(e.target.value)}
                        className="text-xs border border-neutral-800 rounded-lg px-2 py-1 bg-neutral-950 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Faculty...</option>
                        {faculties.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
                      </select>
                      
                      <input
                        type="date"
                        value={absDate}
                        onChange={e => setAbsDate(e.target.value)}
                        className="text-xs border border-neutral-800 rounded-lg px-2 py-1 bg-neutral-950 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Abs Faculty Resolved Schedule slots list */}
                  {loadingAbsSchedule ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                  ) : !selectedAbsFaculty ? (
                    <div className="py-20 text-center text-slate-500 text-sm">
                      Select a faculty member above to begin coordinating academic scheduling disruptions.
                    </div>
                  ) : absFacultySchedule.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-neutral-850 rounded-xl text-slate-500 text-sm">
                      No slots scheduled for this faculty member on {absDate}.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Assigned Schedule Exceptions for {absDate}:
                      </p>
                      
                      {absFacultySchedule.map((slot) => {
                        const start = slot.startTime?.substring(0, 5);
                        const end = slot.endTime?.substring(0, 5);
                        const isSlotCancelled = slot.isCancelled;
                        const isSlotSubbed = slot.isSubstituted;
                        const isSlotOverride = slot.isOverride;
                        
                        return (
                          <div 
                            key={slot.overrideId || slot.id} 
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition bg-neutral-950/30
                              ${isSlotCancelled ? 'border-red-950 bg-red-950/5' : isSlotSubbed ? 'border-amber-950 bg-amber-950/5' : 'border-neutral-850'}`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isSlotCancelled ? 'line-through text-slate-500' : 'text-white'}`}>
                                  {slot.subjectCode} — {slot.subjectName}
                                </span>
                                
                                {/* Status badges */}
                                {isSlotCancelled && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400">
                                    Cancelled
                                  </span>
                                )}
                                {isSlotSubbed && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                    Substitute: {slot.facultyName}
                                  </span>
                                )}
                                {isSlotOverride && !isSlotCancelled && !isSlotSubbed && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                                    Override Applied
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                                <span className="flex items-center gap-0.5"><Clock className="w-3.5 h-3.5 text-indigo-400" />{start} - {end}</span>
                                <span className="flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" />{slot.roomName}</span>
                                <span className="flex items-center gap-0.5"><Users className="w-3.5 h-3.5 text-blue-400" />Section: {slot.sectionName}</span>
                              </div>
                              {slot.overrideReason && (
                                <p className="text-[9px] text-slate-500 italic mt-1 font-mono">"Reason: {slot.overrideReason}"</p>
                              )}
                            </div>

                            {/* Actions block */}
                            <div className="flex gap-2 self-start sm:self-auto">
                              {!isSlotCancelled && !isSlotSubbed ? (
                                <>
                                  <button
                                    onClick={() => handleCancelSlot(slot)}
                                    className="px-2.5 py-1 text-[10px] bg-red-950/40 hover:bg-red-950/80 border border-red-900/40 hover:border-red-650 text-red-400 font-semibold rounded transition"
                                  >
                                    Cancel Class
                                  </button>
                                  <button
                                    onClick={() => handleOpenSubstitutionSmartSelector(slot)}
                                    className="px-2.5 py-1 text-[10px] bg-indigo-650 hover:bg-indigo-750 text-white font-semibold rounded transition flex items-center gap-1"
                                  >
                                    <Shuffle className="w-3 h-3" /> Find Substitution
                                  </button>
                                </>
                              ) : (
                                // Revert/Delete action if it has override
                                slot.overrideId && (
                                  <button
                                    onClick={() => handleRevertOverride(slot.overrideId)}
                                    className="px-2.5 py-1 text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-300 rounded transition font-semibold"
                                  >
                                    Revert Override
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Overrides for Selected Section Log */}
              <div className="lg:col-span-1 space-y-4">
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-sm text-white mb-3 flex items-center justify-between border-b border-neutral-800 pb-2">
                    Section Resolved Logs
                    <select
                      value={selectedSection}
                      onChange={e => setSelectedSection(e.target.value)}
                      className="text-[10px] border border-neutral-800 rounded px-1.5 py-0.5 bg-neutral-950 text-white font-medium outline-none"
                    >
                      {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                    </select>
                  </h3>
                  
                  {loadingAbsSchedule ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-indigo-500" /></div>
                  ) : (
                    <SectionOverridesList 
                      sectionId={selectedSection} 
                      date={absDate} 
                      term={term} 
                      onRevert={handleRevertOverride} 
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── TAB 3: MANAGE VENUES ────────────────────────────────────────── */}
        {activeTab === 'venues' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Control Panel */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Venue & Classroom Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Create and configure classrooms, laboratories, and seminar halls.</p>
              </div>
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setRoomForm({
                    name: '',
                    building: '',
                    capacity: '',
                    type: 'LECTURE_HALL',
                    status: 'AVAILABLE'
                  });
                  setShowRoomModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 self-start md:self-auto hover:shadow-indigo-500/20 hover:shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Room
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
              <div className="relative w-full md:w-80 text-left">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Search by name or building..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-800 rounded-lg bg-neutral-950 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Type:</span>
                  <select
                    value={roomFilterType}
                    onChange={(e) => setRoomFilterType(e.target.value)}
                    className="border border-neutral-800 rounded-lg px-2.5 py-1.5 bg-neutral-950 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">All Types</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="CS_LAB">CS Lab</option>
                    <option value="PHYSICS_LAB">Physics Lab</option>
                    <option value="CHEMISTRY_LAB">Chemistry Lab</option>
                    <option value="ELECTRONICS_LAB">Electronics Lab</option>
                    <option value="SEMINAR_HALL">Seminar Hall</option>
                    <option value="ANY">Any Type</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Status:</span>
                  <select
                    value={roomFilterStatus}
                    onChange={(e) => setRoomFilterStatus(e.target.value)}
                    className="border border-neutral-800 rounded-lg px-2.5 py-1.5 bg-neutral-950 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Room Cards Grid */}
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-neutral-850 rounded-xl text-slate-500 text-sm">
                No venues configured. Click "+ Add New Room" to create one.
              </div>
            ) : (() => {
              const filteredRooms = rooms.filter(room => {
                const query = roomSearchQuery.toLowerCase().trim();
                const matchesSearch = room.name?.toLowerCase().includes(query) || room.building?.toLowerCase().includes(query);
                const matchesType = roomFilterType === 'ALL' || room.type === roomFilterType;
                const matchesStatus = roomFilterStatus === 'ALL' || room.status === roomFilterStatus;
                return matchesSearch && matchesType && matchesStatus;
              });

              if (filteredRooms.length === 0) {
                return (
                  <div className="text-center py-20 border border-dashed border-neutral-850 rounded-xl text-slate-500 text-sm">
                    No venues match your search or filter settings.
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredRooms.map((room) => {
                    const isAvailable = room.status === 'AVAILABLE';
                    const isMaintenance = room.status === 'MAINTENANCE';

                    return (
                      <div
                        key={room.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300 min-h-[160px]"
                      >
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-base text-white truncate" title={room.name}>{room.name}</h4>
                            
                            {/* Room Status Indicator */}
                            <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border
                              ${isAvailable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                isMaintenance ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                                'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                            >
                              {isAvailable && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>}
                              {room.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="truncate text-slate-300" title={room.building}>{room.building}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            <span className="text-[9px] font-mono bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-slate-350 flex items-center gap-1">
                              <Users className="w-2.5 h-2.5 text-indigo-400" /> {room.capacity} capacity
                            </span>
                            <span className="text-[9px] font-bold bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded text-indigo-400">
                              {room.type?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-850">
                          <button
                            onClick={() => handleEditRoomClick(room)}
                            className="flex-1 py-1.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-800 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3 text-indigo-400" /> Edit Details
                          </button>
                          <button
                            onClick={() => setDeleteRoomConfirmId(room.id)}
                            className="p-1.5 bg-neutral-950 border border-neutral-850 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                            title="Delete Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}


      </div>

      {/* ─── MODAL: Delete Assignment Confirmation ─────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-5 w-80 mx-4 text-left" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-450" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Delete Assignment</div>
                <div className="text-xs text-slate-400">Template schedule entries are retained.</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">Are you sure you want to delete this subject assignment? This stops new placements.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-1.5 text-xs bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 rounded-lg transition-all text-slate-400 hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAssignment}
                disabled={isDeleting}
                className="flex-1 py-1.5 text-xs bg-red-650 hover:bg-red-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DRAWER MODAL: Smart Substitution Ranked Candidates selector ────── */}
      {substitutionSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/65 backdrop-blur-sm">
          <div className="w-full max-w-lg h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right text-left flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-neutral-850 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-indigo-400" /> Smart Substitution Finder
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Ranked candidate recommendations for scheduled slot</p>
                </div>
                <button
                  onClick={() => setSubstitutionSlot(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slot metadata */}
              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Subject Class</span>
                    <p className="font-bold text-white">{substitutionSlot.subjectName} ({substitutionSlot.subjectCode})</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Original Faculty</span>
                    <p className="font-bold text-white">{selectedAbsFaculty ? faculties.find(f => String(f.id) === String(selectedAbsFaculty))?.name : 'Original'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-neutral-850">
                  <div>
                    <span className="text-[9px] text-slate-500">Date</span>
                    <p className="font-semibold text-slate-300">{absDate}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500">Time</span>
                    <p className="font-semibold text-slate-300 font-mono">{substitutionSlot.startTime?.substring(0, 5)} - {substitutionSlot.endTime?.substring(0, 5)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500">Section</span>
                    <p className="font-semibold text-slate-300">{substitutionSlot.sectionName}</p>
                  </div>
                </div>
              </div>

              {/* Reason form */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Override Reason</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="w-full text-xs border border-neutral-800 rounded-lg px-3 py-2 bg-neutral-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Faculty absence, medical leave..."
                />
              </div>

              {/* Candidates list */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ranked Available Faculty</label>
                
                {loadingCandidates ? (
                  <div className="flex flex-col items-center py-20 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <span className="text-xs text-slate-500">Evaluating workload & expertise metrics...</span>
                  </div>
                ) : availableCandidates.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-neutral-850 rounded-xl text-slate-500 text-xs">
                    No matching faculty candidates available for this slot.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {availableCandidates.map((candidate) => {
                      const isFree = candidate.status === 'FREE';
                      const isExpert = candidate.expertiseRank === 'Direct Expertise';
                      const isDept = candidate.expertiseRank === 'Departmental Match';
                      
                      return (
                        <div 
                          key={candidate.facultyId} 
                          className={`p-3 rounded-lg border transition bg-neutral-950/20 flex items-center justify-between gap-3
                            ${isFree ? 'border-neutral-800' : 'border-red-950 bg-red-950/5 opacity-60'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{candidate.facultyName}</span>
                              
                              {/* Expertise badge */}
                              <span className={`text-[7px] font-bold px-1.5 py-0.2 rounded border leading-none
                                ${isExpert ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : isDept ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-neutral-800 border-neutral-700 text-slate-400'}`}>
                                {candidate.expertiseRank}
                              </span>

                              {/* Availability state */}
                              <span className={`text-[7px] font-bold px-1.5 py-0.2 rounded border leading-none flex items-center gap-0.5
                                ${isFree ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {isFree ? <Check className="w-2 h-2" /> : <AlertTriangle className="w-2 h-2" />}
                                {candidate.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">{candidate.department} · {candidate.designation}</p>
                            
                            {!isFree && candidate.conflictDescription && (
                              <p className="text-[9px] text-red-450/80 font-medium font-mono">{candidate.conflictDescription}</p>
                            )}

                            <div className="text-[9px] text-slate-500 font-mono">
                              Workload Load: {candidate.weeklyWorkloadSlots} slots | Subs: {candidate.recentSubstitutionCount}
                            </div>
                          </div>

                          <button
                            onClick={() => handleConfirmSubstitution(candidate.facultyId)}
                            disabled={!isFree || submittingOverride}
                            className="px-2.5 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-750 text-white rounded transition disabled:opacity-50 font-semibold"
                          >
                            {submittingOverride ? "Assigning..." : "Assign"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-neutral-850 flex gap-2">
              <button
                onClick={() => setSubstitutionSlot(null)}
                className="flex-1 py-2 text-xs bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 rounded-lg text-slate-400 hover:text-white font-semibold transition"
              >
                Close Smart Finder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── GENERAL OVERRIDE MODAL ────────────────────────────────────── */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 text-left animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-4 border-b border-neutral-805 pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Apply Timetable Override
              </h3>
              <button onClick={closeOverrideModal} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualOverrideSubmit} className="space-y-4 text-xs text-white">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Override Type</label>
                <select
                  value={manualOverrideType}
                  onChange={e => setManualOverrideType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="ROOM_CHANGE">Room Change Shift</option>
                  <option value="TIME_CHANGE">Time Change Shift</option>
                  <option value="MERGED_CLASS">Merge Sections</option>
                  <option value="EXTRA_CLASS">Schedule Extra Class Exception</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Date</label>
                    <input
                      type="date"
                      required
                      value={manualOverrideForm.date}
                      onChange={e => {
                        setManualOverrideForm({ ...manualOverrideForm, date: e.target.value, timetableEntryId: '' });
                      }}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-slate-550"
                    />
                  </div>
                  
                  {manualOverrideType !== 'EXTRA_CLASS' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Section</label>
                      <select
                        required
                        value={manualOverrideSectionId}
                        onChange={e => {
                          setManualOverrideSectionId(e.target.value);
                          setManualOverrideForm(prev => ({ ...prev, timetableEntryId: '' }));
                        }}
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                      >
                        <option value="">Select Section...</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* For non-extra classes, select the static Template entry being modified using a searchable picker */}
                {manualOverrideType !== 'EXTRA_CLASS' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Class / Slot</label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        <span>Loading section schedule...</span>
                      </div>
                    ) : !manualOverrideSectionId ? (
                      <div className="py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-slate-500 italic">
                        Select a section above to view slots
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-rose-400 italic">
                        No active classes scheduled on this date
                      </div>
                    ) : (() => {
                      const filteredSlots = availableSlots.filter(s => {
                        const q = slotSearchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return s.subjectCode?.toLowerCase().includes(q) ||
                               s.subjectName?.toLowerCase().includes(q) ||
                               s.roomName?.toLowerCase().includes(q) ||
                               s.facultyName?.toLowerCase().includes(q);
                      });

                      return (
                        <div className="space-y-2">
                          {availableSlots.length > 3 && (
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Filter slots by subject, code, room..."
                                value={slotSearchQuery}
                                onChange={e => setSlotSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-850 rounded-lg focus:outline-none focus:border-indigo-500 text-[11px] text-white placeholder-slate-600"
                              />
                            </div>
                          )}
                          <select
                            required
                            value={manualOverrideForm.timetableEntryId}
                            onChange={e => setManualOverrideForm({ ...manualOverrideForm, timetableEntryId: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                          >
                            <option value="">Choose slot...</option>
                            {filteredSlots.map(slot => (
                              <option key={slot.id} value={slot.id}>
                                {slot.subjectCode} - {slot.subjectName} ({slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}) · Room: {slot.roomName} {slot.isCancelled ? '[Cancelled]' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Extra class fields */}
              {manualOverrideType === 'EXTRA_CLASS' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                      <select
                        required
                        value={manualOverrideForm.subjectId}
                        onChange={e => setManualOverrideForm({ ...manualOverrideForm, subjectId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Select...</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Faculty</label>
                      <select
                        required
                        value={manualOverrideForm.newFacultyId}
                        onChange={e => setManualOverrideForm({ ...manualOverrideForm, newFacultyId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Select...</option>
                        {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Section ID</label>
                    <select
                      required
                      value={manualOverrideForm.sectionIds[0] || ''}
                      onChange={e => setManualOverrideForm({ ...manualOverrideForm, sectionIds: [e.target.value] })}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Section...</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Room Change shifts */}
              {(manualOverrideType === 'ROOM_CHANGE' || manualOverrideType === 'EXTRA_CLASS') && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target New Room</label>
                  <select
                    required
                    value={manualOverrideForm.newRoomId}
                    onChange={e => setManualOverrideForm({ ...manualOverrideForm, newRoomId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Room...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.building})</option>)}
                  </select>
                </div>
              )}

              {/* Time Change shifts */}
              {(manualOverrideType === 'TIME_CHANGE' || manualOverrideType === 'EXTRA_CLASS') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Start Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09:00"
                      value={manualOverrideForm.newStartTime}
                      onChange={e => setManualOverrideForm({ ...manualOverrideForm, newStartTime: e.target.value })}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New End Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00"
                      value={manualOverrideForm.newEndTime}
                      onChange={e => setManualOverrideForm({ ...manualOverrideForm, newEndTime: e.target.value })}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Merge sections */}
              {manualOverrideType === 'MERGED_CLASS' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sections to Merge (Select IDs)</label>
                  <select
                    multiple
                    required
                    value={manualOverrideForm.sectionIds}
                    onChange={e => {
                      const options = [...e.target.options];
                      const selected = options.filter(o => o.selected).map(o => o.value);
                      setManualOverrideForm({ ...manualOverrideForm, sectionIds: selected });
                    }}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 h-20"
                  >
                    {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                  </select>
                </div>
              )}

              {/* Recurrence Settings */}
              <div className="space-y-3 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={manualOverrideForm.isRecurring}
                    onChange={e => setManualOverrideForm({ ...manualOverrideForm, isRecurring: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-indigo-650 focus:ring-indigo-500"
                  />
                  <label htmlFor="isRecurring" className="text-xs font-semibold text-slate-350 select-none cursor-pointer">
                    Is Recurring Exception?
                  </label>
                </div>

                {manualOverrideForm.isRecurring && (
                  <div className="space-y-2.5 pt-1.5 border-t border-neutral-900">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Effective From</label>
                        <input
                          type="date"
                          required
                          value={manualOverrideForm.effectiveFrom}
                          onChange={e => setManualOverrideForm({ ...manualOverrideForm, effectiveFrom: e.target.value })}
                          className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Effective To</label>
                        <input
                          type="date"
                          required
                          value={manualOverrideForm.effectiveTo}
                          onChange={e => setManualOverrideForm({ ...manualOverrideForm, effectiveTo: e.target.value })}
                          className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pattern</label>
                      <select
                        value={manualOverrideForm.recurringPattern}
                        onChange={e => setManualOverrideForm({ ...manualOverrideForm, recurringPattern: e.target.value })}
                        className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="DAILY">DAILY</option>
                        <option value="WEEKLY">WEEKLY</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for Exception</label>
                <textarea
                  required
                  placeholder="e.g. Room maintenance, shifted labs..."
                  value={manualOverrideForm.reason}
                  onChange={e => setManualOverrideForm({ ...manualOverrideForm, reason: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeOverrideModal}
                  className="flex-1 py-2 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-slate-400 hover:text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submittingOverride ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Apply Exception"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─── MODAL: Add/Edit Room ─────────────────────────────────────── */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 text-left animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-4 border-b border-neutral-805 pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" /> {editingRoom ? 'Edit Venue Details' : 'Add New Venue'}
              </h3>
              <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoomFormSubmit} className="space-y-4 text-xs text-white">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Name / Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 401, CS Lab 2"
                  value={roomForm.name}
                  onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Building Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Block, Ramanujan Hall"
                  value={roomForm.building}
                  onChange={e => setRoomForm({ ...roomForm, building: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seating Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 60"
                    value={roomForm.capacity}
                    onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Type</label>
                  <select
                    value={roomForm.type}
                    onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                  >
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="CS_LAB">CS Lab</option>
                    <option value="PHYSICS_LAB">Physics Lab</option>
                    <option value="CHEMISTRY_LAB">Chemistry Lab</option>
                    <option value="ELECTRONICS_LAB">Electronics Lab</option>
                    <option value="SEMINAR_HALL">Seminar Hall</option>
                    <option value="ANY">Any Type</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Status</label>
                <select
                  value={roomForm.status}
                  onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 py-2 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-slate-400 hover:text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRoom}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submittingRoom ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    editingRoom ? 'Update Room' : 'Create Room'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Delete Room Confirmation ───────────────────────────── */}
      {deleteRoomConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteRoomConfirmId(null)}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-5 w-80 mx-4 text-left" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Delete Venue?</div>
                <div className="text-xs text-slate-450">This action cannot be undone.</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to delete this venue? Any template schedule entries linked to this room will lose their room assignment.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteRoomConfirmId(null)}
                className="flex-1 py-1.5 text-xs bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 rounded-lg transition-all text-slate-400 hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteRoom}
                disabled={isDeletingRoom}
                className="flex-1 py-1.5 text-xs bg-red-650 hover:bg-red-750 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
              >
                {isDeletingRoom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// Subcomponent: Render active overrides list for selected section
function SectionOverridesList({ sectionId, date, term, onRevert }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sectionId && date) {
      fetchSectionSchedule();
    }
  }, [sectionId, date, term]);

  const fetchSectionSchedule = async () => {
    setLoading(true);
    try {
      const res = await getResolvedSectionSchedule(sectionId, date, term);
      const schedule = res.data || [];
      // Extract entries that have active override properties
      const overrides = schedule.filter(e => e.isOverride && e.overrideId);
      setList(overrides);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-indigo-500" /></div>;
  if (list.length === 0) return <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-neutral-850 rounded-lg">No active overrides resolved for selected section today.</div>;

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 text-xs">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Section Disruptions:</p>
      {list.map(e => (
        <div key={e.overrideId} className="p-2.5 rounded-lg border border-neutral-850 bg-neutral-950/40 space-y-1">
          <div className="flex justify-between items-start gap-1">
            <span className="font-bold text-white truncate">{e.subjectCode} — {e.overrideType}</span>
            <button
              onClick={() => onRevert(e.overrideId).then(fetchSectionSchedule)}
              className="text-[9px] text-red-400 hover:text-red-300 font-medium font-mono hover:underline whitespace-nowrap"
            >
              Revert
            </button>
          </div>
          <p className="text-slate-400 text-[10px] font-mono">{e.startTime?.substring(0, 5)} - {e.endTime?.substring(0, 5)}</p>
          <div className="text-[9px] text-slate-400">
            {e.isCancelled ? (
              <span className="text-red-400 font-bold">Class Cancelled</span>
            ) : (
              <>
                Room: <span className={e.isRoomChanged ? 'text-white font-bold' : ''}>{e.roomName}</span> | 
                Faculty: <span className={e.isSubstituted ? 'text-white font-bold' : ''}>{e.facultyName}</span>
              </>
            )}
          </div>
          {e.overrideReason && <p className="text-[9px] text-slate-500 italic font-mono">"Reason: {e.overrideReason}"</p>}
        </div>
      ))}
    </div>
  );
}
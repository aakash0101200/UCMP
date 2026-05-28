import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageSquare,
  Users,
  User,
  Zap,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Search,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { sendFacultyMessage, getStudentsInSection } from "../../Services/announcements";
import { toast } from "react-toastify";

const SMART_TEMPLATES = [
  { emoji: "📅", label: "Class Postponed", title: "Class Postponed", body: "Today's class has been postponed. Updated schedule will be shared shortly." },
  { emoji: "📝", label: "Submit Now", title: "Submission Reminder", body: "Please submit your pending assignment before the deadline. Late submissions won't be accepted." },
  { emoji: "🔬", label: "Lab Cancelled", title: "Lab Session Cancelled", body: "Today's lab session stands cancelled. Next session will proceed as per schedule." },
  { emoji: "📚", label: "Bring Notes", title: "Bring Notes Tomorrow", body: "Please bring your notes/textbook for tomorrow's class. We'll be covering important topics." },
  { emoji: "⏰", label: "Deadline Extended", title: "Deadline Extended", body: "The submission deadline has been extended. Please check the updated date and plan accordingly." },
  { emoji: "📋", label: "Lab Manual", title: "Fill Lab Manual Indexes", body: "Please fill your lab manual index pages with the correct experiment details before the next lab session." },
  { emoji: "🎯", label: "Exam Notice", title: "Upcoming Exam Notice", body: "Please prepare for the upcoming exam. Detailed syllabus and seating arrangement will be shared soon." },
  { emoji: "📢", label: "Custom", title: "", body: "" },
];

const THROTTLE_MS = 30000; // 30s anti-spam cooldown

export default function QuickConnectPanel({ sections = [], profile }) {
  const [targetMode, setTargetMode] = useState("section"); // 'section' | 'student'
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || "");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal"); // 'normal' | 'urgent'
  const [activeTemplate, setActiveTemplate] = useState(null);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cooldownRef = useRef(null);
  const pickerRef = useRef(null);

  // Close student picker on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowStudentPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load students when section changes
  useEffect(() => {
    if (!selectedSectionId || targetMode !== "student") return;
    setLoadingStudents(true);
    getStudentsInSection(selectedSectionId)
      .then((res) => {
        setStudents(res.data || []);
        setSelectedStudent(null);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [selectedSectionId, targetMode]);

  // Anti-spam cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  const handleTemplateClick = (tpl) => {
    if (tpl.label === "Custom") {
      setTitle("");
      setBody("");
      setActiveTemplate("Custom");
      return;
    }
    setTitle(tpl.title);
    setBody(tpl.body);
    setActiveTemplate(tpl.label);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message body are required.");
      return;
    }
    if (!selectedSectionId) {
      toast.error("Please select a section first.");
      return;
    }
    if (targetMode === "student" && !selectedStudent) {
      toast.error("Please select a student.");
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: priority === "urgent" ? `[URGENT] ${title}` : title,
        description: body,
        sectionId: Number(selectedSectionId),
        type: priority === "urgent" ? "PRIORITY_MESSAGE" : "MESSAGE",
      };

      if (targetMode === "student" && selectedStudent) {
        payload.studentCollegeId = selectedStudent.collegeId;
      }

      await sendFacultyMessage(payload);

      setSent(true);
      toast.success(
        targetMode === "student"
          ? `Message sent to ${selectedStudent.name}`
          : `Broadcast sent to section`
      );

      // Reset form after success
      setTimeout(() => {
        setSent(false);
        setTitle("");
        setBody("");
        setPriority("normal");
        setActiveTemplate(null);
        setSelectedStudent(null);
      }, 2000);

      // Anti-spam cooldown
      setCooldown(THROTTLE_MS / 1000);
    } catch (err) {
      const msg = err?.response?.data || "Failed to send message.";
      toast.error(typeof msg === "string" ? msg : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.collegeId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const canSend = title.trim() && body.trim() && selectedSectionId && cooldown === 0 && !sending && !sent;

  return (
    <div className="p-6 bg-white dark:bg-[#14221C] border border-emerald-150/40 dark:border-emerald-950/60 rounded-3xl shadow-sm text-left space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          Quick Connect — Send Message
        </h3>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Context-bound messaging
        </span>
      </div>

      {/* ① Target Selector */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Audience
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Section Dropdown */}
          <div className="relative flex-1">
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-slate-50 dark:bg-[#0D1512]/60 border border-slate-200 dark:border-emerald-950/60 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sectionName || s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-[#0D1512]/60 p-0.5 rounded-xl border border-slate-200 dark:border-emerald-950/60 w-fit">
            <button
              onClick={() => setTargetMode("section")}
              className={`px-3 py-2 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                targetMode === "section"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> All Students
            </button>
            <button
              onClick={() => setTargetMode("student")}
              className={`px-3 py-2 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                targetMode === "student"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Individual
            </button>
          </div>
        </div>

        {/* Student Picker (when Individual mode) */}
        {targetMode === "student" && selectedSectionId && (
          <div className="relative" ref={pickerRef}>
            <div
              onClick={() => setShowStudentPicker(!showStudentPicker)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1512]/60 border border-slate-200 dark:border-emerald-950/60 cursor-pointer hover:border-emerald-500/40 transition-all"
            >
              {selectedStudent ? (
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedStudent.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {selectedStudent.name}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {selectedStudent.collegeId}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedStudent(null); }}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400 flex-1">
                  {loadingStudents ? "Loading students..." : "Search and select a student..."}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showStudentPicker ? 'rotate-180' : ''}`} />
            </div>

            {showStudentPicker && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-[#14221C] border border-slate-200 dark:border-emerald-950/60 rounded-xl shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800/40">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search by name, ID, or roll..."
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#0D1512]/60 border border-slate-200 dark:border-emerald-950/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {loadingStudents ? (
                    <div className="py-6 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No students found
                    </div>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.collegeId}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowStudentPicker(false);
                          setStudentSearch("");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {s.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {s.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {s.collegeId} • {s.rollNumber}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ② Smart Templates */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick Templates
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SMART_TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              onClick={() => handleTemplateClick(tpl)}
              className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all duration-200 flex items-center gap-1 ${
                activeTemplate === tpl.label
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.02]"
                  : "bg-slate-50 dark:bg-[#0D1512]/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-emerald-950/60 hover:border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
              }`}
            >
              <span>{tpl.emoji}</span>
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* ③ Compose Area */}
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setActiveTemplate(null); }}
          placeholder="Message title..."
          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-[#0D1512]/60 border border-slate-200 dark:border-emerald-950/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
        />
        <textarea
          value={body}
          onChange={(e) => { setBody(e.target.value); setActiveTemplate(null); }}
          placeholder="Type your message here..."
          rows={4}
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0D1512]/60 border border-slate-200 dark:border-emerald-950/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none transition-all leading-relaxed"
        />
      </div>

      {/* ④ Priority + Send */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
          <div className="flex bg-slate-100 dark:bg-[#0D1512]/60 p-0.5 rounded-lg border border-slate-200 dark:border-emerald-950/60">
            <button
              onClick={() => setPriority("normal")}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                priority === "normal"
                  ? "bg-white dark:bg-emerald-600 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setPriority("urgent")}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all ${
                priority === "urgent"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-amber-500"
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Urgent
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cooldown > 0 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3" /> {cooldown}s
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 shadow-sm ${
              sent
                ? "bg-emerald-500 text-white"
                : canSend
                ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md active:scale-[0.98]"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
              </>
            ) : sent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Sent!
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

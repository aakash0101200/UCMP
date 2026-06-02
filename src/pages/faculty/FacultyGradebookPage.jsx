import React, { useState, useEffect } from 'react';
import AssignmentPublisher from '../../components/Announcements/AssignmentPublisher';
import { getMyFacultyAssignments, setClassroomLink, getAcademicTerms } from '../../Services/timetable';
import { toast } from 'react-toastify';
import { Link2, Save, Loader2, BookOpen, Layers, CheckCircle, HelpCircle } from 'lucide-react';

export default function FacultyGradebookPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [links, setLinks] = useState({});

  useEffect(() => {
    async function loadFacultyAssignments() {
      setLoading(true);
      try {
        const termsRes = await getAcademicTerms();
        const term = termsRes.data?.[0] || 'SPRING_2026';

        const res = await getMyFacultyAssignments(term);
        const data = res.data || [];
        setAssignments(data);

        const initialLinks = {};
        data.forEach(a => {
          initialLinks[a.id] = a.googleClassroomLink || '';
        });
        setLinks(initialLinks);
      } catch (err) {
        console.error("Failed to load faculty assignments for launcher setup:", err);
        toast.error("Could not fetch course assignments.");
      } finally {
        setLoading(false);
      }
    }
    loadFacultyAssignments();
  }, []);

  const handleLinkChange = (id, val) => {
    setLinks(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleSave = async (id) => {
    const linkVal = links[id]?.trim() || '';

    // Validate Classroom link format if not empty
    if (linkVal !== '' && !linkVal.startsWith('https://classroom.google.com/')) {
      toast.error("Invalid Classroom URL. It must start with 'https://classroom.google.com/'");
      return;
    }

    setSavingId(id);
    try {
      await setClassroomLink(id, linkVal);
      toast.success("Google Classroom link updated successfully! 🎉");
      // Update local assignment copy
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, googleClassroomLink: linkVal } : a));
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data || "Failed to update link.";
      toast.error(errMsg);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="-mt-6 -mx-6 min-h-[calc(100vh-64px)] bg-[#F9FBFC] dark:bg-[#0D1512] transition-colors duration-300 text-slate-800 dark:text-slate-100 overflow-y-auto w-[calc(100%+3rem)] p-6 space-y-6 pb-24 text-left">

      {/* Page Header */}
      <div className="bg-white dark:bg-[#14221C] border border-emerald-150/40 dark:border-emerald-950/60 p-6 rounded-3xl shadow-sm">
        <span className="text-xs font-semibold text-emerald-650 dark:text-emerald-400 tracking-wider uppercase">
          Communications & Grading
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-1">
          Grade Book & Announcements
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Publish notices, grading policies, and class announcements to your enrolled sections.
        </p>
      </div>

      {/* Google Classroom Workspace Connector */}
      <div className="bg-white dark:bg-[#14221C] border border-emerald-150/40 dark:border-emerald-950/60 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-emerald-950/40 pb-3">
          <Link2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Connect Google Classroom Workspaces
            </h3>
            <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">
              Add links to your section classrooms. Connected links will appear instantly on your students' smart academic launchers.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-6 flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-450" />
            <span className="text-xs text-slate-450 dark:text-slate-400">Loading assignments...</span>
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-xs text-slate-450 dark:text-slate-500 py-2">
            You do not have any teaching assignments registered for this semester.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(a => {
              const isSaving = savingId === a.id;
              const hasLink = !!a.googleClassroomLink;

              return (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl border border-slate-150 dark:border-emerald-950/40 bg-slate-50/50 dark:bg-[#0D1512]/30 flex flex-col justify-between hover:border-emerald-250 dark:hover:border-emerald-900/60 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                        {a.subjectCode}
                      </span>
                      {hasLink && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {a.subjectName}
                      </h4>
                      <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">
                        Section: <span className="font-semibold text-emerald-650 dark:text-emerald-400">{a.sectionName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        placeholder="https://classroom.google.com/c/..."
                        value={links[a.id] || ''}
                        onChange={(e) => handleLinkChange(a.id, e.target.value)}
                        className="bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-450 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-8"
                      />
                      <Link2 className="w-3.5 h-3.5 text-slate-350 dark:text-slate-550 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                      onClick={() => handleSave(a.id)}
                      disabled={isSaving}
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center min-w-[38px] min-h-[34px] shadow-sm"
                      title="Save Workspace Link"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4">
        <AssignmentPublisher />
      </div>
    </div>
  );
}

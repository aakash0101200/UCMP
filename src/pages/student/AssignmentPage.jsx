import React from "react";
import { FileText, Clock, AlertCircle } from "lucide-react";

/**
 * Student Assignment Page — VIEW ONLY
 * Students can see assignments published by faculty, but cannot create or publish.
 */
export default function AssignmentPage() {
  // Example data — replace with API call to get assignments for the student's section
  const assignments = [
    {
      id: "1",
      title: "Database Design Project",
      subject: "Database Systems",
      faculty: "Dr. Sharma",
      dueDate: "2026-05-15",
      priority: "high",
      description: "Design a normalized database schema for a hospital management system.",
    },
    {
      id: "2",
      title: "React Component Library",
      subject: "Web Development",
      faculty: "Prof. Gupta",
      dueDate: "2026-05-20",
      priority: "medium",
      description: "Build a reusable component library using React and document it.",
    },
    {
      id: "3",
      title: "ML Algorithm Implementation",
      subject: "AI & ML",
      faculty: "Dr. Patel",
      dueDate: "2026-05-18",
      priority: "high",
      description: "Implement KNN and Decision Tree algorithms from scratch in Python.",
    },
  ];

  const priorityStyles = {
    high: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  };

  const isOverdue = (dateStr) => new Date(dateStr) < new Date();
  const daysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Overdue";
    if (diff === 0) return "Due today";
    if (diff === 1) return "Due tomorrow";
    return `${diff} days left`;
  };

  return (
    <div className="scroll-style space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">My Assignments</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {assignments.length} assignments pending
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No assignments posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border/50 bg-background p-4 space-y-2 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.subject} · {a.faculty}
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityStyles[a.priority]}`}>
                  {a.priority}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {a.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                </div>
                <span className={`text-xs font-medium ${isOverdue(a.dueDate) ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {daysLeft(a.dueDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
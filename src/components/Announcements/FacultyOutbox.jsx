import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Inbox,
  User,
  Reply,
  Check,
  RefreshCw,
} from "lucide-react";
import { getAnnouncements, acknowledgeMessage } from "../../Services/announcements";
import { toast } from "react-toastify";

const formatTimeAgo = (timeStr) => {
  if (!timeStr) return "";
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return timeStr;
  }
};

export default function FacultyOutbox({ sections = [], onRepliesChanged }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ackingId, setAckingId] = useState(null);

  useEffect(() => {
    loadOutbox();
  }, []);

  const loadOutbox = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements();
      const allAnn = res.data || [];

      // Filter for sent messages by faculty
      const sent = allAnn.filter(
        (a) => a.type === "MESSAGE" || a.type === "PRIORITY_MESSAGE"
      );

      // Filter for replies
      const replies = allAnn.filter((a) => a.type === "REPLY");

      // Group replies under parents
      const grouped = sent.map((msg) => {
        const msgId = msg.announcementId || msg.id;
        const msgReplies = replies.filter(
          (r) => r.location === String(msgId)
        );
        return {
          ...msg,
          replies: msgReplies,
        };
      });

      setMessages(grouped);
    } catch (err) {
      console.error("Failed to load outbox:", err);
      toast.error("Failed to load sent messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReplyRead = async (replyId) => {
    setAckingId(replyId);
    try {
      await acknowledgeMessage(replyId);

      // Update state locally
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          replies: msg.replies.map((r) =>
            (r.announcementId || r.id) === replyId
              ? { ...r, isCompleted: true, completed: true }
              : r
          ),
        }))
      );
      toast.success("Reply marked as read.");
      if (onRepliesChanged) {
        onRepliesChanged();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setAckingId(null);
    }
  };

  const getSectionName = (sectionId) => {
    if (!sectionId) return "Global";
    const sec = sections.find((s) => s.id === Number(sectionId));
    return sec ? sec.sectionName || sec.name : `Section #${sectionId}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 animate-pulse">Loading sent messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Sent Messages Log
        </h4>
        <button
          onClick={loadOutbox}
          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-[11px] font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl">
          <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-400">
            No messages sent yet
          </p>
          <p className="text-xs text-slate-400/70 mt-1">
            Send message to a section or student to start tracking responses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            const id = msg.announcementId || msg.id;
            const isUrgent = (msg.type || "").toUpperCase() === "PRIORITY_MESSAGE";
            const is1to1 = !!msg.studentCollegeId;
            const isAcked = msg.isCompleted || msg.completed;

            return (
              <div
                key={id}
                className="p-5 bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {(msg.title || "").replace("[URGENT] ", "")}
                      </span>
                      {isUrgent && (
                        <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-bold rounded-full uppercase">
                          Urgent
                        </span>
                      )}
                      {is1to1 ? (
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-semibold rounded-full">
                          1-to-1
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-semibold rounded-full">
                          Broadcast
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Audience: </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {is1to1
                          ? `Student (ID: ${msg.studentCollegeId})`
                          : `Section (${getSectionName(msg.sectionId)})`}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(msg.time)}
                      </span>
                    </div>
                  </div>

                  {/* 1-to-1 Acknowledgment Receipt */}
                  {is1to1 && (
                    <div className="shrink-0">
                      {isAcked ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ack. Received
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-semibold">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          Pending Ack.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left">
                  {msg.description}
                </p>

                {/* Replies Thread */}
                {msg.replies && msg.replies.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Reply className="w-3 h-3 rotate-180" />
                      Student Replies ({msg.replies.length})
                    </h5>

                    <div className="space-y-2 pl-4 border-l border-emerald-500/20 dark:border-emerald-500/10">
                      {msg.replies.map((reply) => {
                        const replyId = reply.announcementId || reply.id;
                        const isReplyAcked = reply.isCompleted || reply.completed;

                        return (
                          <div
                            key={replyId}
                            className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-300 ${!isReplyAcked
                              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20"
                              : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/40 dark:border-slate-800/40"
                              }`}
                          >
                            {/* Student Avatar */}
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                {reply.author?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>

                            {/* Reply Body */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                    {reply.author}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-semibold truncate">
                                    ({reply.targetRole})
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 shrink-0">
                                  {formatTimeAgo(reply.time)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {reply.description}
                              </p>
                            </div>

                            {/* Mark reply read action */}
                            {!isReplyAcked && (
                              <button
                                onClick={() => handleMarkReplyRead(replyId)}
                                disabled={ackingId === replyId}
                                title="Mark reply as read"
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all shrink-0 self-center"
                              >
                                {ackingId === replyId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  Loader2,
  Inbox,
  ChevronRight,
  X,
  User,
  Reply,
} from "lucide-react";
import { getAnnouncements, acknowledgeMessage, replyToMessage } from "../../Services/announcements";
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

export default function StudentInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("faculty"); // 'faculty' | 'all'
  const [replyingTo, setReplyingTo] = useState(null); // message ID being replied to
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [ackingId, setAckingId] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements();
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    setAckingId(id);
    try {
      await acknowledgeMessage(id);
      setMessages((prev) =>
        Array.isArray(prev) ? prev.map((m) =>
          (m.announcementId || m.id) === id ? { ...m, isCompleted: true, completed: true } : m
        ) : []
      );
      toast.success("Message acknowledged!");
    } catch (err) {
      toast.error("Failed to acknowledge message.");
    } finally {
      setAckingId(null);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await replyToMessage(id, replyText.trim());
      toast.success("Reply sent!");
      setReplyingTo(null);
      setReplyText("");
      loadMessages(); // refresh to show the reply
    } catch (err) {
      const msg = err?.response?.data || "Failed to send reply.";
      toast.error(typeof msg === "string" ? msg : "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const messagesArray = Array.isArray(messages) ? messages : [];

  // Filter messages based on tab
  const filteredMessages = messagesArray.filter((m) => {
    if (activeTab === "faculty") {
      const t = (m.type || "").toUpperCase();
      return t === "MESSAGE" || t === "PRIORITY_MESSAGE" || t === "REPLY";
    }
    return true;
  });

  const facultyCount = messagesArray.filter((m) => {
    const t = (m.type || "").toUpperCase();
    return t === "MESSAGE" || t === "PRIORITY_MESSAGE" || t === "REPLY";
  }).length;

  const unreadFaculty = messagesArray.filter((m) => {
    const t = (m.type || "").toUpperCase();
    return (t === "MESSAGE" || t === "PRIORITY_MESSAGE") && !m.isCompleted && !m.completed;
  }).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 animate-pulse">Loading your inbox...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <style>{`
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .anim-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111827] border border-indigo-100/40 dark:border-indigo-950/40 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
            Quick Connect
          </span>
          <h1 className="text-2xl font-light text-slate-900 dark:text-white tracking-tight mt-1">
            Messages & Updates
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Direct messages from your faculty and system announcements.
          </p>
        </div>
        {unreadFaculty > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {unreadFaculty} unread message{unreadFaculty > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex bg-white/80 dark:bg-[#111827]/80 p-1 rounded-2xl border border-indigo-100/40 dark:border-indigo-950/40 w-fit gap-2 shadow-sm">
        <button
          onClick={() => setActiveTab("faculty")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
            activeTab === "faculty"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          From Faculty
          {facultyCount > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
              activeTab === "faculty" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
            }`}>
              {facultyCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          All Updates
        </button>
      </div>

      {/* Message Cards */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              {activeTab === "faculty" ? "No messages from faculty yet" : "No updates available"}
            </p>
            <p className="text-xs text-slate-400/70 mt-1">
              Messages will appear here when your faculty sends them.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const id = msg.announcementId || msg.id;
            const isAcked = msg.isCompleted || msg.completed;
            const isReply = (msg.type || "").toUpperCase() === "REPLY";
            const isUrgent = (msg.type || "").toUpperCase() === "PRIORITY_MESSAGE" || (msg.title || "").includes("[URGENT]");
            const isFacultyMsg = (msg.type || "").toUpperCase() === "MESSAGE" || (msg.type || "").toUpperCase() === "PRIORITY_MESSAGE";

            return (
              <div
                key={id}
                className={`anim-slide-up p-4 rounded-2xl border transition-all duration-300 ${
                  isReply
                    ? "bg-slate-50/80 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/40 ml-6"
                    : !isAcked && isFacultyMsg
                    ? "bg-white dark:bg-[#111827] border-l-[3px] border-l-amber-400 border-t border-r border-b border-indigo-100/40 dark:border-indigo-950/40 shadow-md hover:shadow-lg"
                    : "bg-white dark:bg-[#111827] border-indigo-100/40 dark:border-indigo-950/40 shadow-sm hover:shadow-md"
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isReply
                      ? "bg-slate-200 dark:bg-slate-700"
                      : isUrgent
                      ? "bg-amber-100 dark:bg-amber-500/15"
                      : "bg-indigo-100 dark:bg-indigo-500/15"
                  }`}>
                    {isReply ? (
                      <Reply className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    ) : isUrgent ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {(msg.title || "").replace("[URGENT] ", "")}
                        </span>
                        {isUrgent && (
                          <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-bold rounded-full uppercase shrink-0">
                            Urgent
                          </span>
                        )}
                        {isAcked && isFacultyMsg && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(msg.time)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {msg.description}
                    </p>

                    {msg.author && (
                      <span className="text-[10px] text-slate-400/80 italic block">
                        — {msg.author}
                      </span>
                    )}

                    {/* Action Buttons (for faculty messages only) */}
                    {isFacultyMsg && (
                      <div className="flex items-center gap-2 pt-2">
                        {!isAcked && (
                          <button
                            onClick={() => handleAcknowledge(id)}
                            disabled={ackingId === id}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                          >
                            {ackingId === id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === id ? null : id);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-1"
                        >
                          <Reply className="w-3 h-3" />
                          Reply
                        </button>
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo === id && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/40">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleReply(id);
                            }
                          }}
                          placeholder="Type a short reply..."
                          maxLength={500}
                          className="flex-1 px-3 py-2 text-xs bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                          autoFocus
                        />
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReply(id)}
                          disabled={!replyText.trim() || sendingReply}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-400 transition-all flex items-center gap-1"
                        >
                          {sendingReply ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

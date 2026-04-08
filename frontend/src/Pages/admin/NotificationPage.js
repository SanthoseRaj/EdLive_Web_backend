import React, { useEffect, useRef, useState } from "react";
import Section from "./Section";
import { lazy, Suspense } from "react";
import { createPortal } from "react-dom";

/* ================= HELPERS ================= */

const todayStr = new Date().toISOString().split("T")[0];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const TYPE_STYLES = {
  todo: {
    border: "border-blue-500",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  achievements: {
    border: "border-yellow-500",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-700",
  },
  messages: {
    border: "border-pink-500",
    bg: "bg-pink-50",
    badge: "bg-pink-100 text-pink-700",
  },
  payments: {
    border: "border-green-500",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
  },
  default: {
    border: "border-gray-400",
    bg: "bg-gray-50",
    badge: "bg-gray-100 text-gray-700",
  },
};

/* ================= INDEPENDENT REPLY ITEM COMPONENT ================= */
// Defined OUTSIDE the main component to prevent re-mounting on keystrokes
const ReplyItem = ({ 
  reply, 
  activeReplyParentId, 
  setActiveReplyParentId, 
  replyText, 
  setReplyText, 
  submitReply, 
  replyLoading, 
  collapsedReplies, 
  setCollapsedReplies 
}) => (
  <div
    className={`mt-3 rounded-md p-3 ${
      reply.is_viewed === false
        ? "bg-green-50 border border-green-300"
        : "bg-white border border-gray-100 shadow-sm"
    }`}
    style={{ marginLeft: `${(reply.depth - 1) * 20}px` }}
  >
    <div className="flex justify-between gap-2">
      <div className="flex-1">
        <div className="text-xs font-semibold text-gray-700 flex items-center gap-2">
          {reply.sender_name}
          <span className="text-[10px] text-gray-400 font-normal">
            {new Date(reply.created_at).toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
          {reply.message_text}
        </div>
      </div>
    </div>
    
    <div className="flex gap-3 mt-2 items-center">
      <button
        className="text-xs font-medium text-blue-600 hover:text-blue-800"
        onClick={() => setActiveReplyParentId(reply.id)}
      >
        Reply
      </button>
      {reply.replies?.length > 0 && (
        <button
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          onClick={() =>
            setCollapsedReplies((p) => ({
              ...p,
              [reply.id]: !p[reply.id],
            }))
          }
        >
          {collapsedReplies[reply.id] ? "Show replies" : "Hide replies"}
        </button>
      )}
    </div>

    {activeReplyParentId === reply.id && (
      <div className="mt-3 bg-gray-50 p-2 rounded">
        <textarea
          rows={2}
          className="textarea textarea-bordered textarea-sm w-full bg-white"
          placeholder="Write a reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
           <button
            className="btn btn-xs btn-ghost"
            onClick={() => setActiveReplyParentId(null)}
          >
            Cancel
          </button>
          <button
            className="btn btn-xs btn-primary"
            disabled={replyLoading}
            onClick={() => submitReply(reply.id)}
          >
            {replyLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    )}

    {!collapsedReplies[reply.id] &&
      reply.replies?.map((r) => (
        <ReplyItem 
          key={r.id} 
          reply={r}
          // Pass all props down recursively
          activeReplyParentId={activeReplyParentId}
          setActiveReplyParentId={setActiveReplyParentId}
          replyText={replyText}
          setReplyText={setReplyText}
          submitReply={submitReply}
          replyLoading={replyLoading}
          collapsedReplies={collapsedReplies}
          setCollapsedReplies={setCollapsedReplies}
        />
      ))}
  </div>
);

/* ================= MAIN COMPONENT ================= */

const NotificationPage = () => {
  const [anchorDate, setAnchorDate] = useState(todayStr);
  const [weekData, setWeekData] = useState({});
  const [period, setPeriod] = useState({ start: "", end: "" });
  const [expandedDate, setExpandedDate] = useState(todayStr);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastFocusedId, setLastFocusedId] = useState(null);

  const [replies, setReplies] = useState([]);
  const [activeReplyParentId, setActiveReplyParentId] = useState(null);
  
  // State for inline replies (nested)
  const [replyText, setReplyText] = useState("");
  // State for the main footer reply
  const [mainReplyText, setMainReplyText] = useState("");
  
  const [replyLoading, setReplyLoading] = useState(false);
  const [collapsedReplies, setCollapsedReplies] = useState({});
  const [replyCountMap, setReplyCountMap] = useState({});

  const modalRef = useRef(null);

  /* ================= FETCH WEEK ================= */

  const fetchWeek = async (date) => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/dashboard/daily-notifications?date=${date}`,
      { credentials: "include" }
    );
    const data = await res.json();

    if (data.success) {
      setWeekData(data.notifications.notifications || {});
      setPeriod({
        start: data.notifications.period_start,
        end: data.notifications.period_end,
      });
      setTotalNotifications(data.notifications.total_notifications || 0);
      setExpandedDate(date);
      setAnchorDate(date);
    }
  };

  useEffect(() => {
    fetchWeek(anchorDate);
  }, []);

  /* ================= VIEWED ================= */

  const markNotificationViewed = async (note) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/viewed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        item_type: note.module_type,
        item_id: note.id,
      }),
    });
  };

  /* ================= REPLIES ================= */

  const fetchReplies = async (note) => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/dashboard/messages/${note.id}/replies?item_type=${note.module_type}`,
      { credentials: "include" }
    );
    const data = await res.json();

    if (data.success) {
      setReplies(data.replies || []);
      setReplyCountMap((p) => ({ ...p, [note.id]: data.replies.length }));
    }
  };

  useEffect(() => {
    if (!isModalOpen || !selectedNotification) return;

    fetchReplies(selectedNotification);

    const interval = setInterval(() => {
      fetchReplies(selectedNotification);
    }, 15000);

    return () => clearInterval(interval);
  }, [isModalOpen, selectedNotification]);

  const submitReply = async (parentId = null) => {
    const textToSend = parentId ? replyText : mainReplyText;

    if (!textToSend.trim()) return;

    setReplyLoading(true);
    await fetch(
      `${process.env.REACT_APP_API_URL}/api/dashboard/messages/${selectedNotification.id}/reply`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          item_type: selectedNotification.module_type,
          message_text: textToSend,
          parent_id: parentId, 
        }),
      }
    );

    if (parentId) {
      setReplyText("");
      setActiveReplyParentId(null);
    } else {
      setMainReplyText("");
    }

    fetchReplies(selectedNotification);
    setReplyLoading(false);
  };

  /* ================= OPEN / CLOSE ================= */

  const openNotification = async (note) => {
    setSelectedNotification(note);
    setLastFocusedId(note.id);
    setIsModalOpen(true);
    setMainReplyText("");
    setReplyText("");
    await markNotificationViewed(note);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      document.getElementById(`notification-${lastFocusedId}`)?.focus();
    }, 100);
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-4 bg-white rounded-lg">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <button className="btn btn-sm btn-ghost" onClick={() => fetchWeek(addDays(anchorDate, -7))}>
          ← Previous
        </button>

        <div className="font-semibold flex items-center gap-2">
          {formatDate(period.start)} – {formatDate(period.end)}
          <span className="badge badge-error text-white  p-2">
            {totalNotifications}
          </span>
        </div>

        <button className="btn btn-sm btn-ghost" onClick={() => fetchWeek(addDays(anchorDate, 7))}>
          Next →
        </button>
      </div>

      <Section title="Weekly Notifications">
        {Object.keys(weekData).map((date) => {
          const isActive = date === expandedDate;
          const items = [...weekData[date]].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          return (
            <div
              key={date}
              className={`border rounded-lg mb-2 overflow-hidden transition-all ${
                isActive ? "border-primary bg-blue-50/30" : "border-gray-200"
              } ${date === todayStr ? "ring-2 ring-red-100" : ""}`}
            >
              <div
                className={`px-4 py-3 cursor-pointer flex justify-between items-center ${isActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setExpandedDate(isActive ? null : date)}
              >
                <div className="font-semibold text-gray-700">
                  {new Date(date).toDateString()}
                </div>
                <div className="text-sm text-gray-500 badge badge-ghost  p-2">{items.length}</div>
              </div>

              {isActive && (
                <div className="px-4 pb-4 pt-2 space-y-3">
                  {items.map((note) => (
                    <div
                      key={note.id}
                      id={`notification-${note.id}`}
                      tabIndex={0}
                      onClick={() => openNotification(note)}
                      className={`relative border-l-4 p-4 rounded-md cursor-pointer transition-shadow hover:shadow-md bg-white
                        ${TYPE_STYLES[note.module_type]?.border ||
                        TYPE_STYLES.default.border}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded
                          ${TYPE_STYLES[note.module_type]?.badge ||
                          TYPE_STYLES.default.badge}`}>
                          {note.module_type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                           {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      {replyCountMap[note.id] > 0 && (
                        <span className="absolute top-2 right-2 badge badge-warning badge-xs  p-2">
                           {replyCountMap[note.id]} replies
                        </span>
                      )}

                      <div className="font-bold text-gray-800 mb-1">{note.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {note.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Section>

      {/* MODAL */}
      {isModalOpen && selectedNotification &&
  createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex justify-center items-start pt-10 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* ===== FIXED HEADER ===== */}
        <div className="p-5 border-b shrink-0 relative bg-white rounded-t-xl">
          <button
            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-gray-500"
            onClick={closeModal}
          >
            ✕
          </button>

          <h3 className="text-lg font-bold pr-8 text-gray-800 leading-tight">
            {selectedNotification.title}
          </h3>

          <div className="mt-3 text-sm text-gray-600 max-h-32 overflow-y-auto custom-scrollbar">
            {selectedNotification.content}
          </div>
        </div>

        {/* ===== SCROLLABLE BODY ===== */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {replies.length > 0 ? (
            <div className="space-y-2">
              {replies.map((r) => (
                <ReplyItem
                  key={r.id}
                  reply={r}
                  activeReplyParentId={activeReplyParentId}
                  setActiveReplyParentId={setActiveReplyParentId}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  submitReply={submitReply}
                  replyLoading={replyLoading}
                  collapsedReplies={collapsedReplies}
                  setCollapsedReplies={setCollapsedReplies}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm min-h-[100px]">
              <p>No replies yet.</p>
              <p className="text-xs">Start the conversation below!</p>
            </div>
          )}
        </div>

        {/* ===== FIXED FOOTER ===== */}
        <div className="p-3 border-t bg-white rounded-b-xl shrink-0">
          <div className="relative">
            <textarea
              className="textarea textarea-bordered w-full pr-16 bg-gray-50 focus:bg-white transition-colors text-sm"
              placeholder="Type a reply to this notification..."
              rows={1}
              style={{ minHeight: "3rem", maxHeight: "8rem" }}
              value={mainReplyText}
              onChange={(e) => setMainReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitReply(null);
                }
              }}
            />
            <button
              className="absolute right-2 bottom-2 btn btn-sm btn-primary btn-circle"
              disabled={replyLoading || !mainReplyText.trim()}
              onClick={() => submitReply(null)}
            >
              {replyLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

    </div>
  );
};

export default NotificationPage;
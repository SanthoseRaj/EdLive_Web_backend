import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const AdminMessagePage = () => {
  const navigate = useNavigate();

  // --- Main Page State ---
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null); // For View Modal
  const [showCreateModal, setShowCreateModal] = useState(false); // For Create Modal
  const [showViewModal, setShowViewModal] = useState(false); // For View Modal visibility

  // --- Effects ---
  useEffect(() => {
    fetchMessages();
  }, []);

  // --- API Calls ---
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/sender`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // --- Handlers ---
  const handleViewMessage = (msg) => {
    setSelectedMessage(msg);
    setShowViewModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchMessages(); // Refresh list after sending
  };

  // --- Helper for formatting date ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-indigo-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-100 mb-4 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold mb-2">Message History</h1>
              <h2 className="text-xl font-medium text-indigo-100">View sent communications</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-secondary shadow-md bg-white text-indigo-700 border-none hover:bg-gray-100"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Compose New Message
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[400px]">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-lg">No messages sent yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th>Date</th>
                    <th>Recipient</th>
                    <th>Message Snippet</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="font-medium text-gray-600">
                        {formatDate(msg.created_at)}
                      </td>
                      <td>
                        <div className="font-bold text-indigo-900">{msg.student_name}</div>
                        <div className="text-xs text-gray-500">Student ID: {msg.student_id}</div>
                      </td>
                      <td>
                        <p className="line-clamp-1 max-w-xs text-gray-600">{msg.message_text}</p>
                      </td>
                      <td>
                        <span className={`badge ${
                          msg.message_type === 'appreciation' ? 'badge-success text-white' :
                          msg.message_type === 'meeting_request' ? 'badge-warning text-white' : 
                          'badge-ghost'
                        } badge-sm`}>
                          {msg.message_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleViewMessage(msg)}
                          className="btn btn-sm btn-ghost text-indigo-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== VIEW MESSAGE MODAL (Portal) ===== */}
      {showViewModal && selectedMessage && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40 backdrop-blur-sm">
          <div className="mt-20 w-full max-w-lg bg-white rounded-xl shadow-2xl p-0 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-indigo-700 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Message Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold">Recipient</p>
                  <p className="text-lg font-bold text-gray-800">{selectedMessage.student_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-gray-500 font-bold">Sent On</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(selectedMessage.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500 font-bold mb-2">Content</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message_text}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold">Type</p>
                  <span className="badge badge-outline mt-1">{selectedMessage.message_type}</span>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold">Channels</p>
                  <div className="flex gap-2 mt-1">
                    {/* Display channels based on status columns if available, or generic assumption */}
                    {/* Assuming data structure has these or simpler array */}
                    {selectedMessage.sms_status && <span className="badge badge-xs badge-info">SMS</span>}
                    {selectedMessage.whatsapp_status && <span className="badge badge-xs badge-success">WA</span>}
                    {selectedMessage.email_status && <span className="badge badge-xs badge-warning">Email</span>}
                    {(!selectedMessage.sms_status && !selectedMessage.whatsapp_status && !selectedMessage.email_status) && 
                     <span className="text-xs text-gray-400">Unknown channels</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end">
              <button 
                onClick={() => setShowViewModal(false)}
                className="btn btn-primary bg-indigo-600 border-none btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== CREATE MESSAGE MODAL (Portal) ===== */}
      {showCreateModal && (
        <CreateMessageModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

// --- Sub-component: Create Message Modal ---
const CreateMessageModal = ({ onClose, onSuccess }) => {
  // State from previous implementation
  const [recipientType, setRecipientType] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [channels, setChannels] = useState({ sms: false, whatsapp: false, email: false });
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchClasses(), fetchStudents()]);
      setInitLoading(false);
    };
    initData();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/classes`, {
        method: 'GET', credentials: 'include'
      });
      if (response.ok) setClasses(await response.json());
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/student/students`, {
        method: 'GET', credentials: 'include'
      });
      if (response.ok) setStudents(await response.json());
    } catch (e) { console.error(e); }
  };

  // Grouping Logic
  const getGroupedClasses = () => {
    const groups = {};
    classes.forEach(cls => {
      const className = cls.class || cls.class_name; 
      if (!groups[className]) groups[className] = [];
      groups[className].push(cls);
    });
    return Object.keys(groups).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).reduce(
      (obj, key) => { 
        obj[key] = groups[key].sort((a,b) => a.section.localeCompare(b.section)); 
        return obj;
      }, {}
    );
  };

  const toggleClassSection = (id) => {
    setSelectedClassIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleWholeClassRow = (clsSections) => {
    const ids = clsSections.map(c => c.id);
    const allSelected = ids.every(id => selectedClassIds.includes(id));
    if (allSelected) {
      setSelectedClassIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedClassIds(prev => {
        const newIds = [...prev];
        ids.forEach(id => { if(!newIds.includes(id)) newIds.push(id); });
        return newIds;
      });
    }
  };

  const filteredStudents = searchQuery.length > 1 
    ? students.filter(s => s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const addStudent = (student) => {
    if (!selectedStudents.find(s => s.id === student.id)) setSelectedStudents([...selectedStudents, student]);
    setSearchQuery("");
  };

  const handleSend = async () => {
    const activeChannels = Object.keys(channels).filter(k => channels[k]);
    if (activeChannels.length === 0) return alert("Select at least one channel");
    if (!messageText.trim()) return alert("Enter message content");
    if (selectedClassIds.length === 0 && selectedStudents.length === 0) return alert("Select recipients");

    setLoading(true);
    try {
      if (selectedClassIds.length > 0) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/messages/class`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            class_ids: selectedClassIds,
            message_text: messageText,
            is_appreciation: false, is_meeting_request: false, channels: activeChannels
          })
        });
      }
      if (selectedStudents.length > 0) {
        await Promise.all(selectedStudents.map(s => 
          fetch(`${process.env.REACT_APP_API_URL}/api/messages`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: s.id,
              message_text: messageText,
              is_appreciation: false, is_meeting_request: false, channels: activeChannels
            })
          })
        ));
      }
      alert("Messages sent!");
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Error sending messages");
    } finally {
      setLoading(false);
    }
  };

  const groupedClasses = getGroupedClasses();

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40 backdrop-blur-sm overflow-y-auto py-10">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Compose New Message</h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>

        <div className="p-6">
          {initLoading ? (
            <div className="flex justify-center p-10"><div className="loading loading-spinner text-primary"></div></div>
          ) : (
            <div className="space-y-6">
              
              {/* 1. Recipient Selection */}
              <div>
                <label className="label font-bold text-gray-700">To:</label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rtype" className="radio radio-primary" checked={recipientType === 'classes'} onChange={() => setRecipientType('classes')} />
                    <span>Classes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rtype" className="radio radio-primary" checked={recipientType === 'group'} onChange={() => setRecipientType('group')} />
                    <span>Specific Students</span>
                  </label>
                </div>

                {/* Class Matrix */}
                {recipientType === 'classes' && (
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                    {Object.entries(groupedClasses).map(([className, sections]) => (
                      <div key={className} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-xs" 
                          checked={sections.every(s => selectedClassIds.includes(s.id))}
                          onChange={() => toggleWholeClassRow(sections)}
                        />
                        <span className="font-bold w-12">{className}</span>
                        <div className="flex flex-wrap gap-2">
                          {sections.map(sec => (
                            <button
                              key={sec.id}
                              onClick={() => toggleClassSection(sec.id)}
                              className={`btn btn-xs ${selectedClassIds.includes(sec.id) ? 'btn-primary' : 'btn-outline'}`}
                            >
                              {sec.section}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Student Search */}
                {recipientType === 'group' && (
                  <div>
                    <input 
                      type="text" 
                      className="input input-bordered w-full mb-2" 
                      placeholder="Search student name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery.length > 1 && (
                      <ul className="menu bg-base-100 w-full rounded-box shadow-lg border max-h-40 overflow-y-auto absolute z-10">
                        {filteredStudents.map(s => (
                          <li key={s.id}><a onClick={() => addStudent(s)}>{s.full_name} ({s.class_id})</a></li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedStudents.map(s => (
                        <div key={s.id} className="badge badge-info gap-2">
                          {s.full_name} <button onClick={() => setSelectedStudents(prev => prev.filter(x => x.id !== s.id))}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Message Body */}
              <div>
                <label className="label font-bold text-gray-700">Message:</label>
                <textarea 
                  className="textarea textarea-bordered w-full h-32" 
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                ></textarea>
              </div>

              {/* 3. Channels */}
              <div>
                <label className="label font-bold text-gray-700">Send Via:</label>
                <div className="flex gap-6">
                  {['sms', 'whatsapp', 'email'].map(ch => (
                    <label key={ch} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm" 
                        checked={channels[ch]}
                        onChange={(e) => setChannels({...channels, [ch]: e.target.checked})}
                      />
                      <span className="uppercase">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost" disabled={loading}>Cancel</button>
          <button onClick={handleSend} className="btn btn-primary bg-indigo-600 border-none" disabled={loading}>
            {loading ? <span className="loading loading-spinner"></span> : 'Send Message'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminMessagePage;
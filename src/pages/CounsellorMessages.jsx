/**
 * src/pages/CounsellorMessages.jsx  ── BUG-FIXED
 *
 * Bug 1 fix — double message:
 *   Removed the optimistic bubble on send.
 *   Server now emits dm:message:saved back to the sender only (with the real
 *   persisted doc). Recipient gets dm:message as before.
 *   Both paths share the same appendMessage dedup helper.
 *
 * Bug 2 fix — no persistence on refresh:
 *   Required src/socket.js to be updated (see outputs/backend/socket.js).
 *   Once that's applied, getConversation() on mount returns saved messages.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Send, MessageSquare, Search, CheckCheck, X, Phone, Video, Info, Plus, Smile, Paperclip, MoreHorizontal } from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import { useAuth } from '../auth/AuthContext';
import { getSocket } from '../api/socketClient';
import { getCounsellorProfile } from '../api/counsellorApi';
import { getConversation, markRead } from '../api/messageApi';
import './CounsellorMessages.css';

/* ── Helpers ──────────────────────────────────────────────────── */
const initials = (name = '') =>
  name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ── Thread item ──────────────────────────────────────────────── */
const ThreadItem = ({ student, active, unread, lastMsg, lastAt, isOnline, onClick }) => (
  <div className={`cm-thread ${active ? 'cm-thread-active' : ''}`} onClick={onClick}>
    <div className="cm-thread-avatar-wrap">
      <img 
        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
        alt={student.name} 
        className="cm-thread-avatar" 
      />
      {isOnline && <span className="cm-status-indicator cm-status-online" />}
    </div>
    <div className="cm-thread-info">
      <div className="cm-thread-top">
        <span className="cm-thread-name">{student.name}</span>
        <span className="cm-thread-time">{formatTime(lastAt)}</span>
      </div>
      <div className="cm-thread-preview">
        <span className="cm-thread-last">
          {lastMsg || 'No messages yet'}
        </span>
        {unread > 0 && <span className="cm-unread-dot-indicator" />}
      </div>
    </div>
  </div>
);

/* ── Message bubble ───────────────────────────────────────────── */
const Bubble = ({ msg, isMine, peerAvatar }) => (
  <div className={`cm-bubble-container ${isMine ? 'cm-mine-container' : 'cm-theirs-container'}`}>
    <img 
      src={isMine ? 'https://ui-avatars.com/api/?name=Counsellor&background=1a2234&color=fff' : (peerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=f1f5f9`)} 
      alt="avatar" 
      className="cm-bubble-avatar" 
    />
    <div className={`cm-bubble-wrap ${isMine ? 'cm-mine' : 'cm-theirs'}`}>
      <div className={`cm-bubble ${isMine ? 'cm-bubble-mine' : 'cm-bubble-theirs'}`}>
        {msg.text}
      </div>
      <div className="cm-bubble-footer">
        {formatTime(msg.createdAt || msg.timestamp)}
        {isMine && <CheckCheck size={14} className="cm-read-tick" />}
      </div>
    </div>
  </div>
);

/* ── Main component ───────────────────────────────────────────── */
const CounsellorMessages = () => {
  const { user }  = useAuth();
  const socketRef = useRef(null);

  const [students,  setStudents]  = useState([]);
  const [convMap,   setConvMap]   = useState({});
  const [activeId,  setActiveId]  = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [search,    setSearch]    = useState('');
  const [activeTab,  setActiveTab] = useState('ALL');
  const [sideLoad,  setSideLoad]  = useState(true);
  const [msgLoad,   setMsgLoad]   = useState(false);
  const [typing,    setTyping]    = useState(false);
  const [sending,   setSending]   = useState(false);

  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  // Ref so socket callbacks always read the latest activeId without re-subscribing
  const activeIdRef = useRef(null);
  activeIdRef.current = activeId;

  /* ── Init socket once ─────────────────────────────────────── */
  useEffect(() => {
    socketRef.current = getSocket(localStorage.getItem('token'));
  }, []);

  /* ── Load assigned students ───────────────────────────────── */
  useEffect(() => {
    getCounsellorProfile()
      .then(res => setStudents(res.data.data?.assignedStudents || []))
      .catch(console.error)
      .finally(() => setSideLoad(false));
  }, []);

  /* ── Dedup append ─────────────────────────────────────────── */
  const appendMessage = useCallback((msg) => {
    setMessages(prev => {
      if (prev.some(m => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  }, []);

  /* ── Socket listeners (set up once) ──────────────────────── */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Message from the OTHER person
    const onDmMessage = (msg) => {
      const isFromStudent = msg.senderRole === 'student';
      const partnerId = isFromStudent
        ? msg.senderId?.toString()
        : msg.studentId?.toString();

      if (partnerId === activeIdRef.current) {
        appendMessage(msg);
        markRead(partnerId).catch(() => {});
      } else {
        setConvMap(prev => ({
          ...prev,
          [partnerId]: {
            unread:  ((prev[partnerId]?.unread) || 0) + (isFromStudent ? 1 : 0),
            lastMsg: msg.text,
            lastAt:  msg.createdAt,
          },
        }));
      }
    };

    // Server confirms the sender's message was saved — replace sending indicator
    const onDmSaved = (msg) => {
      setSending(false);
      appendMessage(msg);
      setConvMap(prev => ({
        ...prev,
        [activeIdRef.current]: {
          ...(prev[activeIdRef.current] || {}),
          lastMsg: msg.text,
          lastAt:  msg.createdAt,
        },
      }));
    };

    const onTyping = ({ fromUserId, isTyping: t }) => {
      if (fromUserId?.toString() === activeIdRef.current) {
        setTyping(t);
        if (t) {
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setTyping(false), 3000);
        }
      }
    };

    const onError = () => setSending(false);

    socket.on('dm:message',       onDmMessage);
    socket.on('dm:message:saved', onDmSaved);
    socket.on('dm:typing',        onTyping);
    socket.on('dm:error',         onError);

    return () => {
      socket.off('dm:message',       onDmMessage);
      socket.off('dm:message:saved', onDmSaved);
      socket.off('dm:typing',        onTyping);
      socket.off('dm:error',         onError);
    };
  }, [appendMessage]);

  /* ── Open conversation ────────────────────────────────────── */
  const openConversation = useCallback(async (studentId) => {
    if (activeIdRef.current === studentId) return;
    setActiveId(studentId);
    setMessages([]);
    setTyping(false);
    setMsgLoad(true);

    socketRef.current?.emit('dm:join', studentId);

    try {
      const res = await getConversation(studentId);
      setMessages(res.data.data || []);
      await markRead(studentId);
      setConvMap(prev => ({
        ...prev,
        [studentId]: { ...(prev[studentId] || {}), unread: 0 },
      }));
    } catch (err) {
      console.error('[Messages] load failed', err);
    } finally {
      setMsgLoad(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, []);

  /* ── Auto-scroll ──────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  /* ── Send ─────────────────────────────────────────────────── */
  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setInput('');
    setSending(true);
    // No optimistic bubble — dm:message:saved will add the real doc
    socketRef.current?.emit('dm:send', { toUserId: activeId, text });
  };

  /* ── Typing indicator emit ────────────────────────────────── */
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (activeId && socketRef.current) {
      socketRef.current.emit('dm:typing', { toUserId: activeId, isTyping: true });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socketRef.current?.emit('dm:typing', { toUserId: activeId, isTyping: false });
      }, 1500);
    }
  };

  const filtered = students.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeStudent = students.find(s => s._id?.toString() === activeId);

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <CounsellorLayout>
      <div className={`cm-page ${activeId ? 'mobile-active' : ''}`}>

        {/* Left: thread list */}
        <div className="cm-sidebar">
          <div className="cm-sidebar-header">
            <h2 className="cm-sidebar-title">Conversations</h2>
            <button className="cm-new-chat-btn"><Plus size={18} /></button>
          </div>

          <div className="cm-search-wrap">
            <Search size={18} className="cm-search-icon" />
            <input
              className="cm-search"
              placeholder="Search student or message..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="cm-tabs">
            {['ALL', 'UNREAD', 'ARCHIVED'].map(tab => (
              <button 
                key={tab} 
                className={`cm-tab ${activeTab === tab ? 'cm-tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="cm-thread-list">
            {sideLoad ? (
              <div className="cm-sidebar-loading">
                {[1,2,3,4].map(i => <div key={i} className="cm-skeleton" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="cm-empty-threads">
                {search ? 'No students match.' : 'No students assigned yet.'}
              </div>
            ) : (
              filtered.map(s => (
                <ThreadItem
                  key={s._id}
                  student={s}
                  active={s._id?.toString() === activeId}
                  unread={convMap[s._id?.toString()]?.unread || 0}
                  lastMsg={convMap[s._id?.toString()]?.lastMsg}
                  lastAt={convMap[s._id?.toString()]?.lastAt}
                  onClick={() => openConversation(s._id?.toString())}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: chat */}
        <div className="cm-chat">
          {!activeId ? (
            <div className="cm-chat-empty">
              <MessageSquare size={52} strokeWidth={1.2} />
              <h3>Select a student to start messaging</h3>
              <p>Messages are private and only visible to you and the student.</p>
            </div>
          ) : (
            <>
              <div className="cm-chat-header">
                <button className="cm-mobile-back-btn" onClick={() => setActiveId(null)}>
                  <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                </button>
                <img 
                  src={activeStudent?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeStudent?.name || 'Student')}&background=random`} 
                  className="cm-chat-avatar" 
                  alt="avatar" 
                />
                <div className="cm-chat-peer-info">
                  <div className="cm-peer-name-wrap">
                    <span className="cm-chat-peer-name">{activeStudent?.name}</span>
                    <span className="cm-online-bullet" />
                  </div>
                  <span className="cm-chat-status">
                    Online
                    {typing && <span className="cm-typing-text"> · typing…</span>}
                  </span>
                </div>
                <div className="cm-chat-header-actions">
                  <button className="cm-header-action-btn"><Phone size={20} /></button>
                  <button className="cm-header-action-btn"><Video size={20} /></button>
                  <button className="cm-header-action-btn"><Info size={20} /></button>
                </div>
              </div>

              <div className="cm-messages">
                <div className="cm-date-divider">
                  <span className="cm-date-text">Today</span>
                </div>
                {msgLoad ? (
                  <div className="cm-msg-state">Loading messages…</div>
                ) : messages.length === 0 && !sending ? (
                  <div className="cm-msg-state">
                    <MessageSquare size={28} strokeWidth={1.5} />
                    <p>No messages yet. Say hello to {activeStudent?.name}!</p>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <Bubble
                      key={m._id || i}
                      msg={m}
                      peerAvatar={activeStudent?.avatar}
                      isMine={
                        m.senderId?.toString() === user?.id ||
                        m.senderRole === 'counsellor'
                      }
                    />
                  ))
                )}

                {/* Sending spinner — shown while waiting for dm:message:saved */}
                {sending && (
                  <div className="cm-bubble-wrap cm-mine">
                    <div className="cm-bubble cm-bubble-mine cm-bubble-sending">
                      <span className="cm-sending-dots"><span/><span/><span/></span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="cm-input-area">
                <form className="cm-input-box" onSubmit={send}>
                  <button type="button" className="cm-input-action-btn"><Plus size={20} /></button>
                  <button type="button" className="cm-input-action-btn"><Smile size={20} /></button>
                  <input
                    ref={inputRef}
                    className="cm-input"
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(e)}
                    disabled={sending}
                  />
                  <div className="cm-input-actions">
                    <button type="button" className="cm-input-action-btn"><Paperclip size={20} /></button>
                    <button type="submit" className="cm-send-btn" disabled={!input.trim() || sending}>
                      <Send size={22} fill="white" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) /* END activeId conditional */}
        </div>

      </div>
    </CounsellorLayout>
  );
};

export default CounsellorMessages;
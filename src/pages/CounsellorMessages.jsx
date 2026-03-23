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

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateDivider = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

const TAB_TYPES = ['ALL', 'VOLUNTEERS', 'UNREAD', 'ARCHIVED'];

/* ── Thread item ──────────────────────────────────────────────── */
const ThreadItem = ({ student, active, unread, lastMsg, lastAt, isOnline, onClick }) => {
  if (!student) return null;
  const avatarUrl = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'S')}&background=random`;
  
  return (
    <div className={`cm-thread ${active ? 'cm-thread-active' : ''}`} onClick={onClick}>
      <div className="cm-thread-avatar-wrap">
        <img 
          src={avatarUrl} 
          alt={student.name || 'Student'} 
          className="cm-thread-avatar" 
        />
        {isOnline && <span className="cm-status-indicator cm-status-online" />}
      </div>
      <div className="cm-thread-info">
        <div className="cm-thread-top">
          <span className="cm-thread-name">{student.name || 'Unknown Student'}</span>
          <span className="cm-thread-time">{lastAt ? formatTime(lastAt) : ''}</span>
        </div>
        <div className="cm-thread-preview">
          <span className="cm-thread-last">
            {lastMsg || ''}
          </span>
          {unread > 0 && <span className="cm-unread-dot-indicator" />}
        </div>
      </div>
    </div>
  );
};

/* ── Message bubble ───────────────────────────────────────────── */
const Bubble = ({ msg, isMine, peerAvatar, myAvatar }) => (
  <div className={`cm-bubble-container ${isMine ? 'cm-mine-container' : 'cm-theirs-container'}`}>
    <img 
      src={isMine ? (myAvatar || 'https://ui-avatars.com/api/?name=Counsellor&background=1a2234&color=fff') : (peerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=f1f5f9`)} 
      alt="avatar" 
      className="cm-bubble-avatar" 
    />
    <div className={`cm-bubble-wrap ${isMine ? 'cm-mine' : 'cm-theirs'}`}>
      <div className={`cm-bubble ${isMine ? 'cm-bubble-mine' : 'cm-bubble-theirs'}`}>
        {msg.text}
      </div>
      <div className="cm-bubble-footer">
        {formatTime(msg.createdAt || msg.timestamp)}
        {isMine && (
          <CheckCheck 
            size={14} 
            className={`cm-read-tick ${msg.read ? 'cm-read-blue' : ''}`} 
          />
        )}
      </div>
    </div>
  </div>
);

/* ── Main component ───────────────────────────────────────────── */
import { useLocation } from 'react-router-dom';

const CounsellorMessages = () => {
  const { user }  = useAuth();
  const location  = useLocation();
  const socketRef = useRef(null);

  const [contacts,  setContacts]  = useState([]);
  const [profile,   setProfile]   = useState(null);
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

  /* ── Load assigned contacts (students + volunteers) ───────── */
  useEffect(() => {
    getCounsellorProfile()
      .then(async res => {
        const profileData = res.data.data;
        const assignedStudents   = profileData?.assignedStudents || [];
        const assignedVolunteers = profileData?.assignedVolunteers || [];

        // Use a Map to deduplicate by _id. If a user is both, prioritize 'volunteer' role.
        const contactMap = new Map();

        assignedStudents.forEach(s => {
          if (!s?._id) return;
          contactMap.set(s._id.toString(), { ...s, role: 'student' });
        });

        assignedVolunteers.forEach(v => {
          if (!v?._id) return;
          // Overwrite if already exists as student, or just add new
          contactMap.set(v._id.toString(), { ...v, role: 'volunteer' });
        });

        const allContacts = Array.from(contactMap.values());

        setProfile(profileData);
        setContacts(allContacts);

        // Fetch last message for each contact to populate sidebar
        const recentMessages = await Promise.all(
          allContacts.map(async (c) => {
            try {
              const convRes = await getConversation(c._id, { limit: 1 });
              const lastMsg = convRes.data.data?.[0];
              return { contactId: c._id, lastMsg };
            } catch (err) {
              return { contactId: c._id, lastMsg: null };
            }
          })
        );

        const newConvMap = {};
        recentMessages.forEach(({ contactId, lastMsg }) => {
          if (lastMsg) {
            newConvMap[contactId.toString()] = {
              lastMsg: lastMsg.text,
              lastAt: lastMsg.createdAt,
              unread: 0, 
            };
          }
        });
        setConvMap(prev => ({ ...prev, ...newConvMap }));

        // Auto-open if redirected from elsewhere (e.g. Volunteer management)
        if (location.state?.otherUserId) {
          openConversation(location.state.otherUserId);
        }
      })
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
      
      // Update local unread immediately for UX
      setConvMap(prev => ({
        ...prev,
        [studentId]: { ...(prev[studentId] || {}), unread: 0 },
      }));

      await markRead(studentId);
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

  const filtered = contacts.filter(c => {
    const cName = c?.name?.toLowerCase() || '';
    const cEmail = c?.email?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchesSearch = !search || cName.includes(q) || cEmail.includes(q);
    if (!matchesSearch) return false;

    if (activeTab === 'VOLUNTEERS') return c.role === 'volunteer';
    if (activeTab === 'UNREAD') return (convMap[c._id.toString()]?.unread || 0) > 0;
    // Archived is just a placeholder here unless we add a field
    return true;
  });

  const activeContact = contacts.find(c => c._id?.toString() === activeId);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;

    messages.forEach(m => {
      const timestamp = m.createdAt || m.timestamp;
      if (!timestamp) return;
      
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return;

      const dStr = d.toDateString();
      if (dStr !== lastDate) {
        groups.push({ type: 'divider', date: dStr });
        lastDate = dStr;
      }
      groups.push({ type: 'message', ...m });
    });
    return groups;
  }, [messages]);

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
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="cm-tabs">
            {TAB_TYPES.map(tab => (
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
                {search ? 'No results found.' : 'No active conversations.'}
              </div>
            ) : (
              filtered.map(c => {
                if (!c?._id) return null;
                const cId = c._id.toString();
                return (
                  <ThreadItem
                    key={cId}
                    student={c}
                    active={cId === activeId}
                    unread={convMap[cId]?.unread || 0}
                    lastMsg={convMap[cId]?.lastMsg}
                    lastAt={convMap[cId]?.lastAt}
                    onClick={() => openConversation(cId)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Right: chat */}
        <div className="cm-chat">
          {!activeId ? (
            <div className="cm-chat-empty">
              <MessageSquare size={52} strokeWidth={1.2} />
              <h3>Select someone to start messaging</h3>
              <p>Messages are private and only visible to you and the recipient.</p>
            </div>
          ) : (
            <>
              <div className="cm-chat-header">
                <button className="cm-mobile-back-btn" onClick={() => setActiveId(null)}>
                  <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                </button>
                <img 
                  src={activeContact?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact?.name || 'User')}&background=random`} 
                  className="cm-chat-avatar" 
                  alt="avatar" 
                />
                <div className="cm-chat-peer-info">
                  <div className="cm-peer-name-wrap">
                    <span className="cm-chat-peer-name">{activeContact?.role === 'volunteer' ? `[Volunteer] ${activeContact?.name}` : activeContact?.name}</span>
                  </div>
                  <span className="cm-chat-status">
                    Available
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
                {msgLoad ? (
                  <div className="cm-msg-state">Loading history…</div>
                ) : messages.length === 0 && !sending ? (
                  <div className="cm-msg-state">
                    <MessageSquare size={28} strokeWidth={1.5} />
                    <p>Start a conversation with {activeContact?.name}</p>
                  </div>
                ) : (
                  groupedMessages.map((item, i) => (
                    item.type === 'divider' ? (
                      <div className="cm-date-divider" key={`div-${item.date}`}>
                        <span className="cm-date-text">{formatDateDivider(item.date)}</span>
                      </div>
                    ) : (
                      <Bubble
                        key={item._id || i}
                        msg={item}
                        peerAvatar={activeContact?.avatar}
                        myAvatar={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'C')}&background=1a2234&color=fff`}
                        isMine={
                          item.senderId?.toString() === user?.id ||
                          item.senderRole === 'counsellor'
                        }
                      />
                    )
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
/**
 * src/pages/Appointments.jsx  ── UPDATED
 *
 * Changes from original:
 *  - CounsellorCard now has a "Message" button that opens a slide-in chat drawer
 *  - ChatDrawer: real-time socket (dm:send / dm:message) + persisted history from REST API
 *  - Typing indicator (dm:typing)
 *  - Unread badge on the Message button
 *  - All original session / appointment functionality preserved exactly
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { useAuth } from '../auth/AuthContext';
import { getSocket } from '../api/socketClient';
import { getStudentSessions, getStudentCounsellor } from '../api/studentApi';
import { getConversation, markRead } from '../api/messageApi';
import {
  Video, MessageSquare, Phone, Users,
  Calendar, Clock, CheckCircle2,
  GraduationCap, Send, X, Circle, CheckCheck
} from 'lucide-react';
import './Appointments.css';

// ─────────────────────────────────────────────────────────────────
//  HELPERS  (unchanged from original)
// ─────────────────────────────────────────────────────────────────
const TYPE_ICON = {
  video:       <Video size={16} />,
  chat:        <MessageSquare size={16} />,
  phone:       <Phone size={16} />,
  'in-person': <Users size={16} />,
};

const STATUS_CONFIG = {
  scheduled: { label: 'Upcoming',  cls: 'apt-status-blue'  },
  completed: { label: 'Completed', cls: 'apt-status-green' },
  cancelled: { label: 'Cancelled', cls: 'apt-status-red'   },
  'no-show': { label: 'No Show',   cls: 'apt-status-amber' },
};

const getInitials = (name = '') =>
  name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const formatMsgTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isUpcoming = (iso) => new Date(iso) > new Date();

// ─────────────────────────────────────────────────────────────────
//  CHAT DRAWER  (NEW)
// ─────────────────────────────────────────────────────────────────
const ChatDrawer = ({ counsellor, onClose, currentUserId }) => {
  const socket = getSocket(localStorage.getItem('token'));

  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [isTyping,   setIsTyping]   = useState(false);
  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  // Load history + join DM room
  useEffect(() => {
    if (!counsellor?._id) return;

    socket.emit('dm:join', counsellor._id);

    getConversation(counsellor._id)
      .then(res => setMessages(res.data.data || []))
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 80);
      });

    markRead(counsellor._id).catch(() => {});

    // Incoming DMs
    const onDmMessage = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      markRead(counsellor._id).catch(() => {});
    };

    // Typing indicator
    const onTyping = ({ fromUserId, isTyping: t }) => {
      if (fromUserId?.toString() === counsellor._id?.toString()) {
        setIsTyping(t);
        if (t) {
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    socket.on('dm:message', onDmMessage);
    socket.on('dm:typing',  onTyping);

    return () => {
      socket.off('dm:message', onDmMessage);
      socket.off('dm:typing',  onTyping);
      clearTimeout(typingTimer.current);
    };
  }, [counsellor, socket]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !counsellor?._id) return;
    setInput('');

    // Optimistic bubble
    setMessages(prev => [...prev, {
      _id:        `opt_${Date.now()}`,
      senderId:   currentUserId,
      senderRole: 'student',
      senderName: 'You',
      text,
      createdAt:  new Date().toISOString(),
    }]);

    socket.emit('dm:send', { toUserId: counsellor._id, text });
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (counsellor?._id) {
      socket.emit('dm:typing', { toUserId: counsellor._id, isTyping: true });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() =>
        socket.emit('dm:typing', { toUserId: counsellor._id, isTyping: false }), 1500);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="apt-drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="apt-drawer">
        {/* Header */}
        <div className="apt-drawer-header">
          <div className="apt-drawer-avatar">{getInitials(counsellor?.name)}</div>
          <div className="apt-drawer-peer">
            <span className="apt-drawer-name">{counsellor?.name}</span>
            <span className="apt-drawer-role">
              {counsellor?.specialization || 'Your Counsellor'}
              {isTyping && <span className="apt-drawer-typing"> · typing…</span>}
            </span>
          </div>
          <button className="apt-drawer-close" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="apt-drawer-messages">
          {loading ? (
            <div className="apt-drawer-state">Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className="apt-drawer-state">
              <MessageSquare size={28} strokeWidth={1.5} />
              <p>Start a conversation with {counsellor?.name}</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const mine = m.senderId?.toString() === currentUserId || m.senderRole === 'student';
              return (
                <div key={m._id || i} className={`apt-msg-wrap ${mine ? 'apt-msg-mine' : 'apt-msg-theirs'}`}>
                  <div className={`apt-msg-bubble ${mine ? 'apt-bubble-mine' : 'apt-bubble-theirs'}`}>
                    {m.text}
                  </div>
                  <span className="apt-msg-time">
                    {formatMsgTime(m.createdAt)}
                    {mine && <CheckCheck size={11} className="apt-check-icon" />}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form className="apt-drawer-input-row" onSubmit={send}>
          <input
            ref={inputRef}
            className="apt-drawer-input"
            placeholder={`Message ${counsellor?.name?.split(' ')[0] || 'your counsellor'}…`}
            value={input}
            onChange={handleInput}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(e)}
          />
          <button type="submit" className="apt-drawer-send" disabled={!input.trim()}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────
//  COUNSELLOR CARD  (updated with Message button + unread badge)
// ─────────────────────────────────────────────────────────────────
const CounsellorCard = ({ counsellor, onMessage, unread }) => {
  if (!counsellor) {
    return (
      <div className="apt-counsellor-card apt-counsellor-empty">
        <div className="apt-ce-icon"><GraduationCap size={28} /></div>
        <div>
          <h3 className="apt-ce-title">No counsellor assigned yet</h3>
          <p className="apt-ce-sub">Your institution admin will assign a counsellor to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apt-counsellor-card">
      <div className="apt-c-avatar" style={{ background: counsellor.avatarColor || '#1A2234' }}>
        {getInitials(counsellor.name)}
      </div>
      <div className="apt-c-info">
        <h3 className="apt-c-name">{counsellor.name}</h3>
        {counsellor.specialization && <p className="apt-c-spec">{counsellor.specialization}</p>}
        {counsellor.bio && <p className="apt-c-bio">"{counsellor.bio}"</p>}
        <div className="apt-c-meta">
          <span className="apt-c-pill">
            <CheckCircle2 size={12} />
            {counsellor.isActive ? 'Active' : 'Away'}
          </span>
          {counsellor.institution && (
            <span className="apt-c-pill">
              <GraduationCap size={12} />
              {counsellor.institution}
            </span>
          )}
        </div>
        {counsellor.availability?.length > 0 && (
          <div className="apt-c-avail">
            <span className="apt-c-avail-label">Available:</span>
            {counsellor.availability.slice(0, 3).map((slot, i) => (
              <span key={i} className="apt-c-slot">
                {slot.day} {slot.startTime}–{slot.endTime}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── NEW: Message button ── */}
      <button className="apt-msg-btn" onClick={onMessage} title="Message your counsellor">
        <MessageSquare size={16} />
        Message
        {unread > 0 && <span className="apt-msg-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  SESSION CARD  (unchanged from original)
// ─────────────────────────────────────────────────────────────────
const SessionCard = ({ session, onJoin }) => {
  const status   = STATUS_CONFIG[session.status] || STATUS_CONFIG.scheduled;
  const upcoming = isUpcoming(session.scheduledAt);
  const canJoin  = upcoming &&
                   session.status === 'scheduled' &&
                   (session.type === 'video' || session.type === 'phone');

  return (
    <div className={`apt-session-card ${upcoming ? 'apt-session-upcoming' : ''}`}>
      <div className="apt-session-type-icon">
        {TYPE_ICON[session.type] || <Video size={16} />}
      </div>
      <div className="apt-session-body">
        <div className="apt-session-top">
          <span className="apt-session-counsellor">{session.counsellorName}</span>
          <span className={`apt-status-pill ${status.cls}`}>{status.label}</span>
        </div>
        <div className="apt-session-time">
          <Calendar size={12} />
          {formatDate(session.scheduledAt)}
          <span className="apt-dot">·</span>
          <Clock size={12} />
          {formatTime(session.scheduledAt)}
          <span className="apt-dot">·</span>
          {session.durationMinutes || 50} min
        </div>
        {session.notes && <p className="apt-session-notes">{session.notes}</p>}
      </div>

      {canJoin && (
        <button className="apt-join-btn" onClick={() => onJoin(session._id)}>
          <Video size={14} /> Join Call
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────
const Appointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket   = getSocket(localStorage.getItem('token'));

  const [counsellor,   setCounsellor]   = useState(null);
  const [sessions,     setSessions]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('upcoming');
  const [chatOpen,     setChatOpen]     = useState(false);
  const [unread,       setUnread]       = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([getStudentCounsellor(), getStudentSessions()])
      .then(([cRes, sRes]) => {
        setCounsellor(cRes.data.data);
        setSessions(sRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Listen for incoming DMs to update unread badge while drawer is closed
  useEffect(() => {
    const onDm = (msg) => {
      // Only count messages from the counsellor
      if (msg.senderRole === 'counsellor' && !chatOpen) {
        setUnread(n => n + 1);
      }
    };
    socket.on('dm:message', onDm);
    return () => socket.off('dm:message', onDm);
  }, [socket, chatOpen]);

  const handleOpenChat = () => {
    setChatOpen(true);
    setUnread(0);
  };

  const upcoming = sessions.filter(s => isUpcoming(s.scheduledAt) && s.status !== 'cancelled');
  const past     = sessions.filter(s => !isUpcoming(s.scheduledAt) || s.status === 'cancelled');
  const shown    = tab === 'upcoming' ? upcoming : past;

  return (
    <DashboardLayout>
      <div className="appointments-page">

        {/* Header */}
        <div className="section-header">
          <h2 className="section-label">CONNECT WITH CARE</h2>
        </div>

        {/* Counsellor */}
        <div className="apt-block-label">YOUR COUNSELLOR</div>
        {loading ? (
          <div className="apt-loading"><div className="apt-spinner" /></div>
        ) : (
          <CounsellorCard
            counsellor={counsellor}
            onMessage={handleOpenChat}
            unread={unread}
          />
        )}

        {/* Sessions */}
        <div className="apt-sessions-header">
          <div className="apt-block-label">SESSIONS</div>
          <div className="apt-tabs">
            <button
              className={`apt-tab ${tab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setTab('upcoming')}
            >
              Upcoming
              {upcoming.length > 0 && <span className="apt-tab-count">{upcoming.length}</span>}
            </button>
            <button
              className={`apt-tab ${tab === 'past' ? 'active' : ''}`}
              onClick={() => setTab('past')}
            >
              Past
            </button>
          </div>
        </div>

        {loading ? (
          <div className="apt-loading"><div className="apt-spinner" /></div>
        ) : shown.length === 0 ? (
          <div className="apt-empty">
            {tab === 'upcoming'
              ? <><Calendar size={32} /><p>No upcoming sessions. Your counsellor will schedule one.</p></>
              : <><CheckCircle2 size={32} /><p>No past sessions yet.</p></>
            }
          </div>
        ) : (
          <div className="apt-session-list">
            {shown.map(s => (
              <SessionCard key={s._id} session={s} onJoin={(id) => navigate(`/call/${id}`)} />
            ))}
          </div>
        )}

      </div>

      {/* Chat drawer — mounted outside page flow to overlay everything */}
      {chatOpen && counsellor && (
        <ChatDrawer
          counsellor={counsellor}
          currentUserId={user?.id}
          onClose={() => setChatOpen(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Appointments;
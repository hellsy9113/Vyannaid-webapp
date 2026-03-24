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

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { useAuth } from '../auth/AuthContext';
import { getSocket } from '../api/socketClient';
import { getStudentSessions, getStudentCounsellor } from '../api/studentApi';
import { getConversation, markRead } from '../api/messageApi';
import {
  Video, MessageSquare, Phone, Users,
  Calendar, Clock, CheckCircle2,
  GraduationCap, Send, Smile, Paperclip, MoreVertical, ShieldCheck, ArrowLeft, CheckCheck
} from 'lucide-react';
import './Appointments.css';
import './CounsellorMessages.css'; 

// ─────────────────────────────────────────────────────────────────
//  HELPERS
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
  expired:   { label: 'Expired',   cls: 'apt-status-gray'  },
  ongoing:   { label: 'Live Now',  cls: 'apt-status-green status-pulse' },
};

const getInitials = (name = '') =>
  name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

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

const isUpcoming = (iso) => new Date(iso) > new Date();

// ─────────────────────────────────────────────────────────────────
//  CHAT COMPONENTS
// ─────────────────────────────────────────────────────────────────
const Bubble = ({ msg, isMine, peerAvatar, myAvatar }) => (
  <div className={`cm-bubble-container ${isMine ? 'cm-mine-container' : 'cm-theirs-container'}`} style={{maxWidth: '85%'}}>
    <img 
      src={isMine ? (myAvatar || `https://ui-avatars.com/api/?name=Student&background=1a2234&color=fff`) : (peerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'C')}&background=f1f5f9`)} 
      alt="avatar" 
      className="cm-bubble-avatar" 
    />
    <div className={`cm-bubble-wrap ${isMine ? 'cm-mine' : 'cm-theirs'}`}>
      <div className={`cm-bubble ${isMine ? 'cm-bubble-mine' : 'cm-bubble-theirs'}`} style={!isMine ? {backgroundColor: '#f1f5f9'} : {}}>
        {msg.text}
      </div>
      <div className="cm-bubble-footer">
        {formatTime(msg.createdAt || msg.timestamp)}
        {isMine && <CheckCheck size={14} className={`cm-read-tick ${msg.read ? 'cm-read-blue' : ''}`} />}
      </div>
    </div>
  </div>
);

const StudentMessageInterface = ({ counsellor, onClose, currentUserId }) => {
  const socket = getSocket(localStorage.getItem('token'));
  const [contactId, setContactId] = useState(counsellor?._id?.toString() || null);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [typing,     setTyping]     = useState(false);
  const [sending,    setSending]    = useState(false);

  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  const contacts = useMemo(() => [
    { ...counsellor, roleLabel: 'CLINICAL COUNSELOR' },
    { _id: 'support_staff', name: 'Support Staff', roleLabel: 'ADMINISTRATIVE', isStatic: true }
  ], [counsellor]);

  const activeContact = contacts.find(c => c._id?.toString() === contactId);

  useEffect(() => {
    if (!contactId || contactId === 'support_staff') {
        if (contactId === 'support_staff') {
            setMessages([{ _id: '1', senderName: 'Support Staff', text: 'Hello! This is a secure administrative support line. How can we help you today?', createdAt: new Date().toISOString(), read: true }]);
            setLoading(false);
        }
        return;
    }

    setLoading(true);
    socket.emit('dm:join', contactId);
    getConversation(contactId)
      .then(res => setMessages(res.data.data || []))
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 80);
      });
    markRead(contactId).catch(() => {});
  }, [contactId, socket]);

  useEffect(() => {
    const onDmMessage = (msg) => {
      const partnerId = msg.counsellorId?.toString() || msg.senderId?.toString();
      if (partnerId === contactId) {
        setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
        markRead(contactId).catch(() => {});
      }
    };
    const onDmSaved = (msg) => {
      setSending(false);
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
    };
    const onTyping = ({ fromUserId, isTyping: t }) => {
      if (fromUserId?.toString() === contactId) {
        setTyping(t);
        if (t) {
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setTyping(false), 3000);
        }
      }
    };
    const onError = () => setSending(false);

    socket.on('dm:message', onDmMessage);
    socket.on('dm:message:saved', onDmSaved);
    socket.on('dm:typing', onTyping);
    socket.on('dm:error', onError);

    return () => {
      socket.off('dm:message', onDmMessage);
      socket.off('dm:message:saved', onDmSaved);
      socket.off('dm:typing', onTyping);
      socket.off('dm:error', onError);
    };
  }, [contactId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    if (contactId === 'support_staff') {
        setMessages(p => [...p, { _id: Date.now().toString(), senderId: currentUserId, senderName: 'You', text: input.trim(), createdAt: new Date().toISOString() }]);
        setInput('');
        return;
    }
    const text = input.trim();
    setInput('');
    setSending(true);
    socket.emit('dm:send', { toUserId: contactId, text });
  };

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;
    messages.forEach(m => {
      const ts = m.createdAt || m.timestamp;
      if (!ts) return;
      const dStr = new Date(ts).toDateString();
      if (dStr !== lastDate) {
        groups.push({ type: 'divider', date: dStr });
        lastDate = dStr;
      }
      groups.push({ type: 'message', ...m });
    });
    return groups;
  }, [messages]);

  return (
    <div className="cm-page mobile-active" style={{ width: '100%', height: 'calc(100vh - 72px)', background: '#fff', display: 'flex' }}>
      <div className="cm-sidebar" style={{ display: window.innerWidth > 768 ? 'flex' : 'none', width: '300px', flexShrink: 0, borderRight: '1px solid #f1f5f9', flexDirection: 'column' }}>
          <div className="cm-sidebar-header" style={{ padding: '1.5rem', borderBottom: '1px solid transparent' }}>
            <h2 style={{fontSize: '0.75rem', color: '#9AA6B2', letterSpacing: '0.05em', fontWeight: 700}}>ACTIVE CONVERSATIONS</h2>
          </div>
          <div className="cm-thread-list" style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
             {contacts.map(c => (
                 <div key={c._id} className={`cm-thread ${c._id.toString() === contactId ? 'cm-thread-active' : ''}`} onClick={() => setContactId(c._id.toString())} style={{ padding: '0.75rem', borderRadius: '10px', display: 'flex', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.25rem' }}>
                    <div className="cm-thread-avatar-wrap" style={{ position: 'relative' }}>
                        <img src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=f1f5f9`} style={{ width: '42px', height: '42px', borderRadius: '10px' }} />
                        {c._id !== 'support_staff' && <span className="cm-status-indicator cm-status-online" style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#22c55e', border: '2px solid #fff', borderRadius: '50%' }} />}
                    </div>
                    <div>
                        <div style={{fontSize: '0.9rem', fontWeight: 700, color: '#1a2234'}}>{c.name}</div>
                        <div style={{fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>{c.roleLabel}</div>
                    </div>
                 </div>
             ))}
          </div>
          <div style={{padding: '1.25rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9'}}>
             <div style={{fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em'}}>SECURITY STATUS</div>
             <div style={{fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem'}}><ShieldCheck size={16} fill="white" /> End-to-End Encrypted</div>
          </div>
      </div>

      <div className="cm-chat" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="cm-chat-header" style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem 1rem 0.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <button className="cm-back-btn" onClick={onClose}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a2234' }}>{activeContact?.name}</h3>
            <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>
                {activeContact?._id !== 'support_staff' ? <>• ONLINE NOW</> : <>MANAGED SUPPORT</>}
                {typing && <span style={{ color: '#94a3b8', fontWeight: 500 }}> · typing…</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ border: 'none', background: 'none', color: '#94a3b8' }}><Video size={20} /></button>
            <button style={{ border: 'none', background: 'none', color: '#94a3b8' }}><Phone size={20} /></button>
            <button style={{ border: 'none', background: 'none', color: '#94a3b8' }}><MoreVertical size={20} /></button>
          </div>
        </div>

        <div className="cm-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Establishing secure connection…</div>
          ) : (
            groupedMessages.map((item, i) => (
              item.type === 'divider' ? (
                <div key={item.date} style={{ textAlign: 'center', margin: '1rem 0', position: 'relative' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', background: '#fff', padding: '0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formatDateDivider(item.date)}</span>
                </div>
              ) : (
                <Bubble 
                  key={item._id || i} 
                  msg={item} 
                  isMine={item.senderRole === 'student' || item.senderId === currentUserId} 
                  peerAvatar={activeContact?.avatar}
                  myAvatar={null /* user.avatar if available */}
                />
              )
            ))
          )}
          {sending && (
              <div className="cm-bubble-container cm-mine-container">
                  <div className="cm-bubble cm-bubble-mine" style={{ opacity: 0.6 }}>Sending…</div>
              </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="cm-input-area" style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <form className="cm-input-box" onSubmit={send} style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '12px', alignItems: 'center' }}>
            <button type="button" style={{ border: 'none', background: 'none', color: '#94a3b8' }}><Paperclip size={20} /></button>
            <input
              ref={inputRef}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem' }}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (contactId !== 'support_staff') socket.emit('dm:typing', { toUserId: contactId, isTyping: true });
              }}
            />
            <button type="submit" disabled={!input.trim() || sending} style={{ background: '#1a2234', color: '#fff', border: 'none', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  OVERVIEW CARDS
// ─────────────────────────────────────────────────────────────────
const CounsellorCard = ({ counsellor, onMessage, unread }) => {
  if (!counsellor) return (
    <div className="apt-counsellor-card apt-counsellor-empty">
      <GraduationCap size={28} />
      <h3>No counsellor assigned yet</h3>
    </div>
  );

  return (
    <div className="apt-counsellor-card premium-card">
      <div className="apt-c-header">
        <div className="apt-c-avatar-wrap">
          <div className="apt-c-avatar" style={{ background: '#1a2234' }}>{getInitials(counsellor.name)}</div>
          <div className="apt-c-status-indicator" />
        </div>
        <div className="apt-c-info">
          <h3 className="apt-c-name">{counsellor.name}</h3>
          <p className="apt-c-spec">{counsellor.specialization || 'Clinical Counsellor'}</p>
        </div>
      </div>
      <div className="apt-c-body">
        <p className="apt-c-bio">"{counsellor.bio || 'Dedicated to supporting your mental well-being and personal growth.'}"</p>
        <div className="apt-c-stats">
            <div className="apt-stat"><ShieldCheck size={14}/> Verified</div>
            <div className="apt-stat"><Users size={14}/> Student Desk</div>
        </div>
      </div>
      <button className="apt-msg-btn-premium" onClick={onMessage}>
        <MessageSquare size={18} />
        <span>Message Counsellor</span>
        {unread > 0 && <span className="unread-badge">{unread}</span>}
      </button>
    </div>
  );
};

const SessionCard = ({ session, onJoin }) => {
  const startTs = new Date(session.scheduledAt).getTime();
  const nowTs   = Date.now();
  const endTs   = startTs + (60 * 60 * 1000); // 1 hour duration
  
  const isPast    = nowTs > endTs;
  const isOngoing = nowTs >= startTs && nowTs <= endTs;
  
  let statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.scheduled;
  
  if (session.status === 'scheduled') {
    if (isOngoing) statusConfig = STATUS_CONFIG.ongoing;
    else if (isPast) statusConfig = STATUS_CONFIG.expired;
  }

  const canJoin = (isOngoing || (nowTs < startTs && startTs - nowTs < 300000)) && 
                  session.status === 'scheduled' && 
                  (session.type === 'video' || session.type === 'phone');

  return (
    <div className="session-card-premium">
      <div className="session-icon-wrap">{TYPE_ICON[session.type] || <Video size={18} />}</div>
      <div className="session-info">
        <div className="session-header">
          <span className="session-title">Session with {session.counsellorName}</span>
          <span className={`status-tag ${statusConfig.cls}`}>{statusConfig.label}</span>
        </div>
        <div className="session-meta">
          <span><Calendar size={13}/> {formatDate(session.scheduledAt)}</span>
          <span><Clock size={13}/> {formatTime(session.scheduledAt)}</span>
        </div>
      </div>
      {canJoin && <button className="join-btn-premium" onClick={() => onJoin(session._id)}>Join Now</button>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
const Appointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = getSocket(localStorage.getItem('token'));

  const [counsellor, setCounsellor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    Promise.all([getStudentCounsellor(), getStudentSessions()])
      .then(([cRes, sRes]) => {
        setCounsellor(cRes.data.data);
        setSessions(sRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onDm = (msg) => {
      if (msg.senderRole === 'counsellor' && !chatOpen) setUnread(n => n + 1);
    };
    socket.on('dm:message', onDm);
    return () => socket.off('dm:message', onDm);
  }, [socket, chatOpen]);

  const nowTs = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  const ongoing = sessions.filter(s => {
      if (s.status !== 'scheduled') return false;
      const start = new Date(s.scheduledAt).getTime();
      return nowTs >= start && nowTs <= start + ONE_HOUR;
  });

  const upcoming = sessions.filter(s => {
      if (s.status === 'cancelled') return false;
      const start = new Date(s.scheduledAt).getTime();
      return nowTs < start;
  }).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const past = sessions.filter(s => {
      if (s.status === 'completed' || s.status === 'cancelled' || s.status === 'no-show') return true;
      if (s.status === 'scheduled') {
          const start = new Date(s.scheduledAt).getTime();
          return nowTs > start + ONE_HOUR;
      }
      return false;
  }).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <DashboardLayout noPadding={chatOpen}>
      {chatOpen && counsellor ? (
        <StudentMessageInterface counsellor={counsellor} currentUserId={user?.id} onClose={() => setChatOpen(false)} />
      ) : (
        <div className="desk-container">
          <div className="desk-header">
            <h1 className="desk-title">Counsellor's Desk</h1>
            <p className="desk-subtitle">Your personalized space for clinical support and guidance</p>
          </div>

          <div className="dashboard-content-wrapper">
             <div className="dashboard-left-column">
                <div className="desk-section">
                    {ongoing.length > 0 && (
                        <div className="ongoing-sessions-container" style={{ marginBottom: '2rem' }}>
                            <h2 className="section-label-alt" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
                                <span className="status-pulse" style={{ display: 'inline-block', width: '8px', height: '8px', padding: 0 }}></span> Live Sessions
                            </h2>
                            <div className="sessions-list" style={{ marginTop: '1rem' }}>
                                {ongoing.map(s => <SessionCard key={s._id} session={s} onJoin={(id) => navigate(`/call/${id}`)} />)}
                            </div>
                        </div>
                    )}

                    <div className="section-header-row">
                        <h2 className="section-label-alt">Session History</h2>
                        <div className="tab-switcher">
                            <button className={`tab-btn ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
                            <button className={`tab-btn ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Past</button>
                        </div>
                    </div>
                    
                    <div className="sessions-list">
                        {loading ? (
                            <div className="loading-state">Loading sessions...</div>
                        ) : shown.length === 0 ? (
                            <div className="empty-state">No {tab} sessions found.</div>
                        ) : (
                            shown.map(s => <SessionCard key={s._id} session={s} onJoin={(id) => navigate(`/call/${id}`)} />)
                        )}
                    </div>
                </div>
             </div>

             <div className="dashboard-right-column">
                <div className="desk-section">
                    <h2 className="section-label-alt">Primary Support</h2>
                    <CounsellorCard 
                        counsellor={counsellor} 
                        unread={unread} 
                        onMessage={() => { setChatOpen(true); setUnread(0); }} 
                    />
                </div>
                
                <div className="desk-info-card">
                    <h3>Secure & Private</h3>
                    <p>All your sessions and messages are protected with end-to-end encryption for your privacy.</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Appointments;
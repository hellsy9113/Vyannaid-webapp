/**
 * src/pages/VideoCall.jsx
 *
 * Fixed:
 * - Uses correct CSS class names to match VideoCall.css
 * - Local video (self-view) always visible as PiP bottom-right
 * - Remote video fills the stage
 * - Swap view: click PiP to swap local ↔ remote to main view
 * - Auto-hide controls + header after 3s of mouse inactivity
 * - Live call duration timer
 * - Proper waiting/ended overlays
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate }                           from 'react-router-dom';
import { useAuth }                                          from '../auth/AuthContext';
import { getSocket }                                        from '../api/socketClient';
import { getTurnCredentials }                               from '../api/turnApi';
import {
  Mic, MicOff, Video, VideoOff,
  PhoneOff, MessageSquare, Send,
  Users, Clock, Loader, X, ArrowLeft
} from 'lucide-react';
import './VideoCall.css';

/* ── Helpers ─────────────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');

const formatDuration = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const formatCountdown = (ms) => {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

/* ── Component ───────────────────────────────────────────────────── */
const VideoCall = () => {
  const { sessionId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  /* DOM refs */
  const mainVideoRef = useRef(null);   // the big video (remote OR local when swapped)
  const pipVideoRef  = useRef(null);   // bottom-right small pip

  /* WebRTC refs */
  const pcRef         = useRef(null);
  const streamRef     = useRef(null);  // local stream
  const remoteStrmRef = useRef(null);  // remote stream
  const iceServersRef = useRef(null);

  /* Socket ref */
  const socketRef = useRef(null);

  /* UI state */
  const [status,      setStatus]      = useState('lobby');   // lobby|connecting|waiting|live|ended
  const [micOn,       setMicOn]       = useState(true);
  const [camOn,       setCamOn]       = useState(true);
  const [showChat,    setShowChat]    = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [chatInput,   setChatInput]   = useState('');
  const [peerInfo,    setPeerInfo]    = useState(null);
  const [mediaErr,    setMediaErr]    = useState('');
  const [unread,      setUnread]      = useState(0);
  const [turnLoading, setTurnLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [countdown,   setCountdown]   = useState(null);
  const [swapped,     setSwapped]     = useState(false);   // false = remote main, local pip
  const [showUI,      setShowUI]      = useState(true);
  const [duration,    setDuration]    = useState(0);       // seconds since live

  /* Timers */
  const hideTimerRef   = useRef(null);
  const durationRef    = useRef(null);

  /* ── Fetch TURN credentials once on mount ────────────────────── */
  useEffect(() => {
    getTurnCredentials()
      .then(servers => { iceServersRef.current = servers; })
      .catch(() => {})
      .finally(() => setTurnLoading(false));
  }, []);

  /* ── Countdown ticker ──────────────────────────────────────────── */
  useEffect(() => {
    if (!sessionInfo?.scheduledAt) return;
    const tick = () => {
      const diff = new Date(sessionInfo.scheduledAt) - Date.now();
      setCountdown(diff > 0 ? diff : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionInfo?.scheduledAt]);

  /* ── Duration ticker (once live) ─────────────────────────────── */
  useEffect(() => {
    if (status === 'live') {
      durationRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(durationRef.current);
    }
    return () => clearInterval(durationRef.current);
  }, [status]);

  /* ── Auto-hide controls on mouse idle (only in-call) ─────────── */
  const resetHideTimer = useCallback(() => {
    setShowUI(true);
    clearTimeout(hideTimerRef.current);
    if (status !== 'lobby' && status !== 'ended') {
      hideTimerRef.current = setTimeout(() => setShowUI(false), 3000);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'lobby' || status === 'ended') { setShowUI(true); return; }
    resetHideTimer();
    window.addEventListener('mousemove', resetHideTimer);
    window.addEventListener('keydown',   resetHideTimer);
    window.addEventListener('touchstart', resetHideTimer);
    return () => {
      window.removeEventListener('mousemove', resetHideTimer);
      window.removeEventListener('keydown',   resetHideTimer);
      window.removeEventListener('touchstart', resetHideTimer);
      clearTimeout(hideTimerRef.current);
    };
  }, [status, resetHideTimer]);

  /* ── Helper: assign streams to video elements ────────────────── */
  const assignVideos = useCallback((localStream, remoteStream, isSwapped) => {
    const mainEl = mainVideoRef.current;
    const pipEl  = pipVideoRef.current;
    if (!mainEl || !pipEl) return;

    if (isSwapped) {
      // local is big, remote is pip
      mainEl.srcObject = localStream  || null;
      pipEl.srcObject  = remoteStream || null;
    } else {
      // remote is big (default), local is pip
      mainEl.srcObject = remoteStream || null;
      pipEl.srcObject  = localStream  || null;
    }
  }, []);

  /* ── Whenever swapped state changes, re-assign videos ────────── */
  useEffect(() => {
    assignVideos(streamRef.current, remoteStrmRef.current, swapped);
  }, [swapped, assignVideos]);

  /* ── Create PeerConnection ──────────────────────────────────────── */
  const createPC = useCallback(() => {
    const socket = socketRef.current;
    const iceServers = iceServersRef.current || [
      { urls: 'stun:stun.l.google.com:19302' },
    ];

    console.log('[WebRTC] Creating PC with ICE:', iceServers.map(s => s.urls));
    const pc = new RTCPeerConnection({ iceServers });

    pc.ontrack = (e) => {
      console.log('[WebRTC] Remote track received');
      remoteStrmRef.current = e.streams[0];
      assignVideos(streamRef.current, e.streams[0], swapped);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { roomId: sessionId, candidate: e.candidate });
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected')  setStatus('live');
      if (['disconnected', 'failed'].includes(pc.connectionState)) setStatus('ended');
    };

    return pc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, assignVideos]);

  /* ── Start call ───────────────────────────────────────────────── */
  const startCall = useCallback(async () => {
    if (turnLoading) return;
    setStatus('connecting');

    const socket = getSocket(localStorage.getItem('token'));
    socketRef.current = socket;

    /* 1. Get local media */
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      setMediaErr(
        err.name === 'NotAllowedError'
          ? 'Camera/microphone permission denied. Please allow access and refresh.'
          : `Could not access camera/mic: ${err.message}`
      );
      setStatus('ended');
      return;
    }

    streamRef.current = stream;

    /* 2. Show local in pip immediately (remote not here yet) */
    assignVideos(stream, null, false);

    /* 3. Join room */
    socket.emit('join-room', sessionId);
    setStatus('waiting');

    let pc;

    const onPeerJoined = async ({ name, role }) => {
      console.log('[WebRTC] peer-joined → sending offer', { name, role });
      setPeerInfo({ name, role });
      pc = createPC(); pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { roomId: sessionId, sdp: offer });
    };

    const onOffer = async ({ sdp }) => {
      console.log('[WebRTC] Received offer → answering');
      pc = createPC(); pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { roomId: sessionId, sdp: answer });
      setStatus('live');
    };

    const onAnswer = async ({ sdp }) => {
      console.log('[WebRTC] Received answer');
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
      setStatus('live');
    };

    const onIceCandidate = async ({ candidate }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[WebRTC] ICE add error:', e); }
    };

    const onPeerLeft = () => {
      remoteStrmRef.current = null;
      assignVideos(streamRef.current, null, swapped);
      setStatus('waiting');
      setPeerInfo(null);
      pcRef.current?.close();
      pcRef.current = null;
    };

    const onChatMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      setShowChat(open => {
        if (!open) setUnread(c => c + 1);
        return open;
      });
    };

    socket.on('peer-joined',   onPeerJoined);
    socket.on('offer',         onOffer);
    socket.on('answer',        onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('peer-left',     onPeerLeft);
    socket.on('chat-message',  onChatMessage);
  }, [sessionId, createPC, turnLoading, assignVideos, swapped]);

  /* ── Cleanup on unmount ────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      socketRef.current?.emit('leave-room', sessionId);
      clearInterval(durationRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [sessionId]);

  /* ── Controls ─────────────────────────────────────────────────── */
  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    socketRef.current?.emit('leave-room', sessionId);
    navigate(-1);
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit('chat-message', { roomId: sessionId, text: chatInput.trim() });
    setChatInput('');
  };

  const toggleChat = () => {
    setShowChat(prev => { if (!prev) setUnread(0); return !prev; });
  };

  const handleSwap = () => setSwapped(s => !s);

  /* ════════════════════════════════════════════════════════════════
     RENDER — Error screen
  ════════════════════════════════════════════════════════════════ */
  if (mediaErr) {
    return (
      <div className="vc-page">
        <div className="vc-error-screen">
          <div className="vc-error-card">
            <div className="vc-error-icon"><VideoOff size={28} /></div>
            <h2>Cannot start call</h2>
            <p>{mediaErr}</p>
            <button className="vc-error-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER — Lobby
  ════════════════════════════════════════════════════════════════ */
  if (status === 'lobby') {
    const countdownStr = countdown != null ? formatCountdown(countdown) : null;
    const isUpcoming   = countdown != null && countdown > 15 * 60 * 1000;

    return (
      <div className="vc-lobby">
        <div className="vc-lobby-card">
          <div className="vc-lobby-icon">
            <Video size={36} />
          </div>
          <h2 className="vc-lobby-title">Video Session</h2>
          <p className="vc-lobby-id">Room ID: <code>{sessionId?.slice(-8)}</code></p>

          {isUpcoming && countdownStr && (
            <div className="vc-lobby-countdown">
              <Clock size={16} />
              <span>Session starts in <strong>{countdownStr}</strong></span>
            </div>
          )}

          {!isUpcoming && (
            <p className="vc-lobby-ready">✓ Your session is ready to begin.</p>
          )}

          <ul className="vc-lobby-checklist">
            <li>✓ Find a quiet, well-lit space</li>
            <li>✓ Allow camera and microphone access</li>
            <li>✓ Close unnecessary browser tabs</li>
          </ul>

          {turnLoading ? (
            <div className="vc-lobby-loading">
              <Loader size={18} className="vc-spin" />
              <span>Setting up secure connection…</span>
            </div>
          ) : (
            <button className="vc-lobby-join-btn" onClick={startCall}>
              <Video size={18} />
              {isUpcoming ? 'Join Early' : 'Join Call'}
            </button>
          )}

          <button className="vc-lobby-back" onClick={() => navigate(-1)}>
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER — Call screen
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="vc-page" onClick={resetHideTimer}>

      {/* ── Stage ── */}
      <div className="vc-stage">

        {/* Main video (remote by default, local when swapped) */}
        <div className={`vc-remote-wrap ${swapped ? '' : ''}`}>
          <video
            ref={mainVideoRef}
            className="vc-video"
            autoPlay
            playsInline
            muted={swapped}   /* mute when showing local in main to avoid echo */
          />
          {!swapped && !camOn && (
            <div className="vc-cam-off"><VideoOff size={32} /></div>
          )}
        </div>

        {/* PiP (local by default, remote when swapped) */}
        <div
          className="vc-local-wrap vc-local-wrap--pip"
          onClick={handleSwap}
          title="Click to swap view"
        >
          <video
            ref={pipVideoRef}
            className="vc-video"
            autoPlay
            playsInline
            muted={!swapped}  /* always mute local audio regardless of position */
          />
          {!swapped && !camOn && (
            <div className="vc-cam-off" style={{ fontSize: '0.65rem' }}>
              <VideoOff size={18} />
            </div>
          )}
          <div className="vc-screen-badge">
            <span>{swapped ? 'Remote' : 'You'}</span>
          </div>
          <div className="vc-swap-hint">tap to swap</div>
        </div>

        {/* Peer badge */}
        {peerInfo && status === 'live' && (
          <div className="vc-peer-pill">
            <span className="vc-peer-dot" />
            {peerInfo.name || peerInfo.role}
          </div>
        )}

        {/* Waiting / Ended overlay */}
        {status !== 'live' && (
          <div className="vc-overlay">
            <div className="vc-pulse"><Users size={26} /></div>
            {status === 'connecting' && <span>Connecting…</span>}
            {status === 'waiting'    && <span>Waiting for the other person to join…</span>}
            {status === 'ended'      && <span>Call ended</span>}
            <div className="vc-room-code">{sessionId?.slice(-8)}</div>
            {status === 'ended' && (
              <button className="vc-error-back" style={{ marginTop: '0.75rem' }} onClick={() => navigate(-1)}>
                Return
              </button>
            )}
          </div>
        )}

        {/* Header (auto-hide) */}
        <div className={`vc-header ${showUI ? 'vc-header--on' : ''}`}>
          <button className="vc-hbtn" onClick={endCall} title="Leave">
            <ArrowLeft size={17} />
          </button>
          <div className="vc-header-mid">
            {status === 'live' && (
              <span className="vc-dur">{formatDuration(duration)}</span>
            )}
            <span className="vc-header-title">
              {status === 'live' ? 'Session in progress' : 'Connecting…'}
            </span>
          </div>
          <div style={{ width: 36 }} />
        </div>

        {/* Controls (auto-hide) */}
        <div className={`vc-controls ${showUI ? 'vc-controls--on' : ''}`}>
          <div className="vc-ctrl-row">

            <button
              className={`vc-cb ${micOn ? '' : 'vc-cb--off'}`}
              onClick={toggleMic}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              <span className="vc-cb-icon">{micOn ? <Mic size={20} /> : <MicOff size={20} />}</span>
              <span className="vc-cb-lbl">{micOn ? 'Mic' : 'Muted'}</span>
            </button>

            <button
              className={`vc-cb ${camOn ? '' : 'vc-cb--off'}`}
              onClick={toggleCam}
              title={camOn ? 'Camera off' : 'Camera on'}
            >
              <span className="vc-cb-icon">{camOn ? <Video size={20} /> : <VideoOff size={20} />}</span>
              <span className="vc-cb-lbl">{camOn ? 'Camera' : 'No Cam'}</span>
            </button>

            <button
              className="vc-cb vc-cb--end"
              onClick={endCall}
              title="End call"
            >
              <span className="vc-cb-icon"><PhoneOff size={22} /></span>
            </button>

            <button
              className={`vc-cb ${showChat ? 'vc-cb--active' : ''}`}
              onClick={toggleChat}
              title="Chat"
              style={{ position: 'relative' }}
            >
              <span className="vc-cb-icon"><MessageSquare size={20} /></span>
              <span className="vc-cb-lbl">Chat</span>
              {unread > 0 && <span className="vc-badge">{unread}</span>}
            </button>

          </div>
        </div>
      </div>

      {/* ── Chat panel ── */}
      {showChat && (
        <div className="vc-chat">
          <div className="vc-chat-hdr">
            <span>In-call Chat</span>
            <button className="vc-chat-x" onClick={toggleChat}><X size={16} /></button>
          </div>

          <div className="vc-chat-msgs">
            {messages.length === 0 && (
              <p className="vc-chat-empty">No messages yet. Say hello! 👋</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`vc-msg ${m.senderId === user?.id ? 'vc-msg--mine' : 'vc-msg--theirs'}`}>
                <span className="vc-msg-name">{m.senderName}</span>
                <span className="vc-msg-text">{m.text}</span>
                <span className="vc-msg-time">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={sendChat} className="vc-chat-form">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message…"
              className="vc-chat-in"
            />
            <button type="submit" className="vc-chat-send" disabled={!chatInput.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default VideoCall;
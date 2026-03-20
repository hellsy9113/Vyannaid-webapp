/**
 * src/pages/VideoCall.jsx
 * 
 * v3 - Robust Signaling & Fixes
 * - Fixed: Signaling state race conditions (Cannot set remote answer in state stable)
 * - Fixed: Duplicate socket listeners (Moved outside startCall to useEffect)
 * - Fixed: ICE candidate queuing (Robustly handles early candidates)
 * - Added: Status "LIVE" only when truly connected
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

const VideoCall = () => {
  const { sessionId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  /* DOM refs */
  const mainVideoRef = useRef(null);
  const pipVideoRef  = useRef(null);

  /* WebRTC refs */
  const pcRef          = useRef(null);
  const streamRef      = useRef(null);
  const remoteStrmRef  = useRef(null);
  const iceServersRef  = useRef(null);
  const candQueueRef   = useRef([]); // Candidates arrived before remote description

  /* Socket ref */
  const socketRef = useRef(null);

  /* UI state */
  const [status,      setStatus]      = useState('lobby');
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
  const [swapped,     setSwapped]     = useState(false);
  const [showUI,      setShowUI]      = useState(true);
  const [duration,    setDuration]    = useState(0);

  const hideTimerRef   = useRef(null);
  const durationRef    = useRef(null);

  /* ── 1. Init TURN & Timers ───────────────────────────────────── */
  useEffect(() => {
    getTurnCredentials()
      .then(servers => { 
        console.log('[WebRTC] ICE Servers loaded:', servers.map(s => s.urls));
        iceServersRef.current = servers; 
      })
      .finally(() => setTurnLoading(false));
  }, []);

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

  useEffect(() => {
    if (status === 'live') {
      durationRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(durationRef.current);
    }
    return () => clearInterval(durationRef.current);
  }, [status]);

  /* ── 2. View Management ────────────────────────────────────────── */
  const assignVideos = useCallback((localStream, remoteStream, isSwapped) => {
    const mainEl = mainVideoRef.current;
    const pipEl  = pipVideoRef.current;
    if (!mainEl || !pipEl) return;
    if (isSwapped) {
      mainEl.srcObject = localStream  || null;
      pipEl.srcObject  = remoteStream || null;
    } else {
      mainEl.srcObject = remoteStream || null;
      pipEl.srcObject  = localStream  || null;
    }
  }, []);

  useEffect(() => {
    assignVideos(streamRef.current, remoteStrmRef.current, swapped);
  }, [swapped, assignVideos]);

  /* ── 3. WebRTC Core ────────────────────────────────────────────── */
  const processQueuedCandidates = async (pc) => {
    while (candQueueRef.current.length > 0) {
      const cand = candQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
        console.log('[WebRTC] Processed queued candidate');
      } catch (e) {
        console.warn('[WebRTC] Queued ICE add error:', e);
      }
    }
  };

  const createPC = useCallback(() => {
    const socket = socketRef.current;
    const iceServers = iceServersRef.current || [{ urls: 'stun:stun.l.google.com:19302' }];

    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { roomId: sessionId, candidate: e.candidate });
    };

    pc.ontrack = (e) => {
      console.log('[WebRTC] Remote track received');
      remoteStrmRef.current = e.streams[0];
      assignVideos(streamRef.current, e.streams[0], swapped);
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE state: ${pc.iceConnectionState}`);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`[WebRTC] Connection state: ${state}`);
      if (state === 'connected') setStatus('live');
      if (state === 'failed')    setStatus('ended');
    };

    return pc;
  }, [sessionId, assignVideos, swapped]);

  /* ── 4. Signaling Listeners ────────────────────────────────────── */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onPeerJoined = async ({ name, role }) => {
      console.log('[WebRTC] Peer joined → sending offer');
      setPeerInfo({ name, role });
      const pc = createPC();
      pcRef.current = pc;
      
      const stream = streamRef.current;
      if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { roomId: sessionId, sdp: offer });
    };

    const onOffer = async ({ sdp }) => {
      console.log('[WebRTC] Received offer → answering');
      const pc = createPC();
      pcRef.current = pc;

      const stream = streamRef.current;
      if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await processQueuedCandidates(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId: sessionId, sdp: answer });
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
      }
    };

    const onAnswer = async ({ sdp }) => {
      console.log('[WebRTC] Received answer');
      const pc = pcRef.current;
      if (!pc) return;
      if (pc.signalingState !== 'have-local-offer') {
          return console.warn('[WebRTC] Ignoring answer: state is', pc.signalingState);
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await processQueuedCandidates(pc);
      } catch (err) {
        console.error('[WebRTC] Error handling answer:', err);
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      const pc = pcRef.current;
      if (!pc || !pc.remoteDescription) {
        console.log('[WebRTC] Queuing ICE candidate');
        candQueueRef.current.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('[WebRTC] ICE add error:', e);
      }
    };

    const onPeerLeft = () => {
      remoteStrmRef.current = null;
      assignVideos(streamRef.current, null, swapped);
      setStatus('waiting');
      setPeerInfo(null);
      pcRef.current?.close();
      pcRef.current = null;
    };

    const onChatMessage = (m) => {
      setMessages(prev => [...prev, m]);
      setShowChat(open => { if (!open) setUnread(u => u + 1); return open; });
    };

    socket.on('peer-joined',   onPeerJoined);
    socket.on('offer',         onOffer);
    socket.on('answer',        onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('peer-left',     onPeerLeft);
    socket.on('chat-message',  onChatMessage);

    return () => {
      socket.off('peer-joined',   onPeerJoined);
      socket.off('offer',         onOffer);
      socket.off('answer',        onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('peer-left',     onPeerLeft);
      socket.off('chat-message',  onChatMessage);
    };
  }, [sessionId, createPC, assignVideos, swapped]);

  /* ── 5. User Actions ───────────────────────────────────────────── */
  const startCall = async () => {
    if (turnLoading) return;
    setStatus('connecting');

    const socket = getSocket(localStorage.getItem('token'));
    socketRef.current = socket;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      assignVideos(stream, null, false);
      socket.emit('join-room', sessionId);
      setStatus('waiting');
    } catch (err) {
      setMediaErr(err.name === 'NotAllowedError' 
        ? 'Camera/microphone permission denied.' 
        : `Media error: ${err.message}`);
      setStatus('ended');
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    socketRef.current?.emit('leave-room', sessionId);
    navigate(-1);
  };

  const toggleMic = () => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setMicOn(t.enabled); }
  };
  const toggleCam = () => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setCamOn(t.enabled); }
  };
  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit('chat-message', { roomId: sessionId, text: chatInput.trim() });
    setChatInput('');
  };
  const toggleChat = () => setShowChat(p => { if (!p) setUnread(0); return !p; });

  /* ── 6. UI Helpers ────────────────────────────────────────────── */
  const resetHideTimer = useCallback(() => {
    setShowUI(true);
    clearTimeout(hideTimerRef.current);
    if (status !== 'lobby' && status !== 'ended') {
      hideTimerRef.current = setTimeout(() => setShowUI(false), 3000);
    }
  }, [status]);

  useEffect(() => {
    resetHideTimer();
    const evts = ['mousemove', 'keydown', 'touchstart'];
    evts.forEach(e => window.addEventListener(e, resetHideTimer));
    return () => {
      evts.forEach(e => window.removeEventListener(e, resetHideTimer));
      clearTimeout(hideTimerRef.current);
    };
  }, [status, resetHideTimer]);

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  if (mediaErr) {
    return (
      <div className="vc-page">
        <div className="vc-error-screen">
          <div className="vc-error-card">
            <div className="vc-error-icon"><VideoOff size={28} /></div>
            <h2>Cannot start call</h2>
            <p>{mediaErr}</p>
            <button className="vc-error-back" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Go back</button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'lobby') {
    const countdownStr = formatCountdown(countdown);
    return (
      <div className="vc-lobby">
        <div className="vc-lobby-card">
          <div className="vc-lobby-icon"><Video size={36} /></div>
          <h2 className="vc-lobby-title">Video Session</h2>
          <p className="vc-lobby-id">Room ID: <code>{sessionId?.slice(-8)}</code></p>
          {countdown > 15*60*1000 && countdownStr && (
            <div className="vc-lobby-countdown"><Clock size={16} /><span>Starts in <strong>{countdownStr}</strong></span></div>
          )}
          <ul className="vc-lobby-checklist">
            <li>✓ Find a quiet, well-lit space</li>
            <li>✓ Allow camera and microphone access</li>
          </ul>
          {turnLoading ? (
            <div className="vc-lobby-loading"><Loader size={18} className="vc-spin" /><span>Setting up secure connection…</span></div>
          ) : (
            <button className="vc-lobby-join-btn" onClick={startCall}><Video size={18} /> Join Call</button>
          )}
          <button className="vc-lobby-back" onClick={() => navigate(-1)}>← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vc-page" onClick={resetHideTimer}>
      <div className="vc-stage">
        <div className="vc-remote-wrap">
          <video ref={mainVideoRef} className="vc-video" autoPlay playsInline muted={swapped} />
          {!swapped && !camOn && <div className="vc-cam-off"><VideoOff size={32} /></div>}
        </div>
        <div className="vc-local-wrap vc-local-wrap--pip" onClick={() => setSwapped(!swapped)}>
          <video ref={pipVideoRef} className="vc-video" autoPlay playsInline muted={!swapped} />
          {swapped && !camOn && <div className="vc-cam-off" style={{fontSize:'0.65rem'}}><VideoOff size={18} /></div>}
          <div className="vc-screen-badge"><span>{swapped ? 'Remote' : 'You'}</span></div>
          <div className="vc-swap-hint">tap to swap</div>
        </div>
        {peerInfo && status === 'live' && (
          <div className="vc-peer-pill"><span className="vc-peer-dot" />{peerInfo.name || peerInfo.role}</div>
        )}
        {status !== 'live' && (
          <div className="vc-overlay">
            <div className="vc-pulse"><Users size={26} /></div>
            <span>{status === 'connecting' ? 'Connecting…' : status === 'waiting' ? 'Waiting for peer…' : 'Call ended'}</span>
            <div className="vc-room-code">{sessionId?.slice(-8)}</div>
            {status === 'ended' && <button className="vc-error-back" style={{marginTop:'0.75rem'}} onClick={() => navigate(-1)}>Return</button>}
          </div>
        )}
        <div className={`vc-header ${showUI ? 'vc-header--on' : ''}`}>
          <button className="vc-hbtn" onClick={endCall}><ArrowLeft size={17} /></button>
          <div className="vc-header-mid">
            {status === 'live' && <span className="vc-dur">{formatDuration(duration)}</span>}
            <span className="vc-header-title">{status === 'live' ? 'Session Live' : 'Connecting…'}</span>
          </div>
          <div style={{width:36}} />
        </div>
        <div className={`vc-controls ${showUI ? 'vc-controls--on' : ''}`}>
          <div className="vc-ctrl-row">
            <button className={`vc-cb ${micOn ? '' : 'vc-cb--off'}`} onClick={toggleMic}>
              <span className="vc-cb-icon">{micOn ? <Mic size={20} /> : <MicOff size={20} />}</span>
              <span className="vc-cb-lbl">{micOn ? 'Mic' : 'Muted'}</span>
            </button>
            <button className={`vc-cb ${camOn ? '' : 'vc-cb--off'}`} onClick={toggleCam}>
              <span className="vc-cb-icon">{camOn ? <Video size={20} /> : <VideoOff size={20} />}</span>
              <span className="vc-cb-lbl">{camOn ? 'Cam' : 'No Cam'}</span>
            </button>
            <button className="vc-cb vc-cb--end" onClick={endCall}><PhoneOff size={22} /></button>
            <button className={`vc-cb ${showChat ? 'vc-cb--active' : ''}`} onClick={toggleChat}>
              <span className="vc-cb-icon"><MessageSquare size={20} /></span>
              <span className="vc-cb-lbl">Chat</span>
              {unread > 0 && <span className="vc-badge">{unread}</span>}
            </button>
          </div>
        </div>
      </div>
      {showChat && (
        <div className="vc-chat">
          <div className="vc-chat-hdr"><span>In-call Chat</span><button className="vc-chat-x" onClick={toggleChat}><X size={16} /></button></div>
          <div className="vc-chat-msgs">
            {messages.length === 0 && <p className="vc-chat-empty">No messages yet 👋</p>}
            {messages.map((m, i) => (
              <div key={i} className={`vc-msg ${m.senderId === user?.id ? 'vc-msg--mine' : 'vc-msg--theirs'}`}>
                <span className="vc-msg-name">{m.senderName}</span>
                <span className="vc-msg-text">{m.text}</span>
                <span className="vc-msg-time">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="vc-chat-form">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message…" className="vc-chat-in" />
            <button type="submit" className="vc-chat-send" disabled={!chatInput.trim()}><Send size={15} /></button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
/**
 * src/pages/VideoCall.jsx  ── UPDATED with Cloudflare TURN
 *
 * Changes from original:
 * 1. Fetches TURN credentials from /api/turn/credentials before creating
 *    RTCPeerConnection — uses Cloudflare TURN servers for NAT traversal.
 * 2. Shows a pre-call lobby with session info and "Ready to Join" CTA.
 * 3. Displays a countdown timer when the session hasn't started yet.
 * 4. All existing WebRTC signalling, chat panel, and controls preserved.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate }                           from 'react-router-dom';
import { useAuth }                                          from '../auth/AuthContext';
import { getSocket }                                        from '../api/socketClient';
import { getTurnCredentials }                               from '../api/turnApi';
import {
  Mic, MicOff, Video, VideoOff,
  PhoneOff, MessageSquare, Users,
  Clock, Loader
} from 'lucide-react';
import './VideoCall.css';

// ── Countdown helper ──────────────────────────────────────────────
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

  // DOM refs
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  // WebRTC refs
  const pcRef        = useRef(null);
  const streamRef    = useRef(null);
  const iceServersRef = useRef(null); // cached TURN credentials

  // Socket ref
  const socketRef = useRef(null);

  // UI state
  const [status,      setStatus]      = useState('lobby');   // lobby | connecting | waiting | live | ended
  const [micOn,       setMicOn]       = useState(true);
  const [camOn,       setCamOn]       = useState(true);
  const [showChat,    setShowChat]    = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [chatInput,   setChatInput]   = useState('');
  const [peerInfo,    setPeerInfo]    = useState(null);
  const [mediaErr,    setMediaErr]    = useState('');
  const [unread,      setUnread]      = useState(0);
  const [turnLoading, setTurnLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);  // from socket join
  const [countdown,   setCountdown]   = useState(null);  // ms until session

  // ── Fetch TURN credentials once on mount ────────────────────────
  useEffect(() => {
    getTurnCredentials().then(servers => {
      iceServersRef.current = servers;
      setTurnLoading(false);
    });
  }, []);

  // ── Countdown ticker ────────────────────────────────────────────
  useEffect(() => {
    if (!sessionInfo?.scheduledAt) return;
    const tick = () => {
      const diff = new Date(sessionInfo.scheduledAt) - Date.now();
      setCountdown(diff > 0 ? diff : 0);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionInfo?.scheduledAt]);

  // ── PC factory ───────────────────────────────────────────────────
  const createPC = useCallback(() => {
    const socket = socketRef.current;
    const iceServers = iceServersRef.current || [
      { urls: 'stun:stun.l.google.com:19302' },
    ];

    console.log('[WebRTC] Creating PC with ICE servers:', iceServers.map(s => s.urls));

    const pc = new RTCPeerConnection({ iceServers });

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { roomId: sessionId, candidate: e.candidate });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected')  setStatus('live');
      if (['disconnected', 'failed'].includes(pc.connectionState)) setStatus('ended');
    };

    return pc;
  }, [sessionId]);

  // ── Start call (after user clicks "Join Call" in lobby) ─────────
  const startCall = useCallback(async () => {
    if (turnLoading) return;
    const socket = getSocket(localStorage.getItem('token'));
    socketRef.current = socket;

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
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    socket.emit('join-room', sessionId);
    setStatus('waiting');

    let pc;

    const onPeerJoined = async ({ name, role }) => {
      console.log('[WebRTC] peer-joined → creating offer as initiator', { name, role });
      setPeerInfo({ name, role });
      pc = createPC(); pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('[WebRTC] Sending offer to room', sessionId);
      socket.emit('offer', { roomId: sessionId, sdp: offer });
    };

    const onOffer = async ({ sdp }) => {
      console.log('[WebRTC] Received offer → creating answer');
      pc = createPC(); pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('[WebRTC] Sending answer to room', sessionId);
      socket.emit('answer', { roomId: sessionId, sdp: answer });
      setStatus('live');
    };

    const onAnswer = async ({ sdp }) => {
      console.log('[WebRTC] Received answer → setting remote description');
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
      setStatus('live');
    };

    const onIceCandidate = async ({ candidate }) => {
      console.log('[WebRTC] Received ICE candidate:', candidate?.type, candidate?.address);
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[WebRTC] ICE add error:', e); }
    };

    const onPeerLeft = () => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
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

    return () => {
      socket.off('peer-joined',   onPeerJoined);
      socket.off('offer',         onOffer);
      socket.off('answer',        onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('peer-left',     onPeerLeft);
      socket.off('chat-message',  onChatMessage);
    };
  }, [sessionId, createPC, turnLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      socketRef.current?.emit('leave-room', sessionId);
    };
  }, [sessionId]);

  // ── Controls ──────────────────────────────────────────────────────
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

  // ── Error screen ─────────────────────────────────────────────────
  if (mediaErr) {
    return (
      <div className="vc-error-screen">
        <div className="vc-error-card">
          <VideoOff size={40} />
          <h2>Cannot start call</h2>
          <p>{mediaErr}</p>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  // ── Lobby screen ─────────────────────────────────────────────────
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
          <p className="vc-lobby-id">Room ID: <code>{sessionId}</code></p>

          {isUpcoming && countdownStr && (
            <div className="vc-lobby-countdown">
              <Clock size={16} />
              <span>Session starts in <strong>{countdownStr}</strong></span>
            </div>
          )}

          {!isUpcoming && (
            <p className="vc-lobby-ready">Your session is ready to begin.</p>
          )}

          <ul className="vc-lobby-checklist">
            <li>✓ Find a quiet, well-lit space</li>
            <li>✓ Test your camera and microphone</li>
            <li>✓ Close unnecessary browser tabs</li>
          </ul>

          {turnLoading ? (
            <div className="vc-lobby-loading">
              <Loader size={18} className="vc-spin" />
              <span>Connecting to servers…</span>
            </div>
          ) : (
            <button
              className="vc-lobby-join-btn"
              onClick={startCall}
            >
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

  // ── Call screen ───────────────────────────────────────────────────
  return (
    <div className="vc-page">
      <div className={`vc-videos ${showChat ? 'vc-videos-shifted' : ''}`}>
        <video ref={remoteVideoRef} className="vc-remote" autoPlay playsInline />

        {status !== 'live' && (
          <div className="vc-overlay">
            <div className="vc-overlay-card">
              <Users size={36} />
              {status === 'connecting' && <p>Connecting…</p>}
              {status === 'waiting'    && <p>Waiting for the other person to join…</p>}
              {status === 'ended'      && <p>Call ended.</p>}
            </div>
          </div>
        )}

        <video ref={localVideoRef} className="vc-local" autoPlay playsInline muted />

        {peerInfo && (
          <div className="vc-peer-badge">{peerInfo.name || peerInfo.role}</div>
        )}
      </div>

      <div className="vc-controls">
        <button className={`vc-btn ${micOn ? '' : 'off'}`} onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          <span className="vc-btn-label">{micOn ? 'Mic' : 'Muted'}</span>
        </button>

        <button className={`vc-btn ${camOn ? '' : 'off'}`} onClick={toggleCam} title={camOn ? 'Camera off' : 'Camera on'}>
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
          <span className="vc-btn-label">{camOn ? 'Camera' : 'No Cam'}</span>
        </button>

        <button className="vc-btn vc-end" onClick={endCall} title="End call">
          <PhoneOff size={20} />
          <span className="vc-btn-label">End</span>
        </button>

        <button className={`vc-btn ${showChat ? 'active' : ''}`} onClick={toggleChat} title="Toggle chat">
          <MessageSquare size={20} />
          {unread > 0 && <span className="vc-badge">{unread}</span>}
          <span className="vc-btn-label">Chat</span>
        </button>
      </div>

      {showChat && (
        <div className="vc-chat">
          <div className="vc-chat-header"><span>In-call chat</span></div>

          <div className="vc-chat-messages">
            {messages.length === 0 && (
              <p className="vc-chat-empty">No messages yet. Say hello!</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`vc-msg ${m.senderId === user?.id ? 'mine' : 'theirs'}`}>
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
              className="vc-chat-input"
            />
            <button type="submit" className="vc-chat-send">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
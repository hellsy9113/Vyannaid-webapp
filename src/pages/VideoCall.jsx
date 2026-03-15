/**
 * src/pages/VideoCall.jsx  ── BUG-FIXED
 *
 * Bugs fixed:
 *  1. socket obtained inside useEffect (not at render level) — prevents stale
 *     socket reference on hot-module reload and React Strict Mode double-invoke
 *  2. socket.off() now receives named handler references — previously the anonymous
 *     lambdas passed to socket.on() could never be removed, causing duplicate listeners
 *     that would fire twice for every incoming event after the first render cycle
 *  3. createPC moved to a ref-based factory so it captures the correct socketRef
 *     without needing to be in useEffect's dependency array
 *  4. unread badge counter now resets correctly when the chat panel is opened
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate }                           from 'react-router-dom';
import { useAuth }                                          from '../auth/AuthContext';
import { getSocket }                                        from '../api/socketClient';
import {
  Mic, MicOff, Video, VideoOff,
  PhoneOff, MessageSquare, Users
} from 'lucide-react';
import './VideoCall.css';

// ── ICE / TURN configuration ─────────────────────────────────────
const getIceConfig = () => ({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    ...(import.meta.env.VITE_TURN_URL ? [{
      urls:       import.meta.env.VITE_TURN_URL,
      username:   import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    }] : []),
  ],
});

const VideoCall = () => {
  const { sessionId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  // DOM refs
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  // WebRTC refs
  const pcRef     = useRef(null);
  const streamRef = useRef(null);

  // FIX 1: socket stored in ref, obtained once inside useEffect
  const socketRef = useRef(null);

  // UI state
  const [status,    setStatus]    = useState('connecting');
  const [micOn,     setMicOn]     = useState(true);
  const [camOn,     setCamOn]     = useState(true);
  const [showChat,  setShowChat]  = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [peerInfo,  setPeerInfo]  = useState(null);
  const [mediaErr,  setMediaErr]  = useState('');
  // FIX 4: separate unread counter, reset on open
  const [unread,    setUnread]    = useState(0);

  // FIX 3: PC factory using socketRef so it's stable across renders
  const createPC = useCallback(() => {
    const socket = socketRef.current;
    const pc = new RTCPeerConnection(getIceConfig());

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { roomId: sessionId, candidate: e.candidate });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus('live');
      if (['disconnected', 'failed'].includes(pc.connectionState)) setStatus('ended');
    };

    return pc;
  }, [sessionId]);

  // ── Main effect ───────────────────────────────────────────────
  useEffect(() => {
    // FIX 1: get socket ONCE here, not at component render time
    const socket = getSocket(localStorage.getItem('token'));
    socketRef.current = socket;

    let pc;

    const start = async () => {
      // Request camera + mic
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

      // FIX 2: NAMED handler functions — socket.off() actually works now
      const onPeerJoined = async ({ name, role }) => {
        setPeerInfo({ name, role });
        pc = createPC(); pcRef.current = pc;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId: sessionId, sdp: offer });
      };

      const onOffer = async ({ sdp }) => {
        pc = createPC(); pcRef.current = pc;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId: sessionId, sdp: answer });
        setStatus('live');
      };

      const onAnswer = async ({ sdp }) => {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
        setStatus('live');
      };

      const onIceCandidate = async ({ candidate }) => {
        try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (e) { console.warn('[WebRTC] ICE error:', e); }
      };

      const onPeerLeft = () => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        setStatus('waiting'); setPeerInfo(null);
        pcRef.current?.close(); pcRef.current = null;
      };

      const onChatMessage = (msg) => {
        setMessages(prev => [...prev, msg]);
        // FIX 4: only increment unread when chat panel is closed
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

      // Return named-handler cleanup
      return () => {
        socket.off('peer-joined',   onPeerJoined);
        socket.off('offer',         onOffer);
        socket.off('answer',        onAnswer);
        socket.off('ice-candidate', onIceCandidate);
        socket.off('peer-left',     onPeerLeft);
        socket.off('chat-message',  onChatMessage);
      };
    };

    let cleanup;
    start().then(fn => { cleanup = fn; }).catch(console.error);

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      socket.emit('leave-room', sessionId);
      cleanup?.();
    };
  }, [sessionId, createPC]);

  // ── Controls ──────────────────────────────────────────────────
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

  // FIX 4: reset unread when opening chat
  const toggleChat = () => {
    setShowChat(prev => {
      if (!prev) setUnread(0);
      return !prev;
    });
  };

  // ── Render ────────────────────────────────────────────────────
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

  return (
    <div className="vc-page">

      {/* ── Video area ── */}
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

      {/* ── Controls bar ── */}
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

      {/* ── In-call chat panel ── */}
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
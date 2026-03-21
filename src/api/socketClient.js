/**
 * src/api/socketClient.js
 * Singleton Socket.io client — updated with call helper methods.
 */

import { io } from 'socket.io-client';

let socket = null;

export function getSocket(token) {
  if (!socket || socket.disconnected) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth:       { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] connection error:', err.message);
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

// ── Call helpers ──────────────────────────────────────────────────

/**
 * Counsellor calls: notify the student, then navigate to /call/:sessionId
 */
export function initiateCall(socket, sessionId, calleeUserId) {
  socket.emit('call:initiate', { sessionId, calleeUserId });
}

/**
 * Student accepts incoming call
 */
export function acceptCall(socket, sessionId, callerId) {
  socket.emit('call:accept', { sessionId, callerId });
}

/**
 * Student rejects incoming call
 */
export function rejectCall(socket, sessionId, callerId) {
  socket.emit('call:reject', { sessionId, callerId });
}

/**
 * Cancel a pending outgoing call (before answer)
 */
export function cancelCall(socket, sessionId, calleeUserId) {
  socket.emit('call:cancel', { sessionId, calleeUserId });
}

/**
 * Notify peer that call ended (in-call)
 */
export function notifyCallEnd(socket, sessionId, otherUserId) {
  socket.emit('call:end-notify', { sessionId, otherUserId });
}
// src/api/turnApi.js
// Fetches short-lived Cloudflare TURN credentials from our backend.
// Called once per VideoCall component mount.

import { api } from './authApi';

/**
 * Returns an array of RTCIceServer objects ready for use in RTCPeerConnection.
 * Falls back to Google STUN only if the request fails.
 */
export const getTurnCredentials = async () => {
  try {
    const res = await api.get('/api/turn/credentials');
    
    // Check for standard backend response structure
    if (res.data && Array.isArray(res.data.iceServers)) {
      return res.data.iceServers;
    }
    
    // Check if the array is directly at root (unlikely with our backend but good for robustness)
    if (Array.isArray(res.data)) {
      return res.data;
    }

    console.warn('[TURN] API returned non-array iceServers, using fallback');
    return getStunFallback();
  } catch (err) {
    console.error('[TURN] Request failed, using fallback:', err.message);
    return getStunFallback();
  }
};

const getStunFallback = () => [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
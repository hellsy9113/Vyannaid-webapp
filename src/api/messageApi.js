/**
 * src/api/messageApi.js
 */
import { api } from './authApi';

/** GET /messages/unread-count → { count } */
export const getUnreadCount  = ()                    => api.get('/messages/unread-count');

/** GET /messages/:otherUserId?limit=50&before=<iso> */
export const getConversation = (otherUserId, params) => api.get(`/messages/${otherUserId}`, { params });

/** POST /messages/:otherUserId  { text } */
export const sendMessage     = (otherUserId, text)   => api.post(`/messages/${otherUserId}`, { text });

/** PATCH /messages/:otherUserId/read */
export const markRead        = (otherUserId)         => api.patch(`/messages/${otherUserId}/read`);
import { api } from "./authApi";

// Base: /api/aariv — shared 'api' uses /api, so we call /aariv/...

export const sendMessageToAariv = async (data) => {
  const res = await api.post("/aariv/chat", data);
  return res.data;
};

export const getChatHistory = async (userId, sessionId) => {
  const res = await api.get(`/aariv/history/${sessionId}`, { params: { userId } });
  return res.data;
};

export const getRecentSessions = async (userId) => {
  const res = await api.get("/aariv/sessions", { params: { userId } });
  return res.data;
};

export const deleteChatSession = async (userId, sessionId) => {
  const res = await api.delete(`/aariv/session/${sessionId}`, { params: { userId } });
  return res.data;
};
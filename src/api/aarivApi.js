import { api } from "./authApi";

export const sendMessageToAariv = async (data) => {
  const res = await api.post("/api/aariv/chat", data);
  return res.data;
};

export const getChatHistory = async (userId, sessionId) => {
  const res = await api.get(`/api/aariv/history/${sessionId}`, { params: { userId } });
  return res.data;
};

export const getRecentSessions = async (userId) => {
  const res = await api.get("/api/aariv/sessions", { params: { userId } });
  return res.data;
};

export const deleteChatSession = async (userId, sessionId) => {
  const res = await api.delete(`/api/aariv/session/${sessionId}`, { params: { userId } });
  return res.data;
};
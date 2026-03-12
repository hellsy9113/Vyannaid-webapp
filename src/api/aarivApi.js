import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/aariv";

export const sendMessageToAariv = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/chat`, data);
  return res.data;
};

export const getChatHistory = async (userId, sessionId) => {
  const res = await axios.get(`${API_BASE_URL}/history/${sessionId}?userId=${userId}`);
  return res.data;
};

export const getRecentSessions = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/sessions?userId=${userId}`);
  return res.data;
};

export const deleteChatSession = async (userId, sessionId) => {
  const res = await axios.delete(`${API_BASE_URL}/session/${sessionId}?userId=${userId}`);
  return res.data;
};
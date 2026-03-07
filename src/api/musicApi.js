import { api } from "./authApi";

export const getAllSongs       = ()         => api.get("/api/music");
export const getRandomSong     = ()         => api.get("/api/music/random");
export const getSongsByCategory = (category) => api.get(`/api/music/category/${category}`);
export const searchSongs       = (q)        => api.get(`/api/music/search?q=${encodeURIComponent(q)}`);
export const getSongById       = (id)       => api.get(`/api/music/${id}`);
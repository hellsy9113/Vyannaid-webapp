import { api } from "./authApi";

export const getAllSongs       = ()         => api.get("/music");
export const getRandomSong     = ()         => api.get("/music/random");
export const getSongsByCategory = (category) => api.get(`/music/category/${category}`);
export const searchSongs       = (q)        => api.get(`/music/search?q=${encodeURIComponent(q)}`);
export const getSongById       = (id)       => api.get(`/music/${id}`);
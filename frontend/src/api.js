import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api', // FastAPI default URL
  timeout: 30000,
});

export const searchPlayers = async (query) => {
  try {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching players:", error);
    return [];
  }
};

export const comparePlayers = async (payload) => {
  try {
    // payload: { target_player_id, target_season, min_minutes, target_compare_season }
    const response = await api.get('/compare', { params: payload });
    return response.data;
  } catch (error) {
    console.error("Error comparing players:", error);
    throw error;
  }
};

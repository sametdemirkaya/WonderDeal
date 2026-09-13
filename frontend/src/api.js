import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api', // FastAPI default URL
  timeout: 30000,
});

export const searchPlayers = async (query, filters = {}) => {
  try {
    let url = `/search?q=${encodeURIComponent(query)}`;
    if (filters.season) url += `&season=${encodeURIComponent(filters.season)}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error searching players:", error);
    return [];
  }
};

export const comparePlayers = async (payload) => {
  try {
    // payload: { target_player_id, target_season, min_minutes, season, min_market_value, max_market_value, include_unknown_value }
    let url = `/compare?target_player_id=${payload.target_player_id}&target_season=${encodeURIComponent(payload.target_season)}&min_minutes=${payload.min_minutes || 500}`;
    
    if (payload.season) url += `&season=${encodeURIComponent(payload.season)}`;
    if (payload.min_market_value !== undefined) url += `&min_market_value=${payload.min_market_value}`;
    if (payload.max_market_value !== undefined) url += `&max_market_value=${payload.max_market_value}`;
    if (payload.include_unknown_value !== undefined) url += `&include_unknown_value=${payload.include_unknown_value}`;
    if (payload.age_min !== undefined) url += `&age_min=${payload.age_min}`;
    if (payload.age_max !== undefined) url += `&age_max=${payload.age_max}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error comparing players:", error);
    return null;
  }
};

export const getPlayerStats = async (playerId, season) => {
  try {
    const url = `/player/${playerId}/${encodeURIComponent(season)}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return null;
  }
};

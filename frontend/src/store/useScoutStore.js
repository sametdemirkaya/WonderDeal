import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useScoutStore = create(
  persist(
    (set, get) => ({
      // Search State
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      
      searchLoading: false,
      setSearchLoading: (status) => set({ searchLoading: status }),

      // Target Player State
      targetPlayer: null, // { player_name, position_group, team }
      setTargetPlayer: (player) => set({ targetPlayer: player }),
      clearTargetPlayer: () => set({ targetPlayer: null, compareResults: [] }),

      // Filters State
      filters: {
        season: '25-26', // Tekli seçim için varsayılan sezon
        min_market_value: 0,
        max_market_value: 200000000,
        include_unknown_value: true,
        min_similarity: 50,
        max_distance: 15,
        age_min: 15,
        age_max: 40,
        min_minutes: 500,
        position_group: 'FW', // Default to Forward, but dynamically updated based on targetPlayer
      },
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),

      // Multi-Select for Comparison
      selectedPlayersForCompare: [],
      togglePlayerSelection: (player) => set((state) => {
        const isSelected = state.selectedPlayersForCompare.some(p => p.player_id === player.player_id && p.season === player.season);
        if (isSelected) {
          return { selectedPlayersForCompare: state.selectedPlayersForCompare.filter(p => !(p.player_id === player.player_id && p.season === player.season)) };
        } else {
          // Max 4 players
          if (state.selectedPlayersForCompare.length >= 4) return state;
          return { selectedPlayersForCompare: [...state.selectedPlayersForCompare, player] };
        }
      }),
      clearPlayerSelection: () => set({ selectedPlayersForCompare: [] }),

      // Compare Results State
      compareResults: null,
      setCompareResults: (results) => set({ compareResults: results }),
      
      lastCompareParams: null,
      setLastCompareParams: (params) => set({ lastCompareParams: params }),
      
      isComparing: false,
      setIsComparing: (status) => set({ isComparing: status }),

      // Shortlist State
      shortlist: [],
      addToShortlist: (player, targetPlayerObj) => set((state) => {
        // Prevent duplicates using player_id
        if (state.shortlist.some(p => p.player.player_id === player.player_id && p.player.season === player.season)) return state;
        return {
          shortlist: [...state.shortlist, { player, target: targetPlayerObj || { player_name: 'Unknown', player_id: null, season: null }, addedAt: new Date().toISOString() }]
        };
      }),
      removeFromShortlist: (playerId, season) => set((state) => ({
        shortlist: state.shortlist.filter(p => !(p.player.player_id === playerId && p.player.season === season))
      })),
      isInShortlist: (playerId, season) => get().shortlist.some(p => p.player.player_id === playerId && p.player.season === season),
    }),
    {
      name: 'wonderdeal-scout-storage', // unique name
      partialize: (state) => ({ shortlist: state.shortlist }), // Only persist the shortlist
    }
  )
);

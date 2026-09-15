import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchPlayers, getPlayerStats } from '../api';
import { useScoutStore } from '../store/useScoutStore';
import { AnimatePresence, motion } from 'framer-motion';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { setGlobalSlideOverPlayer } = useScoutStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const searchResults = await searchPlayers(query, { season: 'All' });
        setResults(searchResults.slice(0, 8)); // Top 8 results
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const handler = setTimeout(fetchResults, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const handleSelectPlayer = async (player) => {
    setShowDropdown(false);
    setQuery('');
    try {
      const fullProfile = await getPlayerStats(player.player_id, player.season);
      const formattedPlayer = {
        ...fullProfile,
        player_id: fullProfile.player_id,
        player_name: fullProfile.player_name,
        team: fullProfile.team,
        season: fullProfile.season,
        age: fullProfile.age,
        position_group: fullProfile.position,
        nationality: fullProfile.nationality || 'Unknown',
        minutes_played: fullProfile.stats?.minutesPlayed || 0,
        height: fullProfile.height,
        market_value: fullProfile.stats?.market_value,
        market_value_currency: fullProfile.market_value_currency || '€',
        raw_stats: fullProfile.raw_stats,
        total_stats: fullProfile.total_stats
      };
      setGlobalSlideOverPlayer(formattedPlayer);
    } catch (error) {
      console.error("Error fetching full player profile:", error);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <div className="relative flex items-center w-full h-11 rounded-full bg-surface-container border border-outline-variant/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-md transition-all">
        <Search className="w-4 h-4 text-on-surface-variant absolute left-4" />
        <input
          type="text"
          placeholder="Search any player (e.g. Salah)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setShowDropdown(true);
          }}
          className="w-full h-full bg-transparent outline-none pl-11 pr-10 text-sm text-on-surface placeholder-on-surface-variant/50 font-body-md"
        />
        {isSearching && (
          <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-4" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (query.trim().length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden z-[100]"
          >
            {results.length > 0 ? (
              <div className="max-h-72 overflow-y-auto custom-scrollbar p-1">
                {results.map((player) => (
                  <button
                    key={`${player.player_id}-${player.season}`}
                    onClick={() => handleSelectPlayer(player)}
                    className="w-full flex items-center justify-between p-3 hover:bg-surface-variant rounded-lg transition-colors text-left group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {player.player_name}
                      </span>
                      <span className="text-xs text-on-surface-variant font-body-sm">
                        {player.team} • {player.season}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded-md border border-outline-variant/30">
                      {player.Pos}
                    </span>
                  </button>
                ))}
              </div>
            ) : !isSearching ? (
              <div className="p-4 text-center text-sm text-on-surface-variant">
                No players found matching "{query}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;

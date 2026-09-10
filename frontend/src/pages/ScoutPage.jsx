import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoutStore } from '../store/useScoutStore';
import { searchPlayers, comparePlayers } from '../api';
import { Search, Loader2, Target, SlidersHorizontal, ArrowRight, X, User } from 'lucide-react';
import ResultsTable from '../components/ResultsTable';
import PlayerSlideOver from '../components/PlayerSlideOver';

const ScoutPage = () => {
  const {
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    searchLoading, setSearchLoading,
    targetPlayer, setTargetPlayer, clearTargetPlayer,
    filters, setFilters,
    compareResults, setCompareResults,
    isComparing, setIsComparing,
    selectedPlayersForCompare, clearPlayerSelection
  } = useScoutStore();

  const navigate = useNavigate();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sorting state: default to DNA Similarity (cosine_similarity) descending
  const [sortConfig, setSortConfig] = useState({ key: 'cosine_similarity', direction: 'desc' });

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearchLoading(true);
        const results = await searchPlayers(searchQuery);
        setSearchResults(results);
        setSearchLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, setSearchLoading, setSearchResults]);

  const handleSelectPlayer = (player) => {
    const primaryPos = player.position_group.split(',')[0].trim();
    setTargetPlayer(player);
    setSearchQuery('');
    setSearchResults([]);
    setFilters({ position_group: primaryPos });
  };

  const handleCompare = async () => {
    if (!targetPlayer) return;
    setIsComparing(true);
    try {
      const results = await comparePlayers({
        target_player_id: targetPlayer.player_id,
        target_season: targetPlayer.season,
        min_minutes: filters.min_minutes
      });
      setCompareResults(results);
      setCurrentPage(1);
    } catch (error) {
      console.error("Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  // Auto-trigger comparison when targetPlayer or backend filters change
  useEffect(() => {
    const handler = setTimeout(() => {
      if (targetPlayer && !isComparing) {
        handleCompare();
      }
    }, 800); // 800ms debounce to prevent spamming while typing age/minutes
    
    return () => clearTimeout(handler);
  }, [targetPlayer, filters.age_min, filters.age_max, filters.min_minutes]);

  // Reset selection when new target is picked
  useEffect(() => {
    clearPlayerSelection();
  }, [targetPlayer]);

  // Derived state: Filtered Matches
  const filteredMatches = useMemo(() => {
    if (!compareResults?.matches) return [];
    return compareResults.matches.filter(player => {
      const simMatch = player.cosine_similarity >= filters.min_similarity;
      const distMatch = player.euclidean_distance <= filters.max_distance;
      return simMatch && distMatch;
    });
  }, [compareResults, filters.min_similarity, filters.max_distance]);

  // Derived state: Sorted Matches
  const sortedMatches = useMemo(() => {
    let sortableItems = [...filteredMatches];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Handle strings
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
          if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        
        // Handle numbers
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      });
    }
    return sortableItems;
  }, [filteredMatches, sortConfig]);

  // Derived state: Paginated Matches
  const totalPages = Math.ceil(sortedMatches.length / itemsPerPage);
  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedMatches.slice(start, start + itemsPerPage);
  }, [sortedMatches, currentPage]);

  const requestSort = (key) => {
    let direction = 'desc'; // Default to desc when clicking a new column
    if (sortConfig && sortConfig.key === key) {
      // Toggle direction continuously
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCompareAction = () => {
    if (selectedPlayersForCompare.length === 0) return;
    const playerNames = selectedPlayersForCompare.map(p => encodeURIComponent(p.player_name)).join(',');
    navigate(`/compare?match=${playerNames}`);
  };

  return (
    <div className="flex flex-col w-full px-space-xl pb-32 gap-space-lg text-on-surface animate-slide-up-fade">
      <section className="flex flex-col gap-1 pt-space-sm pb-space-sm">
        <h1 className="text-5xl font-black text-on-surface tracking-tight">Player Scout</h1>
        <p className="text-on-surface-variant font-body-lg max-w-2xl mt-2">
          Find the perfect tactical and stylistic match for any player using advanced data analytics.
        </p>
      </section>

      {/* Target Selection & Search */}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/30 p-space-sm shadow-sm">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 text-primary">
            <Target className="w-4 h-4" /> Select Target Player
          </h3>
          
          {targetPlayer ? (
            <div className="flex items-center justify-between bg-surface px-4 py-2 rounded-lg border border-primary/40">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg">{targetPlayer.player_name}</h3>
                <span className="text-on-surface-variant text-xs">{targetPlayer.team} • {targetPlayer.position_group}</span>
              </div>
              <button 
                onClick={() => {
                  clearTargetPlayer();
                  setCompareResults([]);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-error hover:bg-error/10 rounded-md transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5"/> Clear Selection
              </button>
            </div>
        ) : (
          <div className="relative">
            <div className="flex items-center bg-surface rounded-lg p-2 border border-outline-variant/50 focus-within:border-primary/60 transition-colors">
              <Search className="w-5 h-5 text-outline mx-2" />
              <input
                type="text"
                placeholder="Search a player (e.g., Trent Alexander-Arnold)..."
                className="w-full bg-transparent border-0 text-on-surface placeholder-outline focus:ring-0 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchLoading && <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />}
            </div>
            
            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-high border border-outline-variant/50 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {searchResults.map((p, i) => (
                  <div 
                    key={i} 
                    className="p-3 hover:bg-surface-variant cursor-pointer border-b border-outline-variant/20 last:border-0"
                    onClick={() => handleSelectPlayer(p)}
                  >
                    <div className="font-semibold">{p.player_name}</div>
                    <div className="text-xs text-on-surface-variant">{p.team} • {p.position_group}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </section>

      {/* Advanced Filters */}
      {targetPlayer && (
        <section className="bg-surface-container-low rounded-xl border border-outline-variant/30 p-space-sm shadow-sm mt-space-2xs">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-outline" /> Analysis Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            
            {/* 1. Min Similarity */}
            <div className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/30 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold">Min DNA Similarity</label>
                <span className="font-data-metric-sm font-bold text-primary text-sm">{filters.min_similarity}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={filters.min_similarity}
                onChange={(e) => {
                  setFilters({ min_similarity: parseInt(e.target.value) });
                  setCurrentPage(1);
                }}
                className="w-full accent-primary h-1.5"
              />
            </div>

            {/* 2. Max Euclidean Distance */}
            <div className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/30 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold">Max Quality Diff</label>
                <span className="font-data-metric-sm font-bold text-error text-sm">{filters.max_distance}</span>
              </div>
              <input 
                type="range" 
                min="0" max="30" step="0.5"
                value={filters.max_distance}
                onChange={(e) => {
                  setFilters({ max_distance: parseFloat(e.target.value) });
                  setCurrentPage(1);
                }}
                className="w-full accent-error h-1.5"
              />
              <span className="text-[10px] text-outline mt-1 text-center font-label-caps">Önerilen: 15 altı</span>
            </div>

            {/* 3. Age Range */}
            <div className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/30 flex flex-col justify-center">
              <label className="text-xs font-semibold mb-1 block">Age Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={filters.age_min}
                  onChange={(e) => setFilters({ age_min: parseInt(e.target.value) || 15 })}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded p-1 text-xs text-center focus:outline-none focus:border-primary transition-colors h-6"
                  placeholder="Min"
                />
                <span className="text-outline text-xs">-</span>
                <input 
                  type="number" 
                  value={filters.age_max}
                  onChange={(e) => setFilters({ age_max: parseInt(e.target.value) || 40 })}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded p-1 text-xs text-center focus:outline-none focus:border-primary transition-colors h-6"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* 4. Min Minutes */}
            <div className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/30 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold">Min Minutes</label>
                <span className="font-data-metric-sm font-bold text-on-surface text-sm">{filters.min_minutes}</span>
              </div>
              <input 
                type="range" 
                min="0" max="3000" step="100"
                value={filters.min_minutes}
                onChange={(e) => setFilters({ min_minutes: parseInt(e.target.value) })}
                className="w-full accent-outline h-1.5"
              />
            </div>

          </div>
        </section>
      )}
      
      {/* Loading State */}
      {isComparing && (
        <div className="flex flex-col items-center justify-center p-12 text-outline">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Analyzing profiles and calculating similarities...</p>
        </div>
      )}

      {/* Results Section */}
      {!isComparing && compareResults?.matches && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-headline-md">Analysis Results</h2>
            <span className="text-sm text-on-surface-variant font-body-sm">
              Showing {filteredMatches.length} matches
            </span>
          </div>
          
          <ResultsTable 
            results={paginatedMatches} 
            sortConfig={sortConfig}
            requestSort={requestSort}
            onRowClick={(player) => {
              setSelectedMatch(player);
              setSlideOverOpen(true);
            }} 
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-outline-variant/30 disabled:opacity-50 hover:bg-surface-variant transition-colors"
              >
                Prev
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Simple logic: show first, last, current, and +/- 1 from current
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button 
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                          currentPage === page ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-variant'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-outline">...</span>;
                  }
                  return null;
                })}
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-outline-variant/30 disabled:opacity-50 hover:bg-surface-variant transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* Floating Bottom Bar for Selected Players */}
      {selectedPlayersForCompare.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-surface-container-high/95 backdrop-blur-md px-6 py-3 rounded-full border border-primary/40 shadow-2xl flex items-center gap-6">
            
            <div className="text-sm font-semibold whitespace-nowrap">
              <span className="text-primary">{selectedPlayersForCompare.length}</span> / 4 Selected
            </div>

            <div className="flex items-center gap-2 border-l border-outline/30 pl-6">
              {selectedPlayersForCompare.map((p, idx) => (
                <div key={idx} className="flex items-center bg-surface rounded-full px-2 py-1 pr-3 shadow-sm border border-outline-variant/50 gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-mono">
                    {p.player_name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] truncate" title={p.player_name}>{p.player_name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-l border-outline/30 pl-6">
              <button 
                onClick={clearPlayerSelection}
                className="px-3 py-1.5 text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={handleCompareAction}
                className="px-4 py-1.5 bg-primary hover:bg-primary-container text-on-primary text-sm font-bold rounded-full transition-colors flex items-center gap-2 shadow-sm"
              >
                Compare <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Slide-over Panel */}
      <PlayerSlideOver 
        isOpen={slideOverOpen} 
        onClose={() => setSlideOverOpen(false)} 
        player={selectedMatch} 
        targetData={compareResults}
      />

    </div>
  );
};

export default ScoutPage;

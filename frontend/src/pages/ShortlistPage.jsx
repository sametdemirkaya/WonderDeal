import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoutStore } from '../store/useScoutStore';
import { Bookmark, Trash2, ArrowRight, ChevronDown, ChevronUp, Target, Loader2, FileEdit } from 'lucide-react';
import { getSimilarityColor, getDistanceColor } from '../utils/colorUtils';
import { comparePlayers } from '../api';
import PageTransition from '../components/PageTransition';
import PlayerNoteModal from '../components/PlayerNoteModal';

const ShortlistPage = () => {
  const { shortlist, removeFromShortlist, setCompareResults, setTargetPlayer } = useScoutStore();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
  const [isComparingTarget, setIsComparingTarget] = useState(null);
  const [noteModalPlayer, setNoteModalPlayer] = useState(null);

  // Group the shortlist by target player name
  const groupedShortlist = useMemo(() => {
    const groups = {};
    shortlist.forEach(item => {
      // Safely extract target name
      let targetName = "Bağımsız Keşifler";
      if (typeof item.target === 'object' && item.target !== null && item.target.player_name !== "Unknown") {
        targetName = item.target.player_name || "Bağımsız Keşifler";
      } else if (typeof item.target === 'string' && item.target !== "Unknown") {
        targetName = item.target;
      }

      if (!groups[targetName]) groups[targetName] = [];
      groups[targetName].push(item);
    });
    return groups;
  }, [shortlist]);

  const toggleGroup = (targetName) => {
    setOpenGroups(prev => ({
      ...prev,
      [targetName]: !prev[targetName]
    }));
  };

  const handleViewComparison = (item) => {
    // If there is no valid target player, set this saved player as Slot A and navigate to H2H
    if (!item.target || !item.target.player_id || item.target.player_name === "Unknown" || item.target.player_name === "Bağımsız Keşifler") {
      navigate('/h2h', { 
        state: { 
          playerA: { playerId: item.player.player_id, season: item.player.season, name: item.player.player_name } 
        } 
      });
      return;
    }

    // If there is a target player, Target -> Slot A, Saved -> Slot B
    navigate('/h2h', { 
      state: { 
        playerA: { playerId: item.target.player_id, season: item.target.season, name: item.target.player_name },
        playerB: { playerId: item.player.player_id, season: item.player.season, name: item.player.player_name }
      } 
    });
  };

  return (
    <PageTransition className="flex flex-col w-full px-space-xl pb-space-2xl gap-space-lg text-on-surface">
      
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-md mb-4">
        <div className="flex flex-col gap-space-2xs">
          <h1 className="font-display text-3xl lg:text-5xl text-on-surface tracking-tight font-bold flex items-center gap-3 lg:gap-4">
            <Bookmark className="w-10 h-10 lg:w-12 lg:h-12 text-primary" /> Shortlisted Players
          </h1>
          <p className="text-on-surface-variant font-body-sm">
            Review your saved players grouped by their target profiles.
          </p>
        </div>
      </section>

      {/* Content */}
      {shortlist.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-space-xl text-center flex flex-col items-center justify-center min-h-[400px]">
          <Bookmark className="w-16 h-16 text-outline/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your shortlist is empty</h2>
          <p className="text-on-surface-variant mb-6">Discover and save players from the scout page to build your shortlist.</p>
          <button 
            onClick={() => navigate('/scout')}
            className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            Go to Scout Page <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedShortlist).map(([targetName, items]) => {
            const isOpen = openGroups[targetName] !== false; 

            return (
              <div key={targetName} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleGroup(targetName)}
                  className="w-full flex items-center justify-between p-6 bg-surface-container-high hover:bg-surface-variant transition-colors border-b border-outline-variant/30 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold font-headline-md flex items-center gap-2">
                        Hedef: <span className="text-primary">{targetName}</span>
                      </h2>
                      <p className="text-sm text-on-surface-variant">{items.length} {items.length === 1 ? 'Oyuncu' : 'Oyuncu'}</p>
                    </div>
                  </div>
                  <div className="text-outline">
                    {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {items.map((item, idx) => {
                        const isFetching = isComparingTarget === item.player.player_name;
                        const simColor = getSimilarityColor(item.player.cosine_similarity);
                        const distColor = getDistanceColor(item.player.euclidean_distance);

                        return (
                          <div key={idx} className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:border-primary/40 transition-colors flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold font-mono text-xl border border-outline-variant/30">
                                  {item.player.player_name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg leading-tight">{item.player.player_name}</h3>
                                  <p className="text-sm text-on-surface-variant">{item.player.team} • {item.player.nationality}</p>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromShortlist(item.player.player_id, item.player.season);
                                }}
                                className="p-2 text-outline hover:text-error bg-surface-variant rounded-full transition-colors"
                                title="Remove from shortlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {targetName !== "Bağımsız Keşifler" && (
                              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20 mb-4 flex-1">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-on-surface-variant">DNA Similarity</span>
                                  <span className={`font-data-metric-md font-bold ${simColor.text}`}>{item.player.cosine_similarity}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-on-surface-variant">Quality/Volume Diff</span>
                                  <span className={`font-data-metric-md font-bold ${distColor.text}`}>{item.player.euclidean_distance}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col gap-2 mt-auto">
                              <button 
                                onClick={() => setNoteModalPlayer(item.player)}
                                className="w-full py-2.5 flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-medium rounded-lg transition-colors text-sm border border-outline-variant/30 hover:border-outline-variant/60"
                              >
                                <FileEdit className="w-4 h-4" />
                                Not Ekle / Görüntüle
                              </button>
                              <button 
                                onClick={() => handleViewComparison(item)}
                                disabled={isFetching}
                                className="w-full py-2.5 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-primary/20 text-on-surface hover:text-primary font-semibold rounded-lg transition-colors text-sm border border-transparent hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isFetching ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                                  </>
                                ) : (
                                  "HeadToHead'e Gönder"
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <PlayerNoteModal 
        isOpen={!!noteModalPlayer} 
        onClose={() => setNoteModalPlayer(null)} 
        player={noteModalPlayer} 
      />
    </PageTransition>
  );
};

export default ShortlistPage;

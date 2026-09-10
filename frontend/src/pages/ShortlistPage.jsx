import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoutStore } from '../store/useScoutStore';
import { Bookmark, Trash2, ArrowRight, ChevronDown, ChevronUp, Target, Loader2 } from 'lucide-react';
import { getSimilarityColor, getDistanceColor } from '../utils/colorUtils';
import { comparePlayers } from '../api';

const ShortlistPage = () => {
  const { shortlist, removeFromShortlist, setCompareResults, setTargetPlayer } = useScoutStore();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
  const [isComparingTarget, setIsComparingTarget] = useState(null);

  // Group the shortlist by target player name
  const groupedShortlist = useMemo(() => {
    const groups = {};
    shortlist.forEach(item => {
      // Safely extract target name (handles both new object format and old string format)
      let targetName = "Unknown Target";
      if (typeof item.target === 'object' && item.target !== null) {
        targetName = item.target.player_name || "Unknown Target";
      } else if (typeof item.target === 'string') {
        targetName = item.target;
      }

      if (!groups[targetName]) {
        groups[targetName] = [];
      }
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

  const handleViewComparison = async (item) => {
    // If there is no valid target player, set this player as the new target
    if (!item.target || !item.target.player_id || item.target.player_name === "Unknown") {
      setTargetPlayer({
        player_name: item.player.player_name,
        player_id: item.player.player_id,
        season: item.player.season,
        team: item.player.team,
        position_group: item.player.position_group
      });
      navigate('/scout');
      return;
    }

    setIsComparingTarget(item.player.player_name);
    try {
      // Re-fetch the target's data along with broad matches to populate compareResults
      const data = await comparePlayers({
        target_player_id: item.target.player_id,
        target_season: item.target.season,
        min_minutes: 10
      });
      
      setCompareResults(data);
      navigate(`/compare?match=${encodeURIComponent(item.player.player_name)}`);
    } catch (error) {
      console.error("Failed to refetch comparison data:", error);
      alert("Kıyaslama verisi alınamadı. Hedef oyuncu veritabanında bulunamıyor olabilir.");
    } finally {
      setIsComparingTarget(null);
    }
  };

  return (
    <div className="flex flex-col w-full px-space-xl pb-space-2xl gap-space-lg text-on-surface animate-slide-up-fade">
      
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-md mb-4">
        <div className="flex flex-col gap-space-2xs">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-primary" /> Shortlisted Players
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
                                "View Comparison"
                              )}
                            </button>
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
    </div>
  );
};

export default ShortlistPage;

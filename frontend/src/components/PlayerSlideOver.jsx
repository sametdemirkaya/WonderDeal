import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoutStore } from '../store/useScoutStore';
import PositionStatsChart from './PositionStatsChart';
import { X, TrendingUp, Activity, Bookmark, BookmarkCheck } from 'lucide-react';
import { getSimilarityColor, getDistanceColor } from '../utils/colorUtils';

const PlayerSlideOver = ({ isOpen, onClose, player, targetData }) => {
  const navigate = useNavigate();
  const { targetPlayer, addToShortlist, removeFromShortlist, isInShortlist } = useScoutStore();
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300); // Wait for transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !player) return null;

  const isSaved = isInShortlist(player.player_name);
  
  const simColor = getSimilarityColor(player.cosine_similarity);
  const distColor = getDistanceColor(player.euclidean_distance);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over panel */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-outline-variant/30 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-y-auto animate-slide-up-fade">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-surface-container-low">
            <div>
              <h2 className="text-xl font-bold text-on-surface font-headline-md">{player.player_name}</h2>
              <p className="text-sm text-on-surface-variant font-body-sm">{player.team} • {player.nationality}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (isSaved) {
                    removeFromShortlist(player.player_name);
                  } else {
                    addToShortlist(player, targetPlayer || null);
                  }
                }}
                className={`p-2 rounded-full transition-colors ${isSaved ? 'text-primary bg-primary/10' : 'text-outline hover:text-on-surface bg-surface-variant'}`}
                title={isSaved ? "Remove from Shortlist" : "Add to Shortlist"}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-outline hover:text-on-surface bg-surface-variant rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 flex flex-col gap-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                <p className="text-xs text-outline uppercase tracking-wider font-label-caps mb-1">Age</p>
                <p className="text-xl font-data-metric-lg font-bold text-on-surface">{player.age}</p>
              </div>
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                <p className="text-xs text-outline uppercase tracking-wider font-label-caps mb-1">Minutes</p>
                <p className="text-xl font-data-metric-lg font-bold text-on-surface">{player.minutes_played}</p>
              </div>
            </div>

            {/* Similarity Metrics */}
            <div className="bg-surface-container-low p-5 rounded-xl border border-primary/20">
              <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Tactical & Volume Match
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">DNA Similarity</span>
                    <span className={`font-data-metric-md font-bold ${simColor.text}`}>{player.cosine_similarity}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${simColor.bg}`} style={{ width: `${Math.max(0, Math.min(100, player.cosine_similarity))}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Quality/Volume Diff</span>
                    <span className={`font-data-metric-md font-bold ${distColor.text}`}>{player.euclidean_distance}</span>
                  </div>
                  <p className="text-xs text-outline mt-1 italic">* Lower volume diff means closer statistical output.</p>
                </div>
              </div>
            </div>

            {/* Position Specific Stats Chart */}
            <div>
              <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-outline" /> Position Specific Stats (Per 90)
              </h3>
              <PositionStatsChart 
                targetStats={targetData?.target_raw_stats}
                targetName={targetData?.target_player_name}
                matchPlayers={[player]}
              />
            </div>

            {/* Detailed Comparison Button */}
            <div className="mt-auto pt-4">
              <button 
                onClick={() => navigate(`/compare?match=${encodeURIComponent(player.player_name)}`)}
                className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Detaylı Karşılaştırma</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerSlideOver;

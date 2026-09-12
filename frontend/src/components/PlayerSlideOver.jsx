import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoutStore } from '../store/useScoutStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Activity, Bookmark, BookmarkCheck } from 'lucide-react';
import { getSimilarityColor, getDistanceColor } from '../utils/colorUtils';
import PositionStatsChart from './PositionStatsChart';

const PlayerSlideOver = ({ isOpen, onClose, player, targetData }) => {
  const navigate = useNavigate();
  const { targetPlayer, addToShortlist, removeFromShortlist, isInShortlist, shortlist } = useScoutStore();
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

  const isSaved = isInShortlist(player.player_id, player.season);
  
  const simColor = getSimilarityColor(player.cosine_similarity);
  const distColor = getDistanceColor(player.euclidean_distance);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-outline-variant/30 bg-surface-container-low rounded-t-2xl shrink-0">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-on-surface font-headline-md">{player.player_name}</h2>
                <p className="text-sm text-on-surface-variant font-body-sm mb-3">
                  {player.team} • {player.nationality} • {player.position_group}
                </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                  {player.age} Years
                </span>
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                  {player.minutes_played} Min
                </span>
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                  {player.height ? `${player.height} cm` : 'N/A'}
                </span>
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                  {player.foot || 'N/A'} Foot
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md border border-primary/20">
                  {player.market_value ? `€${(player.market_value / 1000000).toFixed(1)}M` : 'N/A'}
                </span>
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                  Exp: {player.contract_until ? player.contract_until.substring(0, 4) : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (isSaved) {
                    removeFromShortlist(player.player_id, player.season);
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
            <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
            
            {/* Radar Chart for Player Stats */}
            {player.raw_stats && (
              <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/20">
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Position Stats Overview
                </h3>
                <PositionStatsChart 
                  targetStats={player.raw_stats} 
                  targetName={player.player_name} 
                  matchPlayers={[]}
                  colors={['#3b82f6']}
                />
              </div>
            )}

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
            
            {/* Key Similarity Drivers */}
            {player.similarity_drivers && player.similarity_drivers.length > 0 && (
              <div className="bg-surface-container p-5 rounded-xl border border-outline-variant">
                <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Benzerliğin Ana Sebepleri
                </h3>
                <div className="flex flex-wrap gap-2">
                  {player.similarity_drivers.map((driver, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-primary-container text-on-primary-container text-xs font-semibold rounded-full shadow-sm"
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Comparison Button */}
            <div className="pb-6">
              <button 
                onClick={() => navigate(`/compare?match=${encodeURIComponent(player.player_name)}`)}
                className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Detaylı Karşılaştırma</span>
              </button>
            </div>

          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PlayerSlideOver;

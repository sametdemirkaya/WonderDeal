import React, { useState, useEffect } from 'react';
import { useScoutStore } from '../store/useScoutStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const PlayerNoteModal = ({ player, isOpen, onClose }) => {
  const { playerNotes, savePlayerNote } = useScoutStore();

  const [isEditing, setIsEditing] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [isEditingMaxValue, setIsEditingMaxValue] = useState(false);

  const parseMV = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = val.toString().toUpperCase().trim();
    let num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 0;
    if (str.endsWith('M')) num *= 1000000;
    else if (str.endsWith('K')) num *= 1000;
    return num;
  };

  const formatMV = (val) => {
    if (val === 0 || !val) return '';
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  useEffect(() => {
    if (player && player.player_id) {
      const savedNote = playerNotes[player.player_id];
      if (savedNote) {
        setSummaryText(savedNote.summary || '');
        setTags(savedNote.tags || []);
        setMaxValue(savedNote.maxValue || '');
      } else {
        setSummaryText('');
        setTags([]);
        setMaxValue('');
      }
    }
  }, [player, playerNotes]);

  const handleSave = () => {
    if (player && player.player_id) {
      savePlayerNote(player.player_id, {
        summary: summaryText,
        tags: tags,
        maxValue: maxValue
      });
    }
    onClose();
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (!isOpen || !player) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#071426]/80 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          {/* MAIN MODAL CONTAINER */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl my-auto bg-[#0a1628]/95 border border-outline-variant/30 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header (Aligned with PlayerSlideOver) */}
            <div className="flex items-start justify-between p-6 border-b border-outline-variant/30 bg-surface-container-low rounded-t-2xl shrink-0">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-on-surface font-display">{player.player_name || player.name}</h2>
                <p className="text-sm text-on-surface-variant mb-3 font-medium">
                  {player.team} • {player.nationality || 'N/A'} • {player.position_group || player.position}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                    {player.age || 'N/A'} Years
                  </span>
                  {player.minutes_played !== undefined && (
                    <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                      {player.minutes_played} Min
                    </span>
                  )}
                  {player.height !== undefined && (
                    <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                      {player.height ? `${player.height} cm` : 'N/A'}
                    </span>
                  )}
                  {player.foot && (
                    <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                      {player.foot} Foot
                    </span>
                  )}
                  {player.market_value !== undefined && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md border border-primary/20">
                      {player.market_value ? `€${(player.market_value / 1000000).toFixed(1)}M` : 'N/A'}
                    </span>
                  )}
                  {player.contract_until && (
                    <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-md border border-outline-variant/50">
                      Exp: {player.contract_until.substring(0, 4)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-surface-container-high hover:text-error flex items-center justify-center text-outline transition-colors ml-1" title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Header Tabs & Max Value */}
            <div className="px-6 pt-2 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-y-2">
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
                <button className="relative pb-3 text-sm font-semibold text-primary before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary whitespace-nowrap">
                  Overview & Actions
                </button>
                {/* Tabs 2 and 3 removed */}
              </div>
              <div className="flex items-center gap-2 pb-2">
                <span className="text-xs font-semibold uppercase text-outline tracking-wider">Max Transfer Fee:</span>
                {isEditingMaxValue ? (
                  <div className="flex items-center">
                    <span className="text-primary font-bold text-base">€</span>
                    <input
                      type="text"
                      className="bg-transparent border-b-2 border-primary/50 focus:border-primary text-primary font-bold px-1 py-0 w-24 text-center focus:outline-none text-base transition-colors"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                      onBlur={(e) => {
                        const num = parseMV(e.target.value);
                        setMaxValue(formatMV(num));
                        setIsEditingMaxValue(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur();
                      }}
                      autoFocus
                      placeholder="Ex: 300K"
                    />
                  </div>
                ) : (
                  <span 
                    className="text-primary font-bold text-base cursor-pointer hover:text-primary-fixed transition-colors px-1"
                    onClick={() => {
                      // If it's legacy data with €, strip it before editing
                      if (maxValue && maxValue.startsWith('€')) {
                        setMaxValue(maxValue.substring(1));
                      }
                      setIsEditingMaxValue(true);
                    }}
                  >
                    {maxValue ? (maxValue.startsWith('€') ? maxValue : `€${maxValue}`) : 'Not specified'}
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
              {/* Executive Summary */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-outline font-bold">
                    Executive Summary & Tactical Role
                  </span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-outline hover:text-primary cursor-pointer transition-colors font-medium"
                  >
                    {isEditing ? "Done" : "Edit Text"}
                  </button>
                </div>
                <div className="p-4 bg-surface-container-lowest/60 border border-outline-variant/20 rounded-xl flex flex-col gap-3 min-h-[120px]">
                  {isEditing ? (
                    <textarea
                      className="w-full h-24 bg-surface-container/50 text-sm text-on-surface leading-relaxed border border-outline-variant/30 rounded-lg p-3 focus:outline-none focus:border-primary resize-none transition-colors"
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      placeholder="Write a tactical summary about the player..."
                    />
                  ) : (
                    <>
                      {!summaryText ? (
                        <div
                          className="flex-1 flex items-center justify-center text-outline/50 italic text-sm cursor-pointer hover:text-outline transition-colors"
                          onClick={() => setIsEditing(true)}
                        >
                          No tactical summary added for this player yet, click to write.
                        </div>
                      ) : (
                        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                          {summaryText}
                        </p>
                      )}
                    </>
                  )}

                  {/* Dynamic Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-outline-variant/15 mt-auto">
                    <span className="text-xs font-semibold text-outline mr-1">Tags:</span>
                    {tags.map((tag, index) => (
                      <span key={index} className="px-2.5 py-1 rounded-md bg-primary-container/20 border border-primary/20 text-primary text-xs font-medium flex items-center gap-1.5 shadow-sm">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-error transition-colors bg-transparent rounded-full p-0.5 hover:bg-error/10">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="bg-transparent border border-dashed border-outline-variant/50 hover:border-outline-variant text-on-surface text-xs px-3 py-1 rounded-md focus:outline-none focus:border-primary focus:border-solid w-32 placeholder:text-outline-variant/70 transition-all"
                      placeholder="Add Tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                </div>
              </div>

              {/* Removed Live Match Observations Timeline entirely */}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-lowest/50 flex items-center justify-end">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="h-9 px-4 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="h-9 px-5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold flex items-center gap-2 shadow transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerNoteModal;

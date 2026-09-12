import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import PremiumSlider from './PremiumSlider';
import SeasonToggle from './SeasonToggle';

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
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
  return val.toString();
};

const FilterDrawer = ({ isOpen, onClose, filters, setFilters, onApply }) => {
  // Use a local copy of filters
  const [localFilters, setLocalFilters] = useState(filters);
  const [minMvStr, setMinMvStr] = useState(formatMV(filters.min_market_value));
  const [maxMvStr, setMaxMvStr] = useState(formatMV(filters.max_market_value === 500000000 ? 0 : filters.max_market_value));

  // Sync local state with global filters only when drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      setMinMvStr(formatMV(filters.min_market_value));
      setMaxMvStr(formatMV(filters.max_market_value === 500000000 ? 0 : filters.max_market_value));
    }
  }, [isOpen, filters]);

  const updateLocalFilter = (updates) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  const applyMinMv = () => {
    updateLocalFilter({ min_market_value: parseMV(minMvStr) });
  };
  const applyMaxMv = () => {
    const parsed = parseMV(maxMvStr);
    updateLocalFilter({ max_market_value: parsed === 0 ? 500000000 : parsed });
  };

  const handleApply = () => {
    // Make sure we capture the latest MV strings before applying
    const finalMin = parseMV(minMvStr);
    const parsedMax = parseMV(maxMvStr);
    const finalMax = parsedMax === 0 ? 500000000 : parsedMax;
    
    const finalFilters = {
      ...localFilters,
      min_market_value: finalMin,
      max_market_value: finalMax
    };

    setFilters(finalFilters);
    onApply();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-[600px] bg-surface border-l border-border-subtle shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface/50">
            <h2 className="text-lg font-bold text-white font-headline-md flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary-blue" />
              Gelişmiş Filtreler
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleApply}
                className="px-3 py-1.5 bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1"
              >
                Uygula
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 text-text-muted hover:text-white bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
            
            <PremiumSlider 
              label="Minimum DNA Similarity" 
              value={localFilters.min_similarity} 
              min={0} max={100} unit="%"
              onChange={(val) => updateLocalFilter({ min_similarity: val })}
              valueColor="text-primary" highlightColor="bg-primary"
            />

            <PremiumSlider 
              label="Maximum Quality Diff (Önerilen: < 15)" 
              value={localFilters.max_distance} 
              min={0} max={30} step={0.5}
              onChange={(val) => updateLocalFilter({ max_distance: val })}
              valueColor="text-primary" highlightColor="bg-primary"
            />

            <PremiumSlider 
              label="Minimum Minutes Played" 
              value={localFilters.min_minutes} 
              min={0} max={3000} step={100}
              onChange={(val) => updateLocalFilter({ min_minutes: val })}
              valueColor="text-primary" highlightColor="bg-primary"
            />

            {/* Age Range */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-muted">Age Range</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={localFilters.age_min}
                  onChange={(e) => updateLocalFilter({ age_min: parseInt(e.target.value) || 15 })}
                  className="flex-1 bg-surface border border-border-subtle rounded-xl px-4 py-2 text-sm text-center text-white focus:outline-none focus:border-primary-blue transition-colors shadow-inner"
                  placeholder="Min"
                />
                <span className="text-text-muted text-sm font-bold">-</span>
                <input 
                  type="number" 
                  value={localFilters.age_max}
                  onChange={(e) => updateLocalFilter({ age_max: parseInt(e.target.value) || 40 })}
                  className="flex-1 bg-surface border border-border-subtle rounded-xl px-4 py-2 text-sm text-center text-white focus:outline-none focus:border-primary-blue transition-colors shadow-inner"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Market Value Smart Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-muted">Market Value (€)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={minMvStr}
                  onChange={(e) => setMinMvStr(e.target.value)}
                  onBlur={applyMinMv}
                  onKeyDown={(e) => e.key === 'Enter' && applyMinMv()}
                  className="flex-1 bg-surface border border-border-subtle rounded-xl px-4 py-2 text-sm text-center text-white uppercase focus:outline-none focus:border-primary-blue transition-colors shadow-inner"
                  placeholder="Min (Örn: 100K)"
                />
                <span className="text-text-muted text-sm font-bold">-</span>
                <input 
                  type="text" 
                  value={maxMvStr}
                  onChange={(e) => setMaxMvStr(e.target.value)}
                  onBlur={applyMaxMv}
                  onKeyDown={(e) => e.key === 'Enter' && applyMaxMv()}
                  className="flex-1 bg-surface border border-border-subtle rounded-xl px-4 py-2 text-sm text-center text-white uppercase focus:outline-none focus:border-primary-blue transition-colors shadow-inner"
                  placeholder="Max (Örn: 10M)"
                />
              </div>
              <p className="text-[10px] text-text-dim text-center mt-1">Örn: "12.5M" (12.5 Milyon) veya "500K" (500 Bin)</p>
            </div>

            {/* Season */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-muted mb-1">Season Filter</label>
              <SeasonToggle 
                options={[
                  { label: 'Tüm Sezonlar', value: 'All' },
                  { label: '25-26', value: '25-26' },
                  { label: '24-25', value: '24-25' }
                ]}
                selected={localFilters.season}
                onChange={(val) => updateLocalFilter({ season: val })}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;

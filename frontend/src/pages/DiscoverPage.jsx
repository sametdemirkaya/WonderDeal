import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Activity, Bookmark, BookmarkCheck, SlidersHorizontal, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { discoverPlayers } from '../api';
import PlayerSlideOver from '../components/PlayerSlideOver';
import SeasonToggle from '../components/SeasonToggle';
import { useScoutStore } from '../store/useScoutStore';

const formatFeatureName = (name) => {
  let result = name.replace(/([A-Z])/g, ' $1');
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result.replace('Percentage', '%').trim();
};

const ALL_FEATURES = [
  'rating', 'accurateChippedPasses', 'accurateCrosses', 'accurateCrossesPercentage', 'accurateFinalThirdPasses', 'accurateLongBalls', 'accurateLongBallsPercentage', 'accurateOppositionHalfPasses', 'accurateOwnHalfPasses', 'accuratePassesPercentage', 'aerialDuelsWon', 'aerialDuelsWonPercentage', 'aerialLost', 'assists', 'ballRecovery', 'bigChancesCreated', 'bigChancesMissed', 'blockedShots', 'clearances', 'dispossessed', 'dribbledPast', 'errorLeadToGoal', 'errorLeadToShot', 'expectedAssists', 'expectedGoals', 'fouls', 'goalConversionPercentage', 'goals', 'goalsFromOutsideTheBox', 'groundDuelsWon', 'groundDuelsWonPercentage', 'headedGoals', 'hitWoodwork', 'inaccuratePasses', 'interceptions', 'keyPasses', 'offsides', 'passToAssist', 'penaltyConceded', 'penaltyWon', 'possessionLost', 'possessionWonAttThird', 'shotFromSetPiece', 'shotsFromInsideTheBox', 'shotsFromOutsideTheBox', 'shotsOffTarget', 'shotsOnTarget', 'successfulDribbles', 'successfulDribblesPercentage', 'tackles', 'tacklesWonPercentage', 'totalDuelsWonPercentage', 'touches', 'wasFouled', 'yellowCards'
];

const AVAILABLE_METRICS = ALL_FEATURES.map(f => ({ id: f, label: formatFeatureName(f) })).sort((a, b) => a.label.localeCompare(b.label));

const POSITIONS = ['All', 'FW', 'MF', 'DF'];

const parseMV = (val) => {
  if (!val) return null;
  if (typeof val === 'number') return val;
  const str = val.toString().toUpperCase().trim();
  let num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return null;
  if (str.endsWith('M')) num *= 1000000;
  else if (str.endsWith('K')) num *= 1000;
  return num;
};

const formatMVDisplay = (val) => {
  if (val === null || val === undefined || val === '') return '';
  if (val === 0) return '0';
  if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
  return val.toString();
};

const DiscoverPage = () => {
  const [filters, setFilters] = useState([]);
  const [season, setSeason] = useState("25-26");
  const [position, setPosition] = useState("All");
  const [minAge, setMinAge] = useState('0');
  const [maxAge, setMaxAge] = useState('');
  
  const [minMvStr, setMinMvStr] = useState('0');
  const [maxMvStr, setMaxMvStr] = useState('');
  
  const [filterMode, setFilterMode] = useState('per90');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [sortConfig, setSortConfig] = useState({ key: 'market_value', direction: 'desc' });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  
  const { addToShortlist, removeFromShortlist, isInShortlist, selectedPlayersForCompare, clearPlayerSelection, togglePlayerSelection } = useScoutStore();
  const navigate = useNavigate();

  const handleCompareAction = () => {
    if (selectedPlayersForCompare.length === 0) return;
    const playerNames = selectedPlayersForCompare.map(p => encodeURIComponent(p.player_name)).join(',');
    navigate(`/compare?match=${playerNames}`);
  };

  const handleAddMetric = (metricId) => {
    if (!filters.find(f => f.metric === metricId)) {
      setFilters([...filters, { metric: metricId, min_value: '', max_value: '' }]);
    }
  };

  const handleRemoveMetric = (metricId) => {
    setFilters(filters.filter(f => f.metric !== metricId));
  };

  const handleMetricChange = (metricId, field, value) => {
    setFilters(filters.map(f => {
      if (f.metric === metricId) {
        return { ...f, [field]: value };
      }
      return f;
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);
    
    // Temizlenmiş filtreleri hazırla
    const cleanFilters = filters.map(f => ({
      metric: f.metric,
      min_value: f.min_value !== '' ? parseFloat(f.min_value) : null,
      max_value: f.max_value !== '' ? parseFloat(f.max_value) : null,
    })).filter(f => f.min_value !== null || f.max_value !== null);

    const payload = {
      filters: cleanFilters,
      season,
      position_group: position,
      min_age: minAge !== '' ? parseFloat(minAge) : null,
      max_age: maxAge !== '' ? parseFloat(maxAge) : null,
      min_market_value: minMvStr !== '' ? parseMV(minMvStr) : null,
      max_market_value: maxMvStr !== '' ? parseMV(maxMvStr) : null,
      filter_mode: filterMode,
      limit: 500
    };

    try {
      const data = await discoverPlayers(payload);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = useMemo(() => {
    let sortableItems = [...results];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [results, sortConfig]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  const formatMV = (val) => {
    if (val === null || val === undefined) return '-';
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val}`;
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline-md text-on-surface mb-2 tracking-tight">Oyuncu Keşfet</h1>
          <p className="text-on-surface-variant text-sm">İstediğiniz istatistiksel eşikleri belirleyerek veritabanındaki oyuncuları filtreleyin.</p>
        </div>
        <div className="flex-shrink-0">
          <SeasonToggle 
            options={[
              { label: '25-26 Sezonu', value: '25-26' },
              { label: '24-25 Sezonu', value: '24-25' },
              { label: 'Tüm Sezonlar', value: 'All' }
            ]}
            selected={season} 
            onChange={setSeason} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sol Panel: Filtreler */}
        <div className="lg:col-span-1 bg-surface-container rounded-xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-6">
          
          {/* Temel Filtreler */}
          <div>
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Temel Kriterler
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Pozisyon</label>
                <select 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-surface border border-outline/30 rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                >
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Yaş Aralığı</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={minAge} onChange={e => setMinAge(e.target.value)} className="w-full bg-surface border border-outline/30 rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary" />
                  <input type="number" placeholder="Max" value={maxAge} onChange={e => setMaxAge(e.target.value)} className="w-full bg-surface border border-outline/30 rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Piyasa Değeri (€)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Min" 
                    value={minMvStr} 
                    onChange={e => setMinMvStr(e.target.value)} 
                    onBlur={() => setMinMvStr(formatMVDisplay(parseMV(minMvStr)))}
                    className="w-full bg-surface border border-outline/30 rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary" 
                  />
                  <input 
                    type="text" 
                    placeholder="Max" 
                    value={maxMvStr} 
                    onChange={e => setMaxMvStr(e.target.value)} 
                    onBlur={() => setMaxMvStr(formatMVDisplay(parseMV(maxMvStr)))}
                    className="w-full bg-surface border border-outline/30 rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary" 
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-outline-variant/30" />

          {/* İstatistiksel Metrikler */}
          <div>
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> İstatistiksel Metrikler
              </h3>
              
              <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline/20">
                <button
                  onClick={() => setFilterMode('per90')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${filterMode === 'per90' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
                >
                  Per 90
                </button>
                <button
                  onClick={() => setFilterMode('total')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${filterMode === 'total' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
                >
                  Toplam (Total)
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddMetric(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full bg-surface border border-outline/30 rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">+ Yeni Metrik Ekle</option>
                {AVAILABLE_METRICS.filter(m => !filters.find(f => f.metric === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filters.map(filter => {
                const metricDef = AVAILABLE_METRICS.find(m => m.id === filter.metric);
                return (
                  <div key={filter.metric} className="bg-surface p-3 rounded-lg border border-outline/20 relative group">
                    <button 
                      onClick={() => handleRemoveMetric(filter.metric)}
                      className="absolute top-2 right-2 text-error/70 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-xs font-bold text-on-surface mb-2">{metricDef?.label}</div>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={filter.min_value} 
                        onChange={e => handleMetricChange(filter.metric, 'min_value', e.target.value)} 
                        className="w-full bg-surface-container border border-outline/30 rounded-md px-2 py-1 text-xs text-on-surface outline-none focus:border-primary" 
                      />
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={filter.max_value} 
                        onChange={e => handleMetricChange(filter.metric, 'max_value', e.target.value)} 
                        className="w-full bg-surface-container border border-outline/30 rounded-md px-2 py-1 text-xs text-on-surface outline-none focus:border-primary" 
                      />
                    </div>
                  </div>
                );
              })}
              {filters.length === 0 && (
                <div className="text-xs text-outline italic text-center py-4 bg-surface/50 rounded-lg border border-dashed border-outline/30">
                  Henüz metrik eklenmedi. Yukarıdan seçin.
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleSearch}
            className="w-full bg-primary text-on-primary font-bold rounded-xl py-3 mt-4 hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                Sonuçları Getir
              </>
            )}
          </button>
        </div>

        {/* Sağ Panel: Sonuçlar */}
        <div className="lg:col-span-3">
          {hasSearched && (
            <div className="bg-surface-container rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
                <h2 className="font-bold text-lg text-on-surface">Arama Sonuçları</h2>
                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{results.length} Oyuncu Bulundu</span>
              </div>
              
              {results.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs uppercase tracking-wider font-semibold text-outline">
                          <th className="p-4 w-12 text-center"></th>
                          <th className="p-4 cursor-pointer hover:bg-surface-variant/50 transition-colors" onClick={() => handleSort('player_name')}>Oyuncu <SortIcon columnKey="player_name" /></th>
                          <th className="p-4 cursor-pointer hover:bg-surface-variant/50 transition-colors" onClick={() => handleSort('team')}>Takım <SortIcon columnKey="team" /></th>
                          <th className="p-4 cursor-pointer hover:bg-surface-variant/50 transition-colors" onClick={() => handleSort('position_group')}>Mevki <SortIcon columnKey="position_group" /></th>
                          <th className="p-4 cursor-pointer hover:bg-surface-variant/50 transition-colors" onClick={() => handleSort('age')}>Yaş <SortIcon columnKey="age" /></th>
                          <th className="p-4 cursor-pointer hover:bg-surface-variant/50 transition-colors" onClick={() => handleSort('market_value')}>Piyasa D. <SortIcon columnKey="market_value" /></th>
                          <th className="p-4 cursor-pointer hover:bg-surface-variant/50 transition-colors" onClick={() => handleSort('minutes_played')}>Dakika <SortIcon columnKey="minutes_played" /></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {sortedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((player, idx) => {
                          const isSaved = isInShortlist(player.player_id, player.season);
                          const isSelectedForCompare = selectedPlayersForCompare?.some(p => p.player_id === player.player_id && p.season === player.season);
                          return (
                            <tr 
                              key={idx} 
                              onClick={() => {
                                setSelectedPlayer(player);
                                setSlideOverOpen(true);
                              }}
                              className={`hover:bg-surface-variant/50 transition-colors cursor-pointer group ${isSelectedForCompare ? 'bg-primary/5' : ''}`}
                            >
                              <td className="p-4 text-center flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={isSelectedForCompare || false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    togglePlayerSelection(player);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2 cursor-pointer accent-primary"
                                  title="Select for comparison (Max 4)"
                                />
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSaved) removeFromShortlist(player.player_id, player.season);
                                    else addToShortlist(player, null);
                                  }}
                                  className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-primary bg-primary/10' : 'text-outline hover:text-on-surface hover:bg-surface-variant'}`}
                                >
                                  {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                                </button>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold font-mono text-sm border border-outline-variant/30">
                                    {player.player_name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-on-surface">{player.player_name}</div>
                                    <div className="text-[10px] font-bold text-primary">{player.season}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-on-surface-variant">{player.team}</td>
                              <td className="p-4 text-sm font-bold text-on-surface-variant">{player.position_group}</td>
                              <td className="p-4 font-data-metric-md text-on-surface">{player.age || '-'}</td>
                              <td className="p-4 font-data-metric-md text-success font-semibold">{formatMV(player.market_value)}</td>
                              <td className="p-4 font-data-metric-md text-on-surface">{player.minutes_played || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {results.length > itemsPerPage && (
                    <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
                      <span className="text-xs text-on-surface-variant font-medium">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, results.length)} of {results.length} results
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant text-sm font-medium rounded border border-outline/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button 
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(results.length / itemsPerPage), p + 1))}
                          disabled={currentPage >= Math.ceil(results.length / itemsPerPage)}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant text-sm font-medium rounded border border-outline/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                  <Activity className="w-12 h-12 text-outline-variant mb-4" />
                  <h3 className="text-lg font-bold text-on-surface mb-2">Sonuç Bulunamadı</h3>
                  <p className="text-on-surface-variant text-sm max-w-md">Bu kriterlere uygun oyuncu bulunamadı. Filtreleri esnetmeyi veya bazı metrikleri kaldırmayı deneyin.</p>
                </div>
              )}
            </div>
          )}
          
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[500px] border-2 border-dashed border-outline/20 rounded-xl">
              <Search className="w-12 h-12 text-outline-variant mb-4" />
              <h3 className="text-lg font-bold text-on-surface mb-2">Keşfetmeye Hazır</h3>
              <p className="text-on-surface-variant text-sm max-w-md">Sol taraftan aramak istediğiniz kriterleri belirleyin ve "Sonuçları Getir" butonuna tıklayın.</p>
            </div>
          )}
        </div>
      </div>

      <PlayerSlideOver 
        isOpen={slideOverOpen} 
        onClose={() => setSlideOverOpen(false)} 
        player={selectedPlayer || {}}
        targetPlayer={null}
      />

      {/* Floating Bottom Bar for Selected Players */}
      {selectedPlayersForCompare.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-surface-container-high/95 backdrop-blur-md px-6 py-3 rounded-full border border-primary/40 shadow-2xl flex items-center gap-6">
            
            <div className="text-sm font-semibold whitespace-nowrap">
              <span className="text-primary">{selectedPlayersForCompare.length}</span> / 4 Seçildi
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
                className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-full transition-colors"
                title="Tümünü Temizle"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleCompareAction}
                disabled={selectedPlayersForCompare.length < 2}
                className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Karşılaştır
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default DiscoverPage;

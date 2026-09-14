import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { ArrowLeft, Search, RefreshCw, X, Shield, Activity, Target, Download, Zap } from 'lucide-react';
import { searchPlayers, getPlayerStats } from '../api';
import PageTransition from '../components/PageTransition';
import { formatFeatureName } from '../utils/formatters';

const RadarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-high p-3 border border-outline/30 rounded-lg shadow-lg">
        <p className="font-bold text-on-surface mb-2">{label}</p>
        {payload.map((entry, index) => {
          const isPlayerA = entry.dataKey === 'playerANorm';
          const rawValue = isPlayerA ? entry.payload.playerA : entry.payload.playerB;
          return (
            <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
              <span style={{ color: entry.color }}>●</span>
              <span className="text-on-surface-variant text-xs">{entry.name}:</span>
              <span className="font-semibold text-on-surface">
                {Number(rawValue).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const DEFAULT_METRICS = [
  'accuratePassesPercentage',
  'accurateCrossesPercentage',
  'successfulDribblesPercentage',
  'tacklesWonPercentage',
  'keyPasses',
  'ballRecovery',
  'possessionWonAttThird',
  'rating'
];

const PRESETS = {
  'Full-Back Suite': ['accurateCrossesPercentage', 'keyPasses', 'tacklesWonPercentage', 'interceptions', 'ballRecovery', 'accuratePassesPercentage', 'successfulDribblesPercentage', 'rating'],
  'Creation': ['assists', 'expectedAssists', 'keyPasses', 'bigChancesCreated', 'accurateFinalThirdPasses', 'successfulDribbles', 'rating'],
  'Duels & Tackles': ['tackles', 'tacklesWonPercentage', 'groundDuelsWon', 'aerialDuelsWon', 'ballRecovery', 'interceptions'],
  'Progression': ['accurateLongBalls', 'successfulDribbles', 'accuratePassesPercentage', 'touches', 'accurateOppositionHalfPasses', 'keyPasses']
};

const ALL_FEATURES = [
  'rating', 'accurateChippedPasses', 'accurateCrosses', 'accurateCrossesPercentage', 'accurateFinalThirdPasses', 'accurateLongBalls', 'accurateLongBallsPercentage', 'accurateOppositionHalfPasses', 'accurateOwnHalfPasses', 'accuratePassesPercentage', 'aerialDuelsWon', 'aerialDuelsWonPercentage', 'aerialLost', 'assists', 'ballRecovery', 'bigChancesCreated', 'bigChancesMissed', 'blockedShots', 'clearances', 'dispossessed', 'dribbledPast', 'errorLeadToGoal', 'errorLeadToShot', 'expectedAssists', 'expectedGoals', 'fouls', 'goalConversionPercentage', 'goals', 'goalsFromOutsideTheBox', 'groundDuelsWon', 'groundDuelsWonPercentage', 'headedGoals', 'hitWoodwork', 'inaccuratePasses', 'interceptions', 'keyPasses', 'offsides', 'passToAssist', 'penaltyConceded', 'penaltyWon', 'possessionLost', 'possessionWonAttThird', 'shotFromSetPiece', 'shotsFromInsideTheBox', 'shotsFromOutsideTheBox', 'shotsOffTarget', 'shotsOnTarget', 'successfulDribbles', 'successfulDribblesPercentage', 'tackles', 'tacklesWonPercentage', 'totalDuelsWonPercentage', 'touches', 'wasFouled', 'yellowCards'
];

const SearchBar = ({ slotName, color, placeholder, onSelectPlayer }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const data = await searchPlayers(query, { season: 'All' });
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative z-50">
      <Search className="absolute left-3 top-2.5 text-on-surface-variant w-5 h-5" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
        className={`w-full h-10 pl-9 pr-9 bg-surface-container-low text-on-surface font-display text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-${color} shadow-inner border border-surface-variant/50`}
      />
      {query && (
        <button
          onClick={() => { setQuery(''); setResults([]); }}
          className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute top-11 left-0 w-full bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
          {results.map((player) => (
            <div
              key={`${player.player_id}-${player.season}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents input onBlur from firing before click registers
                onSelectPlayer(player.player_id, player.season);
                setShowDropdown(false);
                setQuery('');
              }}
              className="p-3 hover:bg-surface-variant cursor-pointer border-b border-surface-variant/30 last:border-0 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-bold text-on-surface">{player.player_name}</span>
                <span className="text-xs text-on-surface-variant">{player.team} · {player.position_group}</span>
              </div>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold">{player.season}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PlayerCard = ({ player, slotType }) => {
  const isA = slotType === 'A';
  const color = isA ? 'primary' : 'secondary';
  const colorHex = isA ? '#abc7ff' : '#b5c7ea';
  const containerClass = isA ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container';

  return (
    <div className={`col-span-1 lg:col-span-6 bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md relative overflow-visible border border-surface-variant/40`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-${color}`}></div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className={`w-2.5 h-2.5 rounded-full bg-${color} shadow-sm`}></span>
          <span className={`text-xs uppercase text-${color} font-bold tracking-wider`}>
            {isA ? 'Anchor Subject · Slot A' : 'Benchmark Subject · Slot B'}
          </span>
        </div>
        {player.data && <span className="text-xs text-on-surface-variant font-medium">ID: WND-{player.data.player_id}</span>}
      </div>

      <SearchBar
        slotName={`Slot ${slotType}`}
        color={color}
        placeholder={`Search Player ${slotType} (Name)...`}
        onSelectPlayer={player.onSelect}
      />

      {player.data ? (
        <>
          <div className="flex items-center gap-space-md pt-space-xs">
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-lg bg-surface-container-high ring-2 ring-${color}/40 shadow-sm flex items-center justify-center`}>
                <span className="text-2xl">👤</span>
              </div>
              <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded ${containerClass} font-label-caps text-[9px] font-bold`}>
                {player.data.position}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-space-xs truncate">
                <span className="font-display text-lg text-on-surface font-bold truncate">{player.data.player_name}</span>
                <Target className={`w-4 h-4 text-${color}`} title="Verified Profile" />
              </div>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 mt-0.5 text-on-surface-variant font-body-sm text-body-sm">
                <span>{player.data.team}</span>
                <span>•</span>
                <span>{player.data.age ? `${player.data.age} yrs` : 'Age N/A'}</span>
                <span>•</span>
                <span className="text-on-surface font-semibold">{player.data.minutes_played || 0} mins</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-space-xs pt-space-xs text-center">
            <div className="p-space-xs rounded-lg bg-surface-container-low border border-surface-variant/30 flex flex-col justify-center">
              <div className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">Height</div>
              <div className="text-sm text-on-surface font-bold mt-0.5">{player.data.height || '-'} cm</div>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-container-low border border-surface-variant/30 flex flex-col justify-center">
              <div className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">Foot</div>
              <div className="text-sm text-on-surface font-bold mt-0.5 capitalize">{player.data.foot || '-'}</div>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-container-low border border-surface-variant/30 flex flex-col justify-center">
              <div className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">Est. Value</div>
              <div className={`text-sm text-${color} font-bold mt-0.5`}>
                {player.data.market_value ? `€${(player.data.market_value / 1000000).toFixed(1)}M` : '-'}
              </div>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-container-low border border-surface-variant/30 flex flex-col justify-center">
              <div className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">Season</div>
              <div className="text-sm text-on-surface font-bold mt-0.5 truncate">{player.data.season}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-32 flex items-center justify-center text-on-surface-variant/50 font-body-sm border border-dashed border-surface-variant/40 rounded-lg">
          No player selected for Slot {slotType}. Use the search bar above.
        </div>
      )}
    </div>
  );
};

const HeadToHeadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [playerAData, setPlayerAData] = useState(null);
  const [playerBData, setPlayerBData] = useState(null);

  const [selectedMetrics, setSelectedMetrics] = useState(DEFAULT_METRICS);
  const [showMetricsModal, setShowMetricsModal] = useState(false);

  const fetchPlayer = async (playerId, season, slot) => {
    try {
      if (slot === 'A') setPlayerAData(null);
      else setPlayerBData(null);
      
      const data = await getPlayerStats(playerId, season);
      if (slot === 'A') setPlayerAData(data);
      else setPlayerBData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (location.state?.playerA) {
      const p = location.state.playerA;
      fetchPlayer(p.playerId, p.season, 'A');
    }
    if (location.state?.playerB) {
      const p = location.state.playerB;
      fetchPlayer(p.playerId, p.season, 'B');
    }
    
    // Clear state to avoid refetching on reload
    if (location.state?.playerA || location.state?.playerB) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSelectPlayer = (player, slot) => {
    fetchPlayer(player.player_id, player.season, slot);
  };

  const handleRemoveMetric = (metric) => {
    setSelectedMetrics(prev => prev.filter(m => m !== metric));
  };

  const handleAddMetric = (metric) => {
    if (!selectedMetrics.includes(metric)) {
      setSelectedMetrics(prev => [...prev, metric]);
    }
  };

  const radarData = useMemo(() => {
    if (!playerAData && !playerBData) return [];

    return selectedMetrics.map(metric => {
      let maxVal = 1;
      const valA = playerAData?.stats?.[metric] || 0;
      const valB = playerBData?.stats?.[metric] || 0;

      // Calculate max value for radar scaling
      maxVal = Math.max(valA, valB);
      if (maxVal === 0) maxVal = 1; // Minimum scale to avoid 0 div

      const pctA = (valA / maxVal) * 100;
      const pctB = (valB / maxVal) * 100;

      return {
        metric: formatFeatureName(metric).substring(0, 15),
        fullMetric: metric,
        playerA: valA,
        playerB: valB,
        playerANorm: pctA,
        playerBNorm: pctB,
        max: maxVal
      };
    });
  }, [playerAData, playerBData, selectedMetrics]);

  return (
    <PageTransition className="w-full flex flex-col min-h-screen bg-surface">

      <main className="w-full flex-1 px-6 lg:px-8 py-6">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6">

          <div className="flex flex-col pb-2 border-b border-surface-variant/40">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl lg:text-5xl text-on-surface font-bold tracking-tight">Head-to-Head Player Comparison</h1>
              <button
                onClick={() => { setPlayerAData(null); setPlayerBData(null); setSelectedMetrics(DEFAULT_METRICS); }}
                className="h-9 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm rounded-lg flex items-center gap-1 transition-colors border border-surface-variant/60 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden xl:inline">Reset Workspace</span>
              </button>
            </div>
            <p className="mt-4 text-sm text-on-surface-variant max-w-4xl">
              Direct bilateral comparative analytics benchmarked across tactical vectors. Calibrate dynamic multi-axis matrices, custom feature weights, and per-90 percentile distributions.
            </p>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch z-10">
            <PlayerCard
              slotType="A"
              player={{ data: playerAData, onSelect: (id, season) => fetchPlayer(id, season, 'A') }}
            />

            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shadow-xl border border-surface-variant">
                <span className="text-sm text-on-surface uppercase tracking-widest font-bold">VS</span>
              </div>
            </div>

            <PlayerCard
              slotType="B"
              player={{ data: playerBData, onSelect: (id, season) => fetchPlayer(id, season, 'B') }}
            />
          </div>

          {/* Active Metrics & Edit Button Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 z-10 relative bg-surface-container-low p-3 rounded-xl border border-surface-variant/30">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-2">
                Aktif Metrikler ({selectedMetrics.length}):
              </span>
              {selectedMetrics.map(metric => (
                <span key={metric} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-medium border border-surface-variant/50 shadow-sm transition-all hover:border-primary/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                  {formatFeatureName(metric)}
                </span>
              ))}
            </div>

            <button
              onClick={() => setShowMetricsModal(true)}
              className="shrink-0 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
            >
              <span className="hidden sm:inline">Metrikleri Düzenle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">

            {/* Left Column: Recharts Radar */}
            <div className="xl:col-span-5 bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md min-h-[580px] border border-surface-variant/40">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <Activity className="text-primary w-5 h-5" />
                  <h2 className="text-lg text-on-surface font-bold">Dynamic Metric Polygon</h2>
                </div>
                <span className="text-xs text-on-surface-variant">Multi-Axis {selectedMetrics.length}-sided Benchmarking</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Radar Overlay</h3>
                <span className="text-xs text-on-surface-variant/70">Normalized Scale</span>
              </div>

              <div className="w-full h-80 flex flex-col items-center">
                {selectedMetrics.length >= 3 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="85%" data={radarData}>
                        <PolarGrid stroke="#3f3f46" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                        {playerBData && (
                          <Radar
                            name={playerBData.player_name}
                            dataKey="playerBNorm"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        )}
                        {playerAData && (
                          <Radar
                            name={playerAData.player_name}
                            dataKey="playerANorm"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.4}
                            strokeWidth={2}
                          />
                        )}
                        <Tooltip content={<RadarTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="text-xs text-on-surface-variant/60 mt-2 text-center w-full">
                      * Radar chart is normalized for visual comparison. Hover points to see actual Per 90 values.
                    </div>
                  </>
                ) : (
                  <div className="text-on-surface-variant text-sm flex items-center justify-center h-full">Please select at least 3 metrics for polygon.</div>
                )}
              </div>
            </div>

            {/* Right Column: Comparative Bar Matrix */}
            <div className="xl:col-span-7 bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md min-h-[580px] border border-surface-variant/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs border-b border-surface-variant/30">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <Zap className="text-primary w-5 h-5" />
                    <h2 className="font-display text-lg text-on-surface font-bold">Comparative Metric Distribution</h2>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Single-axis bullet overlay with dynamic scaling</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 py-2 overflow-y-auto max-h-[480px] pr-2">
                {!playerAData && !playerBData && (
                  <div className="text-on-surface-variant py-10 text-center">Select players to view matrix</div>
                )}

                {(playerAData || playerBData) && radarData.map(data => {
                  const valA = data.playerA || 0;
                  const valB = data.playerB || 0;
                  const maxVal = Math.max(valA, valB, 1); // Avoid div by 0
                  const pctA = (valA / maxVal) * 100;
                  const pctB = (valB / maxVal) * 100;
                  const diff = valA - valB;

                  return (
                    <div key={data.fullMetric} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high/60 transition-colors border border-surface-variant/30">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                        <span className="font-semibold text-on-surface tracking-wider uppercase truncate">{formatFeatureName(data.fullMetric)}</span>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
                            <span className="text-on-surface-variant font-medium hidden sm:inline">{playerAData ? playerAData.player_name.split(' ').pop() : 'A'}:</span>
                            <span className="text-on-surface font-bold">{valA.toFixed(2)}</span>
                          </div>
                          <span className="text-on-surface-variant/40">|</span>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                            <span className="text-on-surface-variant font-medium hidden sm:inline">{playerBData ? playerBData.player_name.split(' ').pop() : 'B'}:</span>
                            <span className="text-on-surface font-bold">{valB.toFixed(2)}</span>
                          </div>
                          <span className="text-on-surface-variant/40">|</span>
                          <div className={`flex items-center font-bold px-1.5 py-0.5 rounded ${diff >= 0 ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
                            Fark: {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="relative w-full h-6 bg-surface-container-lowest rounded-md overflow-hidden flex flex-col justify-center border border-surface-variant/40">
                        {/* Player A Bar */}
                        <div
                          className="absolute left-0 top-0 h-1/2 transition-all duration-500"
                          style={{ width: `${pctA}%`, backgroundColor: '#3b82f6', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}
                        ></div>
                        {/* Player B Bar */}
                        <div
                          className="absolute left-0 bottom-0 h-1/2 transition-all duration-500"
                          style={{ width: `${pctB}%`, backgroundColor: '#10b981', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Metrics Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-high rounded-xl border border-outline/30 shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden relative">
            <div className="p-4 border-b border-outline/20 flex items-center justify-between bg-surface-container">
              <div className="flex items-center gap-4">
                <h2 className="font-bold text-lg text-on-surface">Metrikleri Düzenle</h2>
                <span className="text-xs text-on-surface-variant px-2 py-1 bg-surface rounded-md">{selectedMetrics.length} Seçili</span>
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setSelectedMetrics([])} 
                  className="text-sm font-semibold text-error hover:text-error/80 transition-colors"
                >
                  Tümünü Temizle
                </button>
                <button onClick={() => setShowMetricsModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* Quick Sets */}
              <div>
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Hızlı Şablonlar (Quick Sets)</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRESETS).map(([name, metrics]) => (
                    <button
                      key={name}
                      onClick={() => setSelectedMetrics(metrics)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-variant text-on-surface-variant hover:text-on-surface text-sm font-semibold transition-colors border border-outline/20"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Metrics Grid */}
              <div>
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Tüm Metrikler ({ALL_FEATURES.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {ALL_FEATURES.map(metric => {
                    const isSelected = selectedMetrics.includes(metric);
                    return (
                      <div
                        key={metric}
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveMetric(metric);
                          } else {
                            handleAddMetric(metric);
                          }
                        }}
                        className={`p-2 rounded-lg border text-sm cursor-pointer transition-colors flex items-center justify-between select-none ${isSelected
                          ? 'bg-primary/20 border-primary text-primary font-bold'
                          : 'bg-surface-container-lowest border-outline/20 text-on-surface hover:bg-surface-variant'
                          }`}
                      >
                        <span className="truncate" title={formatFeatureName(metric)}>{formatFeatureName(metric)}</span>
                        {isSelected && <span className="text-primary text-lg leading-none">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-outline/20 bg-surface-container flex justify-end">
              <button
                onClick={() => setShowMetricsModal(false)}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg"
              >
                Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default HeadToHeadPage;

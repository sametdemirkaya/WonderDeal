import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScoutStore } from '../store/useScoutStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { ArrowLeft, Target, Activity, MapPin, Calendar, Clock, Trophy, Bookmark, BookmarkCheck } from 'lucide-react';
import PositionStatsChart from '../components/PositionStatsChart';
import PageTransition from '../components/PageTransition';

const PlayerComparisonPage = () => {
  const { compareResults, addToShortlist, removeFromShortlist, isInShortlist } = useScoutStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract match players from URL
  const searchParams = new URLSearchParams(location.search);
  const matchParam = searchParams.get('match');
  
  const matchNames = useMemo(() => {
    if (!matchParam) return [];
    return matchParam.split(',').map(decodeURIComponent);
  }, [matchParam]);

  const targetData = compareResults;
  
  if (!targetData || matchNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-on-surface p-space-xl">
        <h2 className="text-xl font-bold text-error mb-4">No comparison data available.</h2>
        <button 
          onClick={() => navigate('/scout')}
          className="px-4 py-2 bg-surface-container-high rounded-md hover:bg-surface-variant transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Scout Page
        </button>
      </div>
    );
  }

  const matchPlayers = targetData.matches.filter(m => matchNames.includes(m.player_name));
  
  if (matchPlayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-on-surface p-space-xl">
        <h2 className="text-xl font-bold text-error mb-4">Match players not found.</h2>
        <button 
          onClick={() => navigate('/scout')}
          className="px-4 py-2 bg-surface-container-high rounded-md hover:bg-surface-variant transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Scout Page
        </button>
      </div>
    );
  }

  // Colors
  const colorTarget = "#ffffff"; // Pure White
  const matchColors = ["#00ff87", "#ff007f", "#00ffff", "#ffe600"]; // Neon Green, Hot Pink, Cyan, Bright Yellow

  return (
    <PageTransition className="flex flex-col w-full px-space-xl pb-32 text-on-surface max-w-7xl mx-auto">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/scout')}
              className="p-2 bg-surface-container hover:bg-surface-variant rounded-full transition-colors border border-outline-variant/30"
            >
              <ArrowLeft className="w-5 h-5 text-outline" />
            </button>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Detailed Comparison</h1>
          </div>
          <p className="text-on-surface-variant font-body-sm ml-12">
            Side-by-side analysis of DNA components and stylistic similarities for up to 4 matches.
          </p>
        </div>
      </section>

      {/* Main Comparison Area - Top Section */}
      <div className="flex flex-col gap-space-lg">
        
        {/* Target Player Compact Header */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between bg-surface-container-low border border-primary/40 rounded-2xl px-6 py-4 shadow-sm relative overflow-hidden gap-4">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-container-high rounded-full border-2 border-primary flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-headline-md leading-none flex items-center gap-2">
                {targetData.target_player_name} 
                <span className="text-xs font-bold bg-primary text-on-primary px-1.5 py-0.5 rounded uppercase">{targetData.target_season}</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm border-t md:border-t-0 border-outline-variant/20 pt-3 md:pt-0 w-full md:w-auto">
            <div className="flex flex-col"><span className="text-on-surface-variant text-xs flex items-center gap-1"><MapPin className="w-3 h-3"/> Nationality</span><span className="font-semibold uppercase">{targetData.target_nationality}</span></div>
            <div className="flex flex-col"><span className="text-on-surface-variant text-xs flex items-center gap-1"><Trophy className="w-3 h-3"/> Team</span><span className="font-semibold">{targetData.target_team}</span></div>
            <div className="flex flex-col"><span className="text-on-surface-variant text-xs flex items-center gap-1"><Calendar className="w-3 h-3"/> Age</span><span className="font-semibold">{targetData.target_age}</span></div>
            <div className="flex flex-col"><span className="text-on-surface-variant text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> Minutes</span><span className="font-semibold">{targetData.target_minutes_played}</span></div>
          </div>
        </div>

        {/* Diverging Bar Chart */}
        <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-space-lg shadow-sm flex flex-col justify-center">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-tertiary" /> Position Specific Stats (Per 90)</h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Radar chart displays key positional metrics normalized for visual comparison. Hover points to see absolute raw values.
          </p>
          
          <PositionStatsChart 
            targetStats={targetData.target_raw_stats} 
            targetName={targetData.target_player_name}
            matchPlayers={matchPlayers} 
            colors={matchColors}
          />
        </div>
      </div>

      {/* Match Players Cards */}
      <h3 className="text-xl font-bold font-headline-md mt-2">Compared Matches</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {matchPlayers.map((matchPlayer, idx) => {
            const color = matchColors[idx % matchColors.length];
            const isSaved = isInShortlist(matchPlayer.player_id, matchPlayer.season);
            return (
              <div key={idx} className="bg-surface-container-low border-2 rounded-2xl p-space-lg shadow-lg relative overflow-hidden flex flex-col items-center transition-all hover:shadow-xl hover:-translate-y-1" style={{ borderColor: `${color}66` }}>
                <div className="absolute top-0 w-full h-2" style={{ backgroundColor: color }}></div>
                
                {/* Bookmark Button */}
                <button 
                  onClick={() => {
                    if (isSaved) {
                      removeFromShortlist(matchPlayer.player_id, matchPlayer.season);
                    } else {
                      const targetObj = {
                        player_id: targetData.target_player_id,
                        player_name: targetData.target_player_name,
                        season: targetData.target_season
                      };
                      addToShortlist(matchPlayer, targetObj);
                    }
                  }}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 shadow-sm ${isSaved ? 'bg-primary text-on-primary scale-110 shadow-primary/40' : 'bg-surface-container-high text-outline hover:text-on-surface hover:bg-surface-variant hover:scale-110'}`}
                  title={isSaved ? "Remove from Shortlist" : "Add to Shortlist"}
                >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>

              <div className="w-20 h-20 bg-surface-container-high rounded-full border-4 flex items-center justify-center mb-4 mt-2" style={{ borderColor: color }}>
                <Activity className="w-8 h-8" style={{ color: color }} />
              </div>
              <h2 className="text-xl font-bold font-headline-md text-center flex flex-col items-center gap-1">
                {matchPlayer.player_name}
                <span className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded uppercase">{matchPlayer.season}</span>
              </h2>
              <span className="font-label-caps text-xs tracking-widest uppercase mb-4 mt-2 px-3 py-1 rounded-full bg-surface-container-high" style={{ color: color }}>
                Similarity: {matchPlayer.cosine_similarity}%
              </span>
              
              <div className="w-full space-y-3 font-body-sm mb-4">
                <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                  <span className="text-on-surface-variant flex items-center gap-2"><MapPin className="w-4 h-4"/> Nat</span>
                  <span className="font-semibold text-right uppercase">{matchPlayer.nationality}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                  <span className="text-on-surface-variant flex items-center gap-2"><Trophy className="w-4 h-4"/> Team</span>
                  <span className="font-semibold text-right max-w-[100px] truncate" title={matchPlayer.team}>{matchPlayer.team}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                  <span className="text-on-surface-variant flex items-center gap-2"><Calendar className="w-4 h-4"/> Age</span>
                  <span className="font-semibold text-right">{matchPlayer.age}</span>
                </div>
              </div>

              <div className="bg-surface-container-high p-3 rounded-lg text-center border w-full mt-auto" style={{ borderColor: `${color}40` }}>
                <div className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-label-caps">Vol Diff (Euc)</div>
                <div className="text-lg font-bold font-data-metric-lg" style={{ color: color }}>{matchPlayer.euclidean_distance}</div>
              </div>
            </div>
          );
        })}
      </div>

    </PageTransition>
  );
};

export default PlayerComparisonPage;

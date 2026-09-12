import React from 'react';
import { useScoutStore } from '../store/useScoutStore';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { getSimilarityColor, getDistanceColor } from '../utils/colorUtils';

const ResultsTable = ({ results, onRowClick, sortConfig, requestSort }) => {
  const { targetPlayer, addToShortlist, removeFromShortlist, isInShortlist } = useScoutStore();

  if (!results || results.length === 0) return null;

  const getHeaderClass = (key) => {
    const isActive = sortConfig?.key === key;
    return `p-4 font-outfit cursor-pointer hover:text-on-surface transition-colors select-none ${isActive ? 'text-on-surface font-bold' : 'text-outline'}`;
  };

  return (
    <div className="w-full overflow-x-auto bg-surface border border-outline-variant/30 rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs uppercase tracking-wider font-semibold">
            <th className="p-4 w-12 text-center text-outline"></th>
            <th className="p-4 font-outfit w-8 text-outline"></th>
            <th className={getHeaderClass('player_name')} onClick={() => requestSort('player_name')}>Player</th>
            <th className={getHeaderClass('team')} onClick={() => requestSort('team')}>Team</th>
            <th className={getHeaderClass('age')} onClick={() => requestSort('age')}>Age</th>
            <th className={getHeaderClass('minutes_played')} onClick={() => requestSort('minutes_played')}>Min</th>
            <th className={`${getHeaderClass('cosine_similarity')} w-1/3`} onClick={() => requestSort('cosine_similarity')}>DNA Similarity</th>
            <th className={`${getHeaderClass('euclidean_distance')} text-right`} onClick={() => requestSort('euclidean_distance')}>Vol Diff</th>
          </tr>
        </thead>
        <tbody key={`${results.length}-${results[0]?.player_name || ''}`} className="divide-y divide-outline-variant/20 animate-slide-up-fade">
          {results.map((player, idx) => {
            const isSaved = isInShortlist(player.player_id, player.season);
            const isSelectedForCompare = useScoutStore.getState().selectedPlayersForCompare?.some(p => p.player_id === player.player_id && p.season === player.season);
            const simColor = getSimilarityColor(player.cosine_similarity);
            const distColor = getDistanceColor(player.euclidean_distance);
            
            return (
              <tr 
                key={idx} 
                onClick={() => onRowClick(player)}
                className={`hover:bg-surface-variant/50 transition-colors cursor-pointer group ${isSelectedForCompare ? 'bg-primary/5' : ''}`}
              >
                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={isSelectedForCompare || false}
                    onChange={() => useScoutStore.getState().togglePlayerSelection(player)}
                    className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2 cursor-pointer accent-primary"
                    title="Select for comparison (Max 4)"
                  />
                </td>
                <td className="p-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSaved) {
                        removeFromShortlist(player.player_id, player.season);
                      } else {
                        addToShortlist(player, targetPlayer || null);
                      }
                    }}
                    className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-primary bg-primary/10' : 'text-outline hover:text-on-surface hover:bg-surface-variant'}`}
                    title={isSaved ? "Remove from Shortlist" : "Add to Shortlist"}
                  >
                    {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold font-mono text-sm border border-outline-variant/30 group-hover:border-primary/50 transition-colors">
                      {player.player_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-on-surface">{player.player_name}</p>
                        <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase">{player.season}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{player.nationality}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-on-surface-variant">{player.team}</td>
                <td className="p-4 font-data-metric-md text-on-surface">{player.age}</td>
                <td className="p-4 font-data-metric-md text-on-surface">{player.minutes_played}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${simColor.bg}`} 
                        style={{ width: `${Math.max(0, Math.min(100, player.cosine_similarity))}%` }} 
                      />
                    </div>
                    <span className={`font-data-metric-md font-bold w-12 text-right ${simColor.text}`}>
                      {player.cosine_similarity}%
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className={`inline-block px-2.5 py-1 rounded font-data-metric-md text-sm border ${distColor.badge}`}>
                    {player.euclidean_distance}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;

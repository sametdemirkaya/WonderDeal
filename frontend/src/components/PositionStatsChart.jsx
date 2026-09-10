import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip
} from 'recharts';

const statLabels = {
  goals: "Goals",
  assists: "Assists",
  expectedGoals: "xG",
  shotsOnTarget: "Shots on Target",
  bigChancesCreated: "Big Chances",
  successfulDribbles: "Succ. Dribbles",
  touches: "Touches",
  accuratePassesPercentage: "Pass Acc. %",
  keyPasses: "Key Passes",
  ballRecovery: "Ball Recovery",
  tackles: "Tackles",
  interceptions: "Interceptions",
  clearances: "Clearances",
  aerialDuelsWonPercentage: "Aerial Won %",
  groundDuelsWonPercentage: "Ground Won %"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-3 border border-outline/50 rounded-lg shadow-lg">
        <p className="font-bold text-on-surface mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span style={{ color: entry.color }}>●</span>
            <span className="text-outline">{entry.name}:</span>
            <span className="font-semibold text-on-surface">
              {entry.payload[`${entry.name}_raw`]}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PositionStatsChart = ({ targetStats, targetName, matchPlayers = [], colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }) => {
  if (!targetStats) return null;

  const data = Object.keys(targetStats).map(key => {
    const tVal = targetStats[key] || 0;
    
    // Find the absolute maximum across target and all match players for normalization
    let maxVal = tVal;
    matchPlayers.forEach(mp => {
      const mVal = mp.raw_stats?.[key] || 0;
      if (mVal > maxVal) maxVal = mVal;
    });
    
    const divisor = maxVal > 0 ? maxVal : 1;

    const dataPoint = {
      stat: statLabels[key] || key,
      [targetName]: (tVal / divisor) * 100,
      [`${targetName}_raw`]: tVal,
    };

    matchPlayers.forEach(mp => {
      const mVal = mp.raw_stats?.[key] || 0;
      dataPoint[mp.player_name] = (mVal / divisor) * 100;
      dataPoint[`${mp.player_name}_raw`] = mVal;
    });

    return dataPoint;
  });

  return (
    <div className="w-full h-80 flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis 
            dataKey="stat" 
            tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          
          <Radar 
            name={targetName} 
            dataKey={targetName} 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.4} 
            strokeWidth={2}
          />
          {matchPlayers.map((mp, idx) => (
            <Radar 
              key={mp.player_name}
              name={mp.player_name} 
              dataKey={mp.player_name} 
              stroke={colors[idx % colors.length]} 
              fill={colors[idx % colors.length]} 
              fillOpacity={0.2} 
              strokeWidth={2}
            />
          ))}
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="text-xs text-outline/60 mt-2 text-center w-full">
        * Radar chart is normalized for visual comparison. Hover points to see actual Per 90 values.
      </div>
    </div>
  );
};

export default PositionStatsChart;

import React from 'react';

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

const defaultMaxValues = {
  goals: 1.0, assists: 0.5, expectedGoals: 1.0, shotsOnTarget: 2.0,
  bigChancesCreated: 1.0, successfulDribbles: 3.0, touches: 100,
  accuratePassesPercentage: 100, keyPasses: 2.0, ballRecovery: 10.0,
  tackles: 4.0, interceptions: 3.0, clearances: 6.0,
  aerialDuelsWonPercentage: 100, groundDuelsWonPercentage: 100
};

const KeyStatsBars = ({ rawStats = {}, positionGroup = "FW" }) => {
  // Select top 4-5 relevant stats based on position
  let relevantKeys = [];
  if (positionGroup.includes('FW')) {
    relevantKeys = ['goals', 'expectedGoals', 'shotsOnTarget', 'successfulDribbles'];
  } else if (positionGroup.includes('MF')) {
    relevantKeys = ['assists', 'keyPasses', 'accuratePassesPercentage', 'ballRecovery'];
  } else if (positionGroup.includes('DF')) {
    relevantKeys = ['tackles', 'interceptions', 'clearances', 'aerialDuelsWonPercentage'];
  } else {
    relevantKeys = ['goals', 'assists', 'accuratePassesPercentage', 'ballRecovery'];
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {relevantKeys.map(key => {
        const val = rawStats[key] || 0;
        const max = defaultMaxValues[key] || Math.max(val * 1.5, 1);
        const percentage = Math.min((val / max) * 100, 100);
        
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between items-end text-xs">
              <span className="font-semibold text-on-surface-variant">{statLabels[key] || key}</span>
              <span className="font-bold text-on-surface">{val.toFixed(2)} <span className="text-outline text-[10px] font-normal">/ 90</span></span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KeyStatsBars;

import React from 'react';

const PremiumSlider = ({ label, value, min, max, step = 1, unit = "", onChange, valueColor = "text-primary-blue", highlightColor = "bg-primary-blue" }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-text-muted">{label}</label>
        <span className={`font-data-metric-md font-bold text-sm ${valueColor}`}>
          {value}{unit}
        </span>
      </div>
      
      <div className="relative h-2 w-full bg-surface-card rounded-full overflow-hidden border border-border-subtle shadow-inner">
        {/* Fill */}
        <div 
          className={`absolute top-0 left-0 h-full ${highlightColor} transition-all duration-300 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
        {/* Invisible Input for Interaction */}
        <input 
          type="range" 
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PremiumSlider;

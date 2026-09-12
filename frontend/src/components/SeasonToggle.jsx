import React from 'react';

const SeasonToggle = ({ options, selected, onChange }) => {
  return (
    <div className="flex p-1 bg-surface-container/60 backdrop-blur-md rounded-full border border-outline-variant/30 w-fit">
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300
              ${isSelected ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}
            `}
          >
            {isSelected && (
              <span className="absolute inset-0 bg-primary-blue rounded-full shadow-lg -z-10" />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SeasonToggle;

export const getSimilarityColor = (val) => {
  if (val >= 85) return { text: 'text-emerald-400', bg: 'bg-emerald-500', bgSoft: 'bg-emerald-500/20' };
  if (val >= 70) return { text: 'text-yellow-400', bg: 'bg-yellow-500', bgSoft: 'bg-yellow-500/20' };
  return { text: 'text-red-500', bg: 'bg-red-500', bgSoft: 'bg-red-500/20' };
};

export const getDistanceColor = (val) => {
  if (val < 5) return { text: 'text-cyan-400', bg: 'bg-cyan-500', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20' };
  if (val <= 7.5) return { text: 'text-emerald-400', bg: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' };
  if (val <= 10) return { text: 'text-yellow-400', bg: 'bg-yellow-500', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' };
  return { text: 'text-red-500', bg: 'bg-red-500', badge: 'bg-red-500/20 text-red-500 border-red-500/20' };
};

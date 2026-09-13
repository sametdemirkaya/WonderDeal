/**
 * Formats camelCase or variable names into human-readable strings.
 * e.g., 'accuratePassesPercentage' -> 'Accurate Passes %'
 */
export const formatFeatureName = (name) => {
    if (!name) return '';
    // Insert a space before all caps
    let formatted = name.replace(/([A-Z])/g, ' $1');
    // Capitalize the first letter
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    // Replace specific terms
    formatted = formatted.replace(/Percentage/g, '%');
    return formatted.trim();
};

/**
 * ATS Score Caching Utility
 * Provides functions to cache and retrieve ATS scores based on resume content
 */

// Generate a hash for the resume content
const generateResumeHash = (resumeContent) => {
  let hash = 0;
  if (resumeContent.length === 0) return hash;
  
  for (let i = 0; i < resumeContent.length; i++) {
    const char = resumeContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
};

// Cache key for localStorage
const ATS_CACHE_KEY = 'ats_scores_cache';

/**
 * Get cached ATS score for a resume
 * @param {string} resumeContent - The resume content to check
 * @returns {Object|null} Cached score data or null if not found
 */
export const getCachedATSScore = (resumeContent) => {
  try {
    const hash = generateResumeHash(resumeContent);
    const cache = JSON.parse(localStorage.getItem(ATS_CACHE_KEY) || '{}');
    return cache[hash] || null;
  } catch (error) {
    console.error('Error getting cached ATS score:', error);
    return null;
  }
};

/**
 * Save ATS score to cache
 * @param {string} resumeContent - The resume content
 * @param {Object} scoreData - The score data to cache
 */
export const cacheATSScore = (resumeContent, scoreData) => {
  try {
    const hash = generateResumeHash(resumeContent);
    const cache = JSON.parse(localStorage.getItem(ATS_CACHE_KEY) || '{}');
    cache[hash] = {
      ...scoreData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(ATS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching ATS score:', error);
  }
};

/**
 * Clear expired cache entries (older than 24 hours)
 */
export const clearExpiredCache = () => {
  try {
    const cache = JSON.parse(localStorage.getItem(ATS_CACHE_KEY) || '{}');
    const now = new Date();
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    
    Object.entries(cache).forEach(([hash, data]) => {
      const timestamp = new Date(data.timestamp);
      if (now - timestamp > DAY_IN_MS) {
        delete cache[hash];
      }
    });
    
    localStorage.setItem(ATS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
}; 
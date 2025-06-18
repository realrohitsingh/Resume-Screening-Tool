// API service for backend communication

// Base URL for API calls
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Sign up a new user
 * @param {Object} userData - User signup data
 * @returns {Promise} - Promise with user data
 */
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sign up');
    }

    return response.json();
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Log in a user
 * @param {Object} credentials - Login credentials
 * @returns {Promise} - Promise with user data
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to log in');
    }

    return response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise} - Promise with auth status
 */
export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check`);
    return response.ok;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
};

/**
 * Check if the job API is available
 * @returns {Promise<boolean>} - Promise that resolves to true if API is available
 */
export const checkJobApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Error checking API health:', error);
    return false;
  }
};

/**
 * Upload a resume file and get job recommendations
 * @param {File} file - The resume file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise with job recommendations, ATS scores, and extracted data
 */
export const uploadResumeForRecommendations = async (file, userId) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    if (userId) {
      formData.append('userId', userId);
    }
    
    const response = await fetch(`${API_BASE_URL}/job-recommendation`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get job recommendations');
    }
    
    const result = await response.json();
    
    // Validate the response structure
    if (!result.status || result.status !== 'success') {
      throw new Error(result.error || 'Invalid response from server');
    }
    
    // Ensure we have the required data
    if (!result.recommendations || !Array.isArray(result.recommendations)) {
      throw new Error('No job recommendations received');
    }
    
    // Transform recommendations if needed
    result.recommendations = result.recommendations.map(job => ({
      ...job,
      match_score: job.match_score || 0,
      ats_score: job.ats_score || 70,
      matching_skills: job.matching_skills || []
    }));
    
    return result;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Save ATS score for a resume
 * @param {string} userId - The user's ID
 * @param {string} resumeId - The resume ID
 * @param {number} score - The ATS score
 * @param {Array} feedback - Array of feedback items
 * @returns {Promise} - Promise with save status
 */
export const saveATSScore = async (userId, resumeId, score, feedback) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ats-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        resumeId,
        score,
        feedback,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save ATS score');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error saving ATS score:', error);
    throw error;
  }
};

/**
 * Get ATS scores for a user
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise with user's ATS scores
 */
export const getATSScores = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ats-scores/${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get ATS scores');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error getting ATS scores:', error);
    throw error;
  }
};

// Export other API functions as needed

export const fetchResumeTemplates = async () => {
    try {
        // Placeholder API (simulate fetching resume templates)
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        if (!response.ok) {
            throw new Error("Failed to fetch resume templates");
        }
        const data = await response.json();

        // Return mock resume templates
        return data.slice(0, 10).map((item) => ({
            name: `Template ${item.id}`,
            description: item.title,
        }));
    } catch (error) {
        console.error("Error fetching resume templates:", error);
        return [];
    }
};

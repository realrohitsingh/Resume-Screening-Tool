// API service for backend communication

// Base URL for API calls
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Upload a resume file and get job recommendations
 * @param {File} file - The resume file to upload
 * @returns {Promise} - Promise with job recommendations
 */
export const uploadResumeForRecommendations = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_BASE_URL}/job-recommendation`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get job recommendations');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Check if the job recommendation API is available
 * @returns {Promise<boolean>} - Promise that resolves to true if API is available
 */
export const checkJobApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking API health:', error);
    return false;
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

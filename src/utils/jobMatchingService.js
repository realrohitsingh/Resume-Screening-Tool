/**
 * Job Matching Service - Provides functions to match jobs to user profiles and preferences
 */

/**
 * Score a job based on how well it matches the user's preferences
 * @param {Object} job - The job to score
 * @param {Object} userPreferences - The user's preferences
 * @returns {number} A score from 0 to 100
 */
export const scoreJobMatch = (job, userPreferences) => {
  let score = 0;
  const { jobPreference, experienceLevel, workStyle, personalValues = "", careerGoals = "" } = userPreferences;
  
  // Score industry match (highest weighted factor)
  if (job.position.toLowerCase().includes(jobPreference?.toLowerCase()) || 
      job.description.toLowerCase().includes(jobPreference?.toLowerCase())) {
    score += 40;
  } else {
    // Check for related industry keywords
    const industryKeywords = getIndustryKeywords(jobPreference);
    for (const keyword of industryKeywords) {
      if (job.position.toLowerCase().includes(keyword) || 
          job.description.toLowerCase().includes(keyword)) {
        score += 25; // Partial match
        break;
      }
    }
  }
  
  // Score experience level match
  if (job.experienceLevel === experienceLevel) {
    score += 30;
  } else {
    // Give partial points for adjacent experience levels
    const levels = ["Entry Level", "Mid-Level", "Senior", "Executive"];
    const jobIndex = levels.indexOf(job.experienceLevel);
    const userIndex = levels.indexOf(experienceLevel);
    
    if (jobIndex !== -1 && userIndex !== -1) {
      const distance = Math.abs(jobIndex - userIndex);
      if (distance === 1) {
        // One level away (e.g., Entry vs Mid)
        score += 15;
      }
    }
  }
  
  // Score remote work match
  if (workStyle === "Remote" && job.remote) {
    score += 20;
  } else if (workStyle === "Hybrid" && job.remote) {
    score += 10;
  } else if (workStyle === "On-Site" && !job.remote) {
    score += 15;
  }
  
  // Score based on personal values and career goals
  if (personalValues) {
    const valueKeywords = personalValues.toLowerCase().split(/[,\s]+/);
    for (const keyword of valueKeywords) {
      if (keyword.length > 3 && job.description.toLowerCase().includes(keyword)) {
        score += 5; // Up to ~15 points max for values
        if (score > 100) break;
      }
    }
  }
  
  if (careerGoals) {
    const goalKeywords = careerGoals.toLowerCase().split(/[,\s]+/);
    for (const keyword of goalKeywords) {
      if (keyword.length > 3 && job.description.toLowerCase().includes(keyword)) {
        score += 3; // Up to ~10 points max for goals
        if (score > 100) break;
      }
    }
  }
  
  // Cap the score at 100
  return Math.min(score, 100);
};

/**
 * Get all jobs that match the user's preferences, sorted by match score
 * @param {Array} jobs - The jobs to match against (optional, will use localStorage if not provided)
 * @param {Object} userPreferences - The user's preferences
 * @param {Array} userSkills - The skills extracted from the user's resume
 * @returns {Array} Sorted array of jobs with match scores
 */
export const getMatchingJobs = (jobs, userPreferences, userSkills = []) => {
  // Handle different parameter orders for backward compatibility
  let allJobs = [];
  let preferences = userPreferences;
  let skills = userSkills;
  
  // If first param is an object (userPreferences) and not an array
  if (!Array.isArray(jobs) && typeof jobs === 'object') {
    preferences = jobs;
    skills = userPreferences || [];
    
    // Get all jobs from localStorage
    const storedJobs = localStorage.getItem("hrJobs");
    allJobs = storedJobs ? JSON.parse(storedJobs) : [];
  } else {
    // Use the jobs passed in
    allJobs = jobs || [];
    
    // If no jobs passed, try to get from localStorage
    if (allJobs.length === 0) {
      const storedJobs = localStorage.getItem("hrJobs");
      allJobs = storedJobs ? JSON.parse(storedJobs) : [];
    }
  }
  
  if (allJobs.length === 0) {
    return [];
  }
  
  // Score each job based on user preferences
  const scoredJobs = allJobs.map(job => {
    const baseScore = scoreJobMatch(job, preferences);
    
    // Add bonus points for skill matches
    let skillMatchScore = 0;
    if (skills.length > 0) {
      const jobSkills = extractJobSkills(job);
      const matchingSkills = skills.filter(skill => 
        jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
      );
      
      // Award points for skill matches (up to 15 additional points)
      skillMatchScore = Math.min(15, matchingSkills.length * 5);
    }
    
    // Calculate final score
    const finalScore = Math.min(100, baseScore + skillMatchScore);
    
    return {
      ...job,
      matchScore: finalScore,
      isRecommended: finalScore >= 70 // Consider it a strong match if score >= 70
    };
  });
  
  // Sort jobs by match score (highest first)
  return scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Get relevant keywords for a given industry
 * @param {string} industry - The industry to get keywords for
 * @returns {Array} Array of related keywords
 */
const getIndustryKeywords = (industry) => {
  const keywords = {
    "Software Development": ["developer", "software", "engineer", "programming", "web", "app", "frontend", "backend", "fullstack", "devops", "coding"],
    "Data Science": ["data", "analytics", "analyst", "scientist", "machine learning", "artificial intelligence", "statistics", "modeling", "visualization", "ml", "ai"],
    "Marketing": ["marketing", "digital", "seo", "content", "social media", "advertising", "brand", "campaign", "market research", "growth"],
    "Finance": ["finance", "accounting", "financial", "analyst", "banking", "investment", "budget", "tax", "audit", "controller"],
    "Healthcare": ["health", "medical", "clinical", "patient", "healthcare", "nurse", "doctor", "therapy", "pharmaceutical", "wellness"],
    "Education": ["education", "teaching", "teacher", "instructor", "curriculum", "student", "learning", "school", "tutor", "professor"],
    "E-commerce": ["e-commerce", "ecommerce", "retail", "online", "marketplace", "shop", "sales", "product", "customer", "merchant"],
    "Consulting": ["consulting", "consultant", "advisor", "strategy", "business", "management", "solution", "client", "project", "engagement"],
    "Manufacturing": ["manufacturing", "production", "operations", "quality", "assembly", "engineer", "supply chain", "logistics", "process", "industrial"]
  };
  
  return keywords[industry] || [];
};

/**
 * Extract likely skills from a job description
 * @param {Object} job - The job to extract skills from
 * @returns {Array} Array of skill keywords
 */
const extractJobSkills = (job) => {
  // Common technical skills
  const techSkills = ["javascript", "python", "java", "c++", "ruby", "php", "sql", "nosql", 
                     "react", "angular", "vue", "node", "express", "django", "flask", 
                     "aws", "azure", "gcp", "cloud", "docker", "kubernetes", "devops",
                     "machine learning", "data science", "artificial intelligence", "ai", "ml"];
  
  // Common soft skills
  const softSkills = ["communication", "teamwork", "leadership", "project management", 
                     "problem solving", "critical thinking", "time management", "creativity",
                     "organization", "adaptability", "analytical", "detail-oriented"];
  
  // Combine job description and requirements
  const fullText = `${job.position} ${job.description} ${job.requirements}`.toLowerCase();
  
  // Find matches from both skill lists
  const matches = [...techSkills, ...softSkills].filter(skill => 
    fullText.includes(skill)
  );
  
  return matches;
};

/**
 * Generate personalized strengths (pros) for a user based on their profile and skills
 * @param {Object} userPreferences - The user's preferences
 * @param {Array} userSkills - Skills extracted from the user's resume
 * @returns {Array} Array of strength statements
 */
export const generateUserStrengths = (userPreferences, userSkills = []) => {
  const { jobPreference, experienceLevel, workStyle } = userPreferences;
  const strengths = [];

  // Add strengths based on industry preference
  if (jobPreference === "Software Development") {
    strengths.push("Strong technical aptitude for software development");
    if (userSkills.some(skill => ["javascript", "python", "java", "c++", "react", "angular"].includes(skill))) {
      strengths.push("Proficient in in-demand programming languages");
    }
  } else if (jobPreference === "Data Science") {
    strengths.push("Strong analytical and data interpretation skills");
  } else if (jobPreference === "Marketing") {
    strengths.push("Creative approach to marketing challenges");
  } else if (jobPreference === "Finance") {
    strengths.push("Strong numerical and analytical abilities");
  } else {
    strengths.push("Valuable skill set for your chosen field");
  }

  // Add strengths based on experience level
  if (experienceLevel === "Entry Level") {
    strengths.push("Fresh perspective and eagerness to learn");
  } else if (experienceLevel === "Mid-Level") {
    strengths.push("Balanced combination of skills and practical experience");
  } else if (experienceLevel === "Senior") {
    strengths.push("Extensive expertise and leadership potential");
  } else if (experienceLevel === "Executive") {
    strengths.push("High-level strategic thinking capabilities");
  }

  // Add strengths based on work style
  if (workStyle === "Remote") {
    strengths.push("Self-motivated with strong remote work capabilities");
  } else if (workStyle === "Hybrid") {
    strengths.push("Adaptable to both office and remote environments");
  } else if (workStyle === "On-Site") {
    strengths.push("Strong in-person collaboration skills");
  }

  // Add strengths based on skills
  if (userSkills.some(skill => ["communication", "teamwork", "leadership"].includes(skill))) {
    strengths.push("Excellent interpersonal and communication skills");
  }
  
  if (userSkills.some(skill => ["problem solving", "critical thinking", "analytical"].includes(skill))) {
    strengths.push("Strong problem-solving and analytical abilities");
  }

  // If we don't have enough strengths, add some generic ones
  const genericStrengths = [
    "Adaptable to changing requirements and environments",
    "Capable of handling multiple responsibilities efficiently",
    "Committed to continuous learning and improvement",
    "Solid foundation for career growth and development"
  ];

  while (strengths.length < 4) {
    const randomIndex = Math.floor(Math.random() * genericStrengths.length);
    const strength = genericStrengths[randomIndex];
    if (!strengths.includes(strength)) {
      strengths.push(strength);
    }
  }

  return strengths.slice(0, 5); // Return up to 5 strengths
};

/**
 * Generate areas for improvement (cons) for a user based on their profile
 * @param {Object} userPreferences - The user's preferences
 * @param {Array} matchingJobs - Jobs that match the user's profile
 * @returns {Array} Array of improvement areas
 */
export const generateImprovementAreas = (userPreferences, matchingJobs = []) => {
  const { experienceLevel } = userPreferences;
  const improvements = [];

  // Add improvements based on experience level
  if (experienceLevel === "Entry Level") {
    improvements.push("Limited professional experience");
    improvements.push("May require additional training and mentorship");
  } else if (experienceLevel === "Mid-Level") {
    improvements.push("May need to develop stronger leadership skills");
    improvements.push("Could benefit from more specialized expertise");
  } else if (experienceLevel === "Senior") {
    improvements.push("May face higher competition for leadership positions");
    improvements.push("Need to demonstrate innovation and strategic thinking");
  } else if (experienceLevel === "Executive") {
    improvements.push("Must excel in high-pressure decision-making roles");
    improvements.push("Expected to deliver significant organization-wide impact");
  }

  // Analyze skill gaps based on matching jobs
  if (matchingJobs.length > 0) {
    const topJobSkills = new Set();
    // Extract skills from top 3 matching jobs
    matchingJobs.slice(0, 3).forEach(job => {
      extractJobSkills(job).forEach(skill => topJobSkills.add(skill));
    });
    
    if (topJobSkills.size > 0) {
      improvements.push(`Consider developing skills in: ${Array.from(topJobSkills).slice(0, 3).join(', ')}`);
    }
  }

  // Generic improvement suggestions
  const genericImprovements = [
    "Could benefit from expanding professional network",
    "May need to demonstrate more quantifiable achievements",
    "Consider pursuing additional certifications or education",
    "Focus on developing a stronger personal brand"
  ];

  while (improvements.length < 3) {
    const randomIndex = Math.floor(Math.random() * genericImprovements.length);
    const improvement = genericImprovements[randomIndex];
    if (!improvements.includes(improvement)) {
      improvements.push(improvement);
    }
  }

  return improvements.slice(0, 3); // Return up to 3 areas for improvement
}; 
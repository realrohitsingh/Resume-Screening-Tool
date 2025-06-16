/**
 * ATS Scoring Utility
 * Provides functions to analyze resumes and calculate ATS compatibility scores
 */

// Common keywords by industry
const industryKeywords = {
  "Software Development": [
    "JavaScript", "React", "Angular", "Vue", "Node.js", "Express", "Python", 
    "Java", "C#", ".NET", "REST API", "GraphQL", "AWS", "Azure", "CI/CD",
    "Docker", "Kubernetes", "Microservices", "Agile", "DevOps", "Git", "GitHub"
  ],
  "Data Science": [
    "Python", "R", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", 
    "Pandas", "NumPy", "SQL", "Data Visualization", "Tableau", "Power BI", 
    "Statistics", "Big Data", "Hadoop", "Spark", "NLP", "Computer Vision"
  ],
  "Marketing": [
    "Digital Marketing", "SEO", "Content Marketing", "Social Media", "Google Analytics", 
    "Campaign Management", "A/B Testing", "Marketing Automation", "CRM", "HubSpot", 
    "Email Marketing", "Brand Management", "Market Research", "Growth Hacking"
  ],
  "Finance": [
    "Financial Analysis", "Accounting", "Budgeting", "Forecasting", "Excel", 
    "Financial Modeling", "QuickBooks", "Risk Management", "Taxation", "Audit", 
    "Investment", "Portfolio Management", "CPA", "SAP", "Bloomberg"
  ],
  "Healthcare": [
    "Electronic Health Records", "EHR", "Patient Care", "Clinical", "Medical Coding", 
    "Healthcare Compliance", "HIPAA", "Medical Terminology", "Billing", "ICD-10", 
    "Telehealth", "Care Coordination", "Epic", "Cerner", "HL7"
  ]
};

// Common words to exclude when analyzing job descriptions
const commonWords = [
  "the", "and", "for", "with", "that", "this", "our", "your", "their", "have", 
  "will", "from", "about", "been", "must", "should", "would", "could", "they", 
  "them", "what", "when", "where", "which", "were", "there", "into", "also", 
  "than", "then", "being", "does", "more", "most", "such", "only", "some", 
  "very", "like", "just", "much", "many", "over", "well", "years", "year", 
  "month", "day", "time", "team", "work", "working", "position", "role", "job", 
  "candidate", "candidates", "applicant", "applicants", "company", "ability", 
  "experience", "skills", "required", "responsibilities", "qualifications"
];

// Standard resume sections
const standardSections = [
  ["experience", "work experience", "employment history", "work history", "professional experience"],
  ["education", "academic background", "educational background", "academic history"],
  ["skills", "technical skills", "core competencies", "key skills", "proficiencies"],
  ["projects", "portfolio", "notable projects"],
  ["certifications", "certificates", "credentials", "qualifications"],
  ["contact", "contact information", "personal information"]
];

/**
 * Master function to calculate the ATS score for a resume
 * @param {string} resumeText - The plain text content of the resume
 * @param {Object} jobDescription - Optional job description for targeted scoring
 * @returns {Object} Score and detailed feedback
 */
export const calculateATSScore = (resumeText, jobDescription = null) => {
  try {
    if (!resumeText || typeof resumeText !== 'string') {
      return {
        score: 0,
        feedback: ["Unable to process resume text. Please ensure your resume is text-based."],
        breakdowns: {}
      };
    }

    // Prepare text for analysis by converting to lowercase
    const normalizedText = resumeText.toLowerCase();
    
    // Run all analysis components
    const formatScore = analyzeResumeFormat(normalizedText);
    const keywordScore = analyzeKeywords(normalizedText, jobDescription);
    const sectionScore = analyzeSections(normalizedText);
    const contactScore = analyzeContactInfo(normalizedText);
    const experienceScore = analyzeExperienceEducation(normalizedText);
    
    // Calculate total score
    const totalScore = Math.min(
      Math.round(
        formatScore.score + 
        keywordScore.score + 
        sectionScore.score + 
        contactScore.score + 
        experienceScore.score
      ), 
      100
    );
    
    // Combine all feedback points
    const allFeedback = [
      ...formatScore.feedback,
      ...keywordScore.feedback,
      ...sectionScore.feedback,
      ...contactScore.feedback,
      ...experienceScore.feedback
    ];
    
    return {
      score: totalScore,
      feedback: allFeedback,
      breakdowns: {
        format: formatScore,
        keywords: keywordScore,
        sections: sectionScore,
        contactInfo: contactScore,
        experience: experienceScore
      }
    };
  } catch (error) {
    console.error("Error calculating ATS score:", error);
    return {
      score: 50, // Default fallback score
      feedback: ["An error occurred while analyzing your resume. Please try again."],
      breakdowns: {}
    };
  }
};

/**
 * Analyzes resume format for ATS compatibility (20 points)
 * @param {string} text - Resume text
 * @returns {Object} Score and feedback
 */
const analyzeResumeFormat = (text) => {
  const maxScore = 20;
  let score = maxScore;
  const feedback = [];
  
  // Check text length (extremely short texts are unlikely to be complete resumes)
  if (text.length < 500) {
    score -= 10;
    feedback.push("Your resume appears too short. Ensure all sections are included.");
  }
  
  // Check for potential table structures
  const possibleTableIndicators = text.match(/\|\s+\|/g) || [];
  if (possibleTableIndicators.length > 2) {
    score -= 5;
    feedback.push("Your resume may contain tables, which can confuse ATS systems. Use standard formats instead.");
  }
  
  // Check for consistent spacing
  const inconsistentSpacing = /\s{4,}/g;
  if (inconsistentSpacing.test(text)) {
    score -= 3;
    feedback.push("Inconsistent spacing detected. Use standard line breaks between sections.");
  }
  
  // Check for uncommon characters that might indicate formatting issues
  const uncommonChars = /[•♦►▪◘]/g;
  if (uncommonChars.test(text)) {
    score -= 2;
    feedback.push("Unusual bullet points or characters detected. Use standard bullets for better compatibility.");
  }
  
  // Ensure score doesn't go negative
  score = Math.max(0, score);
  
  // If perfect score, add positive feedback
  if (score === maxScore) {
    feedback.push("Good job! Your resume format appears ATS-friendly.");
  }
  
  return {
    score,
    feedback,
    maxPossible: maxScore
  };
};

/**
 * Analyzes resume keywords (30 points)
 * @param {string} text - Resume text
 * @param {Object} jobDescription - Optional job description
 * @returns {Object} Score and feedback
 */
const analyzeKeywords = (text, jobDescription = null) => {
  const maxScore = 30;
  let score = 0;
  const feedback = [];
  
  // Determine industry based on text frequency or default to Software Development
  let relevantKeywords = [];
  let detectedIndustry = "Software Development";
  let highestMatchCount = 0;
  
  // Check against keywords for each industry
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    let matchCount = 0;
    keywords.forEach(keyword => {
      // Case insensitive check for keywords
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
      if (regex.test(text)) {
        matchCount++;
      }
    });
    
    if (matchCount > highestMatchCount) {
      highestMatchCount = matchCount;
      detectedIndustry = industry;
      relevantKeywords = keywords;
    }
  }
  
  // Score based on industry keyword matches
  const keywordMatches = relevantKeywords.filter(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
    return regex.test(text);
  });
  
  const keywordMatchPercentage = keywordMatches.length / relevantKeywords.length;
  let keywordScore = Math.round(keywordMatchPercentage * maxScore);
  
  // Add feedback based on keyword matches
  if (keywordMatchPercentage < 0.3) {
    feedback.push(`Your resume lacks essential ${detectedIndustry} keywords. Consider adding more industry-specific terms.`);
  } else if (keywordMatchPercentage < 0.5) {
    feedback.push(`Your resume has some ${detectedIndustry} keywords, but could use more to improve ATS matching.`);
  } else if (keywordMatchPercentage >= 0.7) {
    feedback.push(`Great job incorporating ${detectedIndustry} keywords in your resume.`);
  }
  
  // If we have a job description, do targeted keyword matching
  if (jobDescription && typeof jobDescription === 'string') {
    // Extract potential keywords from job description (words that appear multiple times)
    const jobWords = jobDescription.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const wordFrequency = {};
    
    jobWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Find frequent words (appearing 3+ times) that might be important keywords
    const potentialKeywords = Object.entries(wordFrequency)
      .filter(([word, count]) => count >= 3 && !commonWords.includes(word))
      .map(([word]) => word);
    
    // Check if these keywords appear in the resume
    const jobSpecificMatches = potentialKeywords.filter(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(text);
    });
    
    const jobMatchPercentage = jobSpecificMatches.length / Math.max(potentialKeywords.length, 1);
    
    // Adjust score based on job-specific keyword matches
    const jobKeywordScore = Math.round(jobMatchPercentage * 15); // Max 15 points from job-specific keywords
    keywordScore = Math.min(maxScore, keywordScore + jobKeywordScore);
    
    if (jobSpecificMatches.length > 0) {
      feedback.push(`Your resume matches ${jobSpecificMatches.length} keywords from the job description.`);
    } else if (potentialKeywords.length > 0) {
      feedback.push("Your resume doesn't contain key terms from the job description. Consider customizing it for this position.");
    }
  }
  
  return {
    score: keywordScore,
    feedback,
    maxPossible: maxScore,
    detectedIndustry,
    matchedKeywords: keywordMatches
  };
};

/**
 * Analyzes resume sections (25 points)
 * @param {string} text - Resume text
 * @returns {Object} Score and feedback
 */
const analyzeSections = (text) => {
  const maxScore = 25;
  let score = 0;
  const feedback = [];
  const detectedSections = [];
  
  // Check for each standard section
  standardSections.forEach(sectionVariations => {
    const foundVariation = sectionVariations.find(variation => 
      new RegExp(`\\b${variation}\\b`, 'i').test(text)
    );
    
    if (foundVariation) {
      detectedSections.push(sectionVariations[0]); // Store the canonical section name
    }
  });
  
  // Score based on number of sections detected
  // Experience, Education, and Skills are the most critical
  const criticalSections = ['experience', 'education', 'skills'];
  const foundCriticalSections = criticalSections.filter(section => 
    detectedSections.includes(section)
  );
  
  // 15 points (5 each) for the three critical sections
  score += foundCriticalSections.length * 5;
  
  // Additional 10 points distributed among other sections
  const otherSectionsFound = detectedSections.length - foundCriticalSections.length;
  score += Math.min(10, otherSectionsFound * 2.5);
  
  // Add feedback based on missing sections
  const missingSections = criticalSections.filter(section => !detectedSections.includes(section));
  
  if (missingSections.length > 0) {
    feedback.push(`Your resume appears to be missing these key sections: ${missingSections.join(', ')}.`);
  } else {
    feedback.push("Great job including all essential resume sections!");
  }
  
  // Check for section organization via headers/formatting
  const potentialHeaders = text.match(/^([A-Z][A-Za-z\s]{2,30})(?:\n|\r\n?)/gm) || [];
  if (potentialHeaders.length < 3) {
    score = Math.max(0, score - 5);
    feedback.push("Your section headers may not be clearly formatted. Use clear, distinct headings for each section.");
  }
  
  return {
    score,
    feedback,
    maxPossible: maxScore,
    detectedSections
  };
};

/**
 * Analyzes contact information (10 points)
 * @param {string} text - Resume text
 * @returns {Object} Score and feedback
 */
const analyzeContactInfo = (text) => {
  const maxScore = 10;
  let score = 0;
  const feedback = [];
  
  // Check for email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex) || [];
  if (emails.length > 0) {
    score += 3;
  } else {
    feedback.push("No email address detected. Include a professional email address.");
  }
  
  // Check for phone number
  const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex) || [];
  if (phones.length > 0) {
    score += 3;
  } else {
    feedback.push("No phone number detected. Include your phone number for recruiter contact.");
  }
  
  // Check for LinkedIn or online profile
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/g;
  const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/g;
  const portfolioRegex = /(?:portfolio|website|site):\s*(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}/gi;
  
  const onlineProfiles = [
    ...(text.match(linkedinRegex) || []),
    ...(text.match(githubRegex) || []),
    ...(text.match(portfolioRegex) || [])
  ];
  
  if (onlineProfiles.length > 0) {
    score += 2;
  } else {
    feedback.push("Consider adding your LinkedIn profile or personal website to your contact information.");
  }
  
  // Check for location information
  const locationIndicators = [
    /(?:location|address|city|town):\s*[a-zA-Z\s,]+/i,
    /[a-zA-Z\s]+,\s*[A-Z]{2}\s*\d{5}/,
    /[a-zA-Z\s]+,\s*[A-Z]{2}/
  ];
  
  const hasLocation = locationIndicators.some(regex => regex.test(text));
  if (hasLocation) {
    score += 2;
  } else {
    feedback.push("Include your location (city, state) to help with location-based job matching.");
  }
  
  if (score === maxScore) {
    feedback.push("Excellent contact information section! All essential contact details are present.");
  }
  
  return {
    score,
    feedback,
    maxPossible: maxScore
  };
};

/**
 * Analyzes experience and education formatting (15 points)
 * @param {string} text - Resume text
 * @returns {Object} Score and feedback
 */
const analyzeExperienceEducation = (text) => {
  const maxScore = 15;
  let score = 0;
  const feedback = [];
  
  // Check for date formats in experience/education sections
  const datePatterns = [
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4} [-–—] (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}|present/gi,
    /\d{1,2}\/\d{4} [-–—] \d{1,2}\/\d{4}|\d{1,2}\/\d{4} [-–—] present/gi,
    /\d{4} [-–—] \d{4}|\d{4} [-–—] present/gi
  ];
  
  let dateMatches = 0;
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    dateMatches += matches.length;
  });
  
  // Score based on date formatting consistency
  if (dateMatches >= 3) {
    score += 5;
  } else if (dateMatches >= 1) {
    score += 3;
    feedback.push("Include consistent date ranges for all positions and education entries.");
  } else {
    feedback.push("No clear date formatting found. Use consistent date ranges for all experiences and education.");
  }
  
  // Check for bullet points in experience section
  const bulletPointPatterns = [
    /•\s+[A-Z][^•\n]+/g,
    /\*\s+[A-Z][^*\n]+/g,
    /-\s+[A-Z][^-\n]+/g,
    /[\s\n]\d+\.\s+[A-Z][^\n]+/g
  ];
  
  let bulletMatches = 0;
  bulletPointPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    bulletMatches += matches.length;
  });
  
  // Score based on bullet point usage
  if (bulletMatches >= 5) {
    score += 5;
  } else if (bulletMatches >= 2) {
    score += 3;
    feedback.push("Use more bullet points to clearly present your achievements.");
  } else {
    feedback.push("Use bullet points to highlight your accomplishments and responsibilities.");
  }
  
  // Check for action verbs at beginning of bullet points
  const actionVerbsPattern = /(?:•|\*|-|\d+\.)\s+(developed|created|managed|led|implemented|designed|analyzed|resolved|improved|increased|decreased|reduced|negotiated|established|coordinated|generated|maintained|delivered|achieved)/gi;
  const actionVerbMatches = text.match(actionVerbsPattern) || [];
  
  if (actionVerbMatches.length >= 4) {
    score += 5;
  } else if (actionVerbMatches.length >= 2) {
    score += 3;
    feedback.push("Use more strong action verbs at the beginning of your bullet points.");
  } else {
    feedback.push("Start achievement statements with strong action verbs.");
  }
  
  if (score === maxScore) {
    feedback.push("Excellent formatting of your experience and education sections!");
  }
  
  return {
    score,
    feedback,
    maxPossible: maxScore
  };
}; 
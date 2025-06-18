/**
 * Resume Parser Utility
 * Provides functions to extract text from resume files
 */

// Common words to exclude from skills
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

// Sample resume texts for simulation
const sampleResumes = [
  `John Smith
123 Main Street, New York, NY 10001
john.smith@example.com | (555) 123-4567 | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with over 5 years of expertise in full-stack development. Proficient in JavaScript, React, Node.js, and AWS. Passionate about creating scalable, user-friendly web applications.

SKILLS
• JavaScript, TypeScript, HTML5, CSS3
• React, Redux, Angular, Vue.js
• Node.js, Express, Django, Flask
• AWS, Docker, Kubernetes
• MongoDB, PostgreSQL, MySQL
• Git, GitHub, GitLab, CI/CD
• Agile Methodology, Scrum, Kanban

WORK EXPERIENCE
Senior Software Engineer
ABC Technologies | New York, NY | Jan 2020 - Present
• Led development of a customer-facing portal serving 50,000+ users, improving user engagement by 35%
• Architected and implemented RESTful APIs using Node.js and Express
• Mentored junior developers and conducted code reviews to ensure high-quality deliverables
• Optimized application performance, reducing load times by 40%

Software Engineer
XYZ Corp | Boston, MA | Jun 2017 - Dec 2019
• Developed and maintained web applications using React and Redux
• Collaborated with UX designers to implement responsive designs
• Created unit and integration tests, achieving 90% code coverage
• Participated in agile development processes, including daily stand-ups and sprint planning

EDUCATION
Bachelor of Science in Computer Science
Massachusetts Institute of Technology | Cambridge, MA | 2017
• GPA: 3.8/4.0
• Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems

PROJECTS
E-commerce Platform (github.com/johnsmith/ecommerce)
• Built using MERN stack (MongoDB, Express, React, Node.js)
• Implemented features such as user authentication, product search, and payment integration

Weather Forecast App (github.com/johnsmith/weatherapp)
• Created using React and OpenWeatherMap API
• Features include location-based forecasts, 5-day predictions, and weather alerts`,

  `Sarah Johnson
456 Park Avenue, San Francisco, CA 94102
sarah.johnson@example.com | (555) 987-6543 | linkedin.com/in/sarahjohnson

SUMMARY
Data Scientist with 4+ years of experience analyzing complex datasets and building predictive models. Skilled in Python, machine learning, and data visualization. Committed to translating data insights into business value.

TECHNICAL SKILLS
• Programming: Python, R, SQL
• Machine Learning: Scikit-learn, TensorFlow, PyTorch
• Data Analysis: Pandas, NumPy, SciPy
• Visualization: Tableau, Power BI, Matplotlib, Seaborn
• Big Data: Spark, Hadoop, AWS
• Database: PostgreSQL, MongoDB, MySQL
• Tools: Jupyter, Git, Docker

PROFESSIONAL EXPERIENCE
Data Scientist
Data Innovations Inc. | San Francisco, CA | Mar 2019 - Present
• Designed and implemented machine learning models that improved customer segmentation accuracy by 45%
• Developed a recommendation engine that increased user engagement by 28%
• Created automated data pipelines using Airflow, reducing manual processing time by 70%
• Presented data insights to stakeholders, influencing key business decisions

Junior Data Analyst
Tech Solutions LLC | Seattle, WA | Jan 2017 - Feb 2019
• Performed exploratory data analysis to identify patterns and trends
• Created dashboards using Tableau to visualize key performance metrics
• Assisted in developing A/B testing frameworks to optimize marketing campaigns
• Cleaned and preprocessed data for analysis, ensuring data quality

EDUCATION
Master of Science in Data Science
Stanford University | Stanford, CA | 2016
• GPA: 3.9/4.0
• Thesis: "Predicting Customer Churn Using Ensemble Methods"

Bachelor of Science in Statistics
University of Washington | Seattle, WA | 2014
• GPA: 3.7/4.0

PROJECTS
Customer Churn Prediction (github.com/sarahjohnson/churn-prediction)
• Built a model to predict customer churn with 92% accuracy
• Used ensemble methods including Random Forest and Gradient Boosting

Housing Price Analyzer (github.com/sarahjohnson/housing-price)
• Developed a web application to predict housing prices based on location and features
• Implemented backend in Flask and frontend in React`
];

/**
 * Extract text content from a resume file
 * Note: In a production environment, this would use a server-side library
 * like pdf.js, pdfkit, docx-parser, etc. This implementation is a client-side simulation.
 * 
 * @param {File} file - The resume file uploaded by the user
 * @returns {Promise<string>} The extracted text content
 */
export const extractResumeText = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // For demonstration, we'll simulate text extraction based on file type
          const fileName = file.name.toLowerCase();
          let extractedText = "";
          
          if (fileName.endsWith('.pdf')) {
            // In a real implementation, we would use pdf.js or a similar library
            // For demo, we'll return a sample text with some formatting that resembles PDF extraction
            extractedText = simulatePdfExtraction(event.target.result);
          } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            // In a real implementation, we would use docx-parser or a similar library
            extractedText = simulateDocxExtraction(event.target.result);
          } else if (fileName.endsWith('.txt')) {
            // Text files can be read directly
            extractedText = event.target.result;
          } else {
            // Unsupported file type
            reject(new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file."));
            return;
          }
          
          resolve(extractedText);
        } catch (error) {
          console.error("Error processing file content:", error);
          reject(new Error("Failed to process resume content"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      // Read the file as text or binary string based on type
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      console.error("Error extracting resume text:", error);
      reject(new Error("Failed to extract text from resume"));
    }
  });
};

/**
 * Extract structured data from resume text
 * @param {string} resumeText - The plain text content of the resume
 * @returns {Object} Structured resume data
 */
export const extractStructuredData = (resumeText) => {
  if (!resumeText) {
    return {
      contactInfo: {},
      skills: [],
      education: [],
      experience: []
    };
  }
  
  // Extract contact information
  const contactInfo = extractContactInfo(resumeText);
  
  // Extract skills
  const skills = extractSkills(resumeText);
  
  // Extract education
  const education = extractEducation(resumeText);
  
  // Extract work experience
  const experience = extractExperience(resumeText);
  
  return {
    contactInfo,
    skills,
    education,
    experience
  };
};

/**
 * Simulate PDF text extraction
 * @param {string} fileContent - Binary content of the file
 * @returns {string} Simulated extracted text
 */
const simulatePdfExtraction = (fileContent) => {
  // For demo purposes, we'll return a sample resume text
  // In a real implementation, this would use pdf.js to extract actual text
  
  // Use the first 10 characters of the file content to create some randomness
  const fileSignature = fileContent.substring(0, 10);
  const randomSeed = Array.from(fileSignature).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Choose one of several sample resumes based on the random seed
  const resumeIndex = randomSeed % sampleResumes.length;
  return sampleResumes[resumeIndex];
};

/**
 * Simulate DOCX text extraction
 * @param {string} fileContent - Binary content of the file
 * @returns {string} Simulated extracted text
 */
const simulateDocxExtraction = (fileContent) => {
  // Similar to PDF extraction, but we'll modify the output slightly
  // to simulate differences in extraction between file formats
  
  // Use the first 10 characters of the file content to create some randomness
  const fileSignature = fileContent.substring(0, 10);
  const randomSeed = Array.from(fileSignature).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Choose one of several sample resumes based on the random seed
  const resumeIndex = randomSeed % sampleResumes.length;
  const baseText = sampleResumes[resumeIndex];
  
  // Simulate DOCX extraction by adding extra line breaks and spaces
  return baseText.replace(/\n/g, '\n\n').replace(/\./g, '.\n');
};

/**
 * Extract contact information from resume text
 * @param {string} text - Resume text content
 * @returns {Object} Contact information (name, email, phone, etc.)
 */
const extractContactInfo = (text) => {
  const contactInfo = {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: ""
  };
  
  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }
  
  // Extract phone
  const phoneRegex = /(?:\+?1[-.]?)?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
  }
  
  // Extract LinkedIn
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) {
    contactInfo.linkedin = linkedinMatch[0];
  }
  
  // Extract name (usually one of the first lines of the resume)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length > 0) {
    // Assume the first non-empty line that doesn't contain @ or http is the name
    const potentialName = lines.find(line => 
      line.length > 0 && 
      !line.includes('@') && 
      !line.includes('http') &&
      line.length < 40
    );
    
    if (potentialName) {
      contactInfo.name = potentialName;
    }
  }
  
  // Extract location (look for common patterns like "City, State" or "City, State ZIP")
  const locationRegex = /[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?/;
  const locationMatch = text.match(locationRegex);
  if (locationMatch) {
    contactInfo.location = locationMatch[0];
  }
  
  return contactInfo;
};

/**
 * Extract skills from resume text
 * @param {string} text - Resume text content
 * @returns {Array} List of skills
 */
const extractSkills = (text) => {
  const skills = [];
  const normalizedText = text.toLowerCase();
  
  // Check for a skills section
  const skillsSectionRegex = /skills|technical skills|core competencies|proficiencies/i;
  const skillsSectionMatch = text.match(skillsSectionRegex);
  
  if (skillsSectionMatch) {
    // Try to extract the skills section
    const skillsSectionIndex = text.indexOf(skillsSectionMatch[0]);
    const nextSectionRegex = /\n\s*(?:experience|education|projects|certifications|references|additional information)/i;
    const nextSectionMatch = text.substring(skillsSectionIndex).match(nextSectionRegex);
    
    let skillsSection = "";
    if (nextSectionMatch) {
      skillsSection = text.substring(skillsSectionIndex, skillsSectionIndex + nextSectionMatch.index);
    } else {
      // If no next section found, take a reasonable chunk
      skillsSection = text.substring(skillsSectionIndex, skillsSectionIndex + 500);
    }
    
    // Extract skills from the section using common patterns
    // Look for bullet points, commas, or other separators
    const skillPatterns = [
      // Match bullet points with skills
      /[•\-\*]\s*([A-Za-z0-9#\+\s\/\.\-]{2,40}?)(?=\n|$|,)/g,
      
      // Match comma-separated skills
      /(?:^|,\s*)([A-Za-z0-9#\+\s\/\.\-]{2,40})(?=\s*,|\s*\n|$)/g,
      
      // Match skills in parentheses
      /\(([A-Za-z0-9#\+\s\/\.\-]{2,40})\)/g,
      
      // Match skills after common prefixes
      /(?:proficient in|experience with|knowledge of|skilled in|expertise in)\s+([A-Za-z0-9#\+\s\/\.\-]{2,40})(?=\s*,|\s*\n|$)/gi
    ];
    
    skillPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(skillsSection)) !== null) {
        const skill = match[1].trim();
        if (skill && 
            skill.length > 1 && 
            !skills.includes(skill) &&
            !commonWords.includes(skill.toLowerCase()) &&
            !/^[0-9\s]+$/.test(skill)) {  // Exclude numbers-only matches
          skills.push(skill);
        }
      }
    });
  }
  
  // If no skills found yet, or very few, check against common skill keywords
  if (skills.length < 5) {
    // Check against all industry keywords
    Object.values(industryKeywords).flat().forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
      if (regex.test(normalizedText) && !skills.includes(keyword)) {
        skills.push(keyword);
      }
    });
  }
  
  // Additionally check for programming languages and tools
  const programmingKeywords = [
    "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go",
    "HTML", "CSS", "SQL", "NoSQL", "MongoDB", "MySQL", "PostgreSQL", "Redis", "Firebase",
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "Rails",
    "TensorFlow", "PyTorch", "Keras", "scikit-learn", "pandas", "NumPy", "Matplotlib",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "Git", "GitHub"
  ];
  
  programmingKeywords.forEach(keyword => {
    // Escape special regex characters in the keyword
    const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    if (regex.test(normalizedText) && !skills.includes(keyword)) {
      skills.push(keyword);
    }
  });
  
  return skills;
};

/**
 * Extract education information from resume text
 * @param {string} text - Resume text content
 * @returns {Array} List of education entries
 */
const extractEducation = (text) => {
  const education = [];
  
  // Common degree patterns
  const degreePatterns = [
    // Full degree names
    /(?:Bachelor|Master|Doctor|Associate)(?:'s)?\s+(?:of|in|degree in)?\s+[A-Za-z\s]+/gi,
    
    // Abbreviated degrees
    /(?:B\.?S\.?|M\.?S\.?|Ph\.?D\.?|B\.?A\.?|M\.?A\.?|M\.?B\.?A\.?|B\.?Tech\.?|M\.?Tech\.?)\s+(?:in\s+)?[A-Za-z\s]+/gi,
    
    // Years with degrees
    /(?:19|20)\d{2}[^\n]*(?:Bachelor|Master|Doctor|Associate|B\.?S\.?|M\.?S\.?|Ph\.?D\.?|B\.?A\.?|M\.?A\.?|M\.?B\.?A\.?)/gi
  ];
  
  // Check for education section
  const educationSectionRegex = /education|academic background|educational background|academic history/i;
  const educationSectionMatch = text.match(educationSectionRegex);
  
  if (educationSectionMatch) {
    // Try to extract the education section
    const educationSectionIndex = text.indexOf(educationSectionMatch[0]);
    const nextSectionRegex = /\n\s*(?:experience|skills|projects|certifications|references|additional information)/i;
    const nextSectionMatch = text.substring(educationSectionIndex).match(nextSectionRegex);
    
    let educationSection = "";
    if (nextSectionMatch) {
      educationSection = text.substring(educationSectionIndex, educationSectionIndex + nextSectionMatch.index);
    } else {
      // If no next section found, take a reasonable chunk
      educationSection = text.substring(educationSectionIndex, educationSectionIndex + 1000);
    }
    
    // Split into lines and process each line
    const lines = educationSection.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentEntry = "";
    for (const line of lines) {
      // Skip section headers and empty lines
      if (line.toLowerCase().match(/^education|^academic/i) || line.length < 3) {
        continue;
      }
      
      // Check if line contains degree information
      const hasDegreeInfo = degreePatterns.some(pattern => pattern.test(line));
      
      // Check if line contains a year
      const hasYear = /(?:19|20)\d{2}/.test(line);
      
      // Check if line contains an institution name (assumed to be proper nouns)
      const hasInstitution = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:University|College|Institute|School))/i.test(line);
      
      // If line contains relevant information, add it to current entry
      if (hasDegreeInfo || hasYear || hasInstitution) {
        if (currentEntry) {
          currentEntry += " " + line;
        } else {
          currentEntry = line;
        }
      } else if (currentEntry) {
        // If we have a current entry and this line doesn't contain new info,
        // save the current entry and start fresh
        if (!education.includes(currentEntry)) {
          education.push(currentEntry);
        }
        currentEntry = "";
      }
    }
    
    // Add the last entry if exists
    if (currentEntry && !education.includes(currentEntry)) {
      education.push(currentEntry);
    }
  }
  
  // If no education found in section, try to find degree patterns anywhere in text
  if (education.length === 0) {
    degreePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const entry = match.trim();
          if (!education.includes(entry)) {
            education.push(entry);
          }
        });
      }
    });
  }
  
  return education;
};

/**
 * Extract work experience information from resume text
 * @param {string} text - Resume text content
 * @returns {Array} List of work experience entries
 */
const extractExperience = (text) => {
  const experience = [];
  
  // Common job title patterns
  const jobTitlePatterns = [
    // Standard titles
    /(?:Senior|Lead|Principal|Junior|Associate)?\s*(?:Software|Systems|Data|Full Stack|Frontend|Backend|DevOps|Cloud|Security|Network|Database|QA|Test|Product|Project|Program|Business|Marketing|Sales|HR|Financial|Operations)?\s*(?:Engineer|Developer|Architect|Analyst|Manager|Director|Consultant|Administrator|Specialist|Coordinator|Designer)/gi,
    
    // Abbreviated titles
    /(?:Sr\.|Jr\.|Assoc\.)\s*(?:SW|SDE|SWE|PM|BA|QA|UI|UX)/gi
  ];
  
  // Common company patterns
  const companyPatterns = [
    // Company with type
    /[A-Z][a-zA-Z\s]*(?:Inc\.|LLC|Ltd\.|Corp\.|Corporation|Company|Technologies|Solutions|Systems|Group|International)/g,
    
    // Companies followed by location
    /[A-Z][a-zA-Z\s]*(?:\||,|\s+-)\s*(?:[A-Z][a-zA-Z\s]*,\s*[A-Z]{2}|[A-Z][a-zA-Z\s]*)/g
  ];
  
  // Date patterns
  const datePatterns = [
    // Standard date ranges
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present/gi,
    
    // Year ranges
    /\d{4}\s*[-–—]\s*(?:\d{4}|Present)/gi
  ];
  
  // Check for experience section
  const experienceSectionRegex = /(?:work|professional)\s+experience|employment(?:\s+history)?/i;
  const experienceSectionMatch = text.match(experienceSectionRegex);
  
  if (experienceSectionMatch) {
    // Try to extract the experience section
    const experienceSectionIndex = text.indexOf(experienceSectionMatch[0]);
    const nextSectionRegex = /\n\s*(?:education|skills|projects|certifications|references|additional information)/i;
    const nextSectionMatch = text.substring(experienceSectionIndex).match(nextSectionRegex);
    
    let experienceSection = "";
    if (nextSectionMatch) {
      experienceSection = text.substring(experienceSectionIndex, experienceSectionIndex + nextSectionMatch.index);
    } else {
      // If no next section found, take a reasonable chunk
      experienceSection = text.substring(experienceSectionIndex, experienceSectionIndex + 2000);
    }
    
    // Split into lines and process each line
    const lines = experienceSection.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentEntry = [];
    let isProcessingBulletPoints = false;
    
    for (const line of lines) {
      // Skip section headers and empty lines
      if (line.toLowerCase().match(/^(?:work|professional)\s+experience|^employment/i) || line.length < 3) {
        continue;
      }
      
      // Check if line contains job title
      const hasJobTitle = jobTitlePatterns.some(pattern => pattern.test(line));
      
      // Check if line contains company name
      const hasCompany = companyPatterns.some(pattern => pattern.test(line));
      
      // Check if line contains dates
      const hasDate = datePatterns.some(pattern => pattern.test(line));
      
      // Check if line is a bullet point
      const isBulletPoint = /^[•\-\*\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25CF\u25E6\u29BE\u29BF]\s/.test(line);
      
      // If line contains job information, start a new entry
      if (hasJobTitle || hasCompany || hasDate) {
        if (currentEntry.length > 0) {
          // Save previous entry
          experience.push(currentEntry.join('\n'));
          currentEntry = [];
        }
        currentEntry.push(line);
        isProcessingBulletPoints = false;
      } else if (isBulletPoint || isProcessingBulletPoints) {
        // Continue adding bullet points to current entry
        currentEntry.push(line);
        isProcessingBulletPoints = true;
      } else if (currentEntry.length > 0 && line.length > 10) {
        // Add additional information to current entry if it's substantial
        currentEntry.push(line);
      }
    }
    
    // Add the last entry if exists
    if (currentEntry.length > 0) {
      experience.push(currentEntry.join('\n'));
    }
  }
  
  // If no experience found in section, try to find job patterns anywhere in text
  if (experience.length === 0) {
    let matches = [];
    jobTitlePatterns.forEach(pattern => {
      const titleMatches = text.match(pattern);
      if (titleMatches) {
        titleMatches.forEach(match => {
          // Get surrounding context (100 characters before and after)
          const index = text.indexOf(match);
          const start = Math.max(0, index - 100);
          const end = Math.min(text.length, index + match.length + 100);
          const context = text.substring(start, end).trim();
          if (!matches.includes(context)) {
            matches.push(context);
          }
        });
      }
    });
    experience.push(...matches);
  }
  
  return experience;
};

// Sample industry keywords for reference
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
  // Note: Other industries are defined in atsScoring.js
}; 
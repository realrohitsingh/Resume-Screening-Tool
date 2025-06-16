/**
 * Resume Parser Utility
 * Provides functions to extract text from resume files
 */

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
  const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
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
      /[•\-*]\s*([A-Za-z0-9#\+\s]{2,25}?)(?:\n|$|,)/g,
      /(?:^|\n|\s|,)([A-Za-z0-9#\+]{2,20})(?:\s*,|\s*\n|$)/g
    ];
    
    skillPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(skillsSection)) !== null) {
        const skill = match[1].trim();
        if (skill && skill.length > 1 && !skills.includes(skill)) {
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
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
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
    
    // Look for degree patterns
    const degreePatterns = [
      /(?:Bachelor|Master|Ph\.?D\.?|B\.S\.|M\.S\.|M\.B\.A\.|B\.A\.|B\.Sc\.)\s+(?:of|in)?\s+(?:[A-Za-z\s]+)/gi,
      /(?:Bachelor's|Master's|Doctorate|Graduate)\s+(?:Degree|degree)?\s+(?:of|in)?\s+(?:[A-Za-z\s]+)/gi
    ];
    
    let degreeMatches = [];
    degreePatterns.forEach(pattern => {
      const matches = educationSection.match(pattern) || [];
      degreeMatches = [...degreeMatches, ...matches];
    });
    
    // Look for university/school patterns
    const universityPatterns = [
      /(?:University|Institute|College|School)\s+of\s+[A-Za-z\s]+/gi,
      /[A-Za-z\s]+(?:University|Institute|College|School)/gi
    ];
    
    let universityMatches = [];
    universityPatterns.forEach(pattern => {
      const matches = educationSection.match(pattern) || [];
      universityMatches = [...universityMatches, ...matches];
    });
    
    // Look for date patterns
    const datePatterns = [
      /(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}|(?:19|20)\d{2}\s*[-–—]\s*Present/gi,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}\s*[-–—]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}|Present/gi
    ];
    
    let dateMatches = [];
    datePatterns.forEach(pattern => {
      const matches = educationSection.match(pattern) || [];
      dateMatches = [...dateMatches, ...matches];
    });
    
    // Combine the matches into education entries
    if (universityMatches.length > 0) {
      universityMatches.forEach((university, index) => {
        const educationEntry = {
          institution: university.trim(),
          degree: degreeMatches[index] ? degreeMatches[index].trim() : "",
          dates: dateMatches[index] ? dateMatches[index].trim() : ""
        };
        
        education.push(educationEntry);
      });
    }
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
  
  // Check for experience section
  const experienceSectionRegex = /experience|work experience|employment history|work history|professional experience/i;
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
    
    // Split the experience section into potential job blocks
    const jobBlocks = experienceSection.split(/\n\s*\n/).filter(block => block.trim().length > 0);
    
    // Process each job block
    jobBlocks.forEach(block => {
      // Skip the section header
      if (block.toLowerCase().includes("experience") && block.split("\n").length <= 2) {
        return;
      }
      
      // Extract company name (often in all caps or followed by location)
      const companyRegex = /([A-Z][A-Za-z0-9\s&.,]+)(?:,|\n|$|\s*[-–—]\s*)/;
      const companyMatch = block.match(companyRegex);
      
      // Extract job title (often at the beginning of a line or following company)
      const titleRegex = /(?:^|\n)([A-Z][a-z]+\s+[A-Za-z\s]+)(?:,|\n|$|\s*[-–—]\s*)/;
      const titleMatch = block.match(titleRegex);
      
      // Extract dates
      const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}\s*[-–—]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}|Present|(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}|(?:19|20)\d{2}\s*[-–—]\s*Present/i;
      const dateMatch = block.match(dateRegex);
      
      // Extract bullet points
      const bulletRegex = /[•\-*]\s*([^\n•\-*]+)/g;
      const bullets = [];
      let bulletMatch;
      while ((bulletMatch = bulletRegex.exec(block)) !== null) {
        bullets.push(bulletMatch[1].trim());
      }
      
      // Create job entry if we have a title or company
      if (titleMatch || companyMatch) {
        const jobEntry = {
          title: titleMatch ? titleMatch[1].trim() : "",
          company: companyMatch ? companyMatch[1].trim() : "",
          dates: dateMatch ? dateMatch[0].trim() : "",
          description: bullets.length > 0 ? bullets : [block.split("\n").slice(1).join(" ").trim()]
        };
        
        experience.push(jobEntry);
      }
    });
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
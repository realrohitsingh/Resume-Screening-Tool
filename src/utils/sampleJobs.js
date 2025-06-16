/**
 * Sample job listings for HR dashboard and recommendations
 */

// Generate job IDs in sequence
const generateJobIds = (prefix, count) => {
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
};

// Helper function to create random date within the last 30 days
const getRandomRecentDate = () => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const randomDate = new Date(today);
  randomDate.setDate(today.getDate() - daysAgo);
  return randomDate.toISOString();
};

// Create base job listings
export const sampleJobs = [
  // Software Development Jobs - 15 listings
  ...generateJobIds("sd", 15).map((id, index) => {
    const positions = [
      "Junior Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", 
      "DevOps Engineer", "Mobile App Developer", "Software Architect", "QA Engineer",
      "UI Developer", "React Developer", "Node.js Developer", "Java Developer",
      "Python Developer", ".NET Developer", "WordPress Developer"
    ];
    
    const companies = [
      "Tech Solutions Inc.", "Digital Innovations", "Cloud Systems", "WebSolutions Ltd",
      "Infinity Systems", "AppDev Co.", "Software Experts", "CodeCraft",
      "ByteWorks", "TechFusion", "NextGen Software", "Innovation Labs",
      "DevStream", "CodeNest", "Binary Solutions"
    ];
    
    const locations = [
      "New York, NY", "San Francisco, CA", "Austin, TX", "Chicago, IL", 
      "Seattle, WA", "Boston, MA", "Denver, CO", "Atlanta, GA",
      "Dallas, TX", "Los Angeles, CA", "Portland, OR", "Miami, FL",
      "Washington, DC", "Philadelphia, PA", "San Diego, CA"
    ];
    
    const expLevels = ["Entry Level", "Mid-Level", "Senior", "Mid-Level", "Entry Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index % locations.length],
      description: `${companies[index]} is seeking a talented ${positions[index]} to join our growing team. You will work on developing innovative solutions using the latest technologies and best practices.`,
      requirements: "Relevant degree and experience in software development. Strong problem-solving skills and eagerness to learn. Experience with modern development tools and methodologies.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 3 === 0, // Every third job is remote
      datePosted: getRandomRecentDate()
    };
  }),

  // Data Science Jobs - 10 listings
  ...generateJobIds("ds", 10).map((id, index) => {
    const positions = [
      "Data Analyst", "Data Scientist", "ML Engineer", "Business Intelligence Analyst",
      "Data Engineer", "Research Scientist", "AI Developer", "Big Data Specialist",
      "Quantitative Analyst", "NLP Engineer"
    ];
    
    const companies = [
      "Data Insights LLC", "Predictive Analytics", "AI Innovations", "DataCore Systems",
      "BigQuery Analytics", "Insight Partners", "ML Solutions", "DeepThought AI",
      "Quantum Analytics", "DataSphere"
    ];
    
    const locations = [
      "San Francisco, CA", "Boston, MA", "New York, NY", "Seattle, WA",
      "Austin, TX", "Chicago, IL", "Pittsburgh, PA", "Raleigh, NC",
      "San Jose, CA", "Cambridge, MA"
    ];
    
    const expLevels = ["Entry Level", "Mid-Level", "Senior", "Mid-Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is looking for a skilled ${positions[index]} to help transform data into actionable insights. You will work with large datasets to identify patterns and develop models that solve complex business problems.`,
      requirements: "Degree in Statistics, Computer Science, or related field. Experience with data analysis tools and programming languages (Python, R). Strong analytical and problem-solving skills.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 2 === 0, // Every other job is remote
      datePosted: getRandomRecentDate()
    };
  }),

  // Marketing Jobs - 10 listings
  ...generateJobIds("mk", 10).map((id, index) => {
    const positions = [
      "Marketing Associate", "Digital Marketing Manager", "Content Marketing Specialist",
      "SEO Specialist", "Social Media Manager", "Brand Manager", "Marketing Director",
      "Growth Marketer", "Email Marketing Specialist", "Marketing Analyst"
    ];
    
    const companies = [
      "Brand Builders", "Growth Accelerators", "Content Wave", "Digital Reach",
      "Social Pulse", "Brand Innovators", "Market Masters", "Elevate Marketing",
      "ClickStream", "Outreach Solutions"
    ];
    
    const locations = [
      "Chicago, IL", "Miami, FL", "Los Angeles, CA", "New York, NY",
      "Atlanta, GA", "San Francisco, CA", "Dallas, TX", "Boston, MA",
      "Denver, CO", "Seattle, WA"
    ];
    
    const expLevels = ["Entry Level", "Mid-Level", "Senior", "Mid-Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is seeking a creative ${positions[index]} to develop and implement effective marketing strategies. You will drive brand awareness, engagement, and customer acquisition through innovative campaigns.`,
      requirements: "Degree in Marketing, Communications, or related field. Experience with digital marketing channels and analytics tools. Strong creative and communication skills.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 3 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // Finance Jobs - 10 listings
  ...generateJobIds("fn", 10).map((id, index) => {
    const positions = [
      "Financial Analyst", "Investment Banking Associate", "Financial Controller",
      "Financial Advisor", "Accountant", "Auditor", "Finance Manager",
      "Risk Analyst", "Loan Officer", "Tax Specialist"
    ];
    
    const companies = [
      "Global Financials", "Capital Partners", "Enterprise Solutions", "Financial Strategies",
      "Accounting Excellence", "Audit Professionals", "Wealth Management Inc.",
      "Risk Solutions", "Credit Union", "Tax Experts"
    ];
    
    const locations = [
      "New York, NY", "Chicago, IL", "Dallas, TX", "San Francisco, CA",
      "Boston, MA", "Charlotte, NC", "Atlanta, GA", "Houston, TX",
      "Miami, FL", "Los Angeles, CA"
    ];
    
    const expLevels = ["Mid-Level", "Senior", "Mid-Level", "Entry Level", "Senior"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is looking for a detail-oriented ${positions[index]} to join our finance team. You will analyze financial data, prepare reports, and provide insights to support business decisions.`,
      requirements: "Degree in Finance, Accounting, or related field. Experience with financial analysis and reporting. Strong analytical and problem-solving skills.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 4 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // Healthcare Jobs - 10 listings
  ...generateJobIds("hc", 10).map((id, index) => {
    const positions = [
      "Registered Nurse", "Healthcare Administrator", "Medical Research Scientist",
      "Physical Therapist", "Physician Assistant", "Medical Technologist",
      "Pharmacist", "Healthcare IT Specialist", "Nutritionist", "Medical Director"
    ];
    
    const companies = [
      "Community Health Center", "Regional Medical Center", "BioHealth Research",
      "Physical Therapy Partners", "Medical Associates", "Lab Technologies",
      "Central Pharmacy", "Healthcare Systems", "Nutrition Center", "Medical Group"
    ];
    
    const locations = [
      "Boston, MA", "Atlanta, GA", "San Diego, CA", "Chicago, IL",
      "Portland, OR", "Baltimore, MD", "Minneapolis, MN", "Denver, CO",
      "Seattle, WA", "Philadelphia, PA"
    ];
    
    const expLevels = ["Mid-Level", "Senior", "Mid-Level", "Entry Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is seeking a dedicated ${positions[index]} to provide exceptional healthcare services. You will work in a collaborative environment focused on patient care and medical excellence.`,
      requirements: "Relevant healthcare degree and certifications. Experience in healthcare settings. Strong communication and interpersonal skills.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 5 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // Education Jobs - 10 listings
  ...generateJobIds("ed", 10).map((id, index) => {
    const positions = [
      "Elementary School Teacher", "E-Learning Developer", "College Professor",
      "Education Consultant", "School Counselor", "Special Education Teacher",
      "Academic Coordinator", "Curriculum Developer", "Educational Technologist", "Librarian"
    ];
    
    const companies = [
      "Bright Futures Academy", "Educational Technologies", "Metropolitan University",
      "Education Consulting Group", "Student Success Center", "Special Needs Academy",
      "Academic Excellence", "Curriculum Innovations", "EdTech Solutions", "Learning Center"
    ];
    
    const locations = [
      "Portland, OR", "Denver, CO", "Seattle, WA", "Boston, MA",
      "Chicago, IL", "Austin, TX", "San Francisco, CA", "New York, NY",
      "Atlanta, GA", "Los Angeles, CA"
    ];
    
    const expLevels = ["Mid-Level", "Entry Level", "Senior", "Mid-Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is looking for a passionate ${positions[index]} to inspire and educate learners. You will develop and implement effective educational strategies that promote student engagement and achievement.`,
      requirements: "Degree in Education or related field. Teaching experience and relevant certifications. Strong communication and classroom management skills.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 3 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // Design Jobs - 10 listings
  ...generateJobIds("dg", 10).map((id, index) => {
    const positions = [
      "UX Designer", "Graphic Designer", "UI Designer", "Product Designer",
      "Art Director", "Creative Director", "Web Designer", "Visual Designer",
      "Brand Designer", "Interaction Designer"
    ];
    
    const companies = [
      "Design Studio", "Creative Solutions", "Digital Design Co", "Product Design Labs",
      "Art Direction Agency", "Creative Collective", "Web Design Partners", "Visual Solutions",
      "Brand Identity Group", "Interactive Design"
    ];
    
    const locations = [
      "San Francisco, CA", "New York, NY", "Los Angeles, CA", "Chicago, IL",
      "Seattle, WA", "Portland, OR", "Austin, TX", "Boston, MA",
      "Denver, CO", "Miami, FL"
    ];
    
    const expLevels = ["Mid-Level", "Senior", "Entry Level", "Mid-Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is seeking a talented ${positions[index]} to create exceptional user experiences. You will design intuitive interfaces and compelling visuals that engage and delight users.`,
      requirements: "Degree in Design or related field. Portfolio demonstrating strong design skills. Experience with design tools and methodologies.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 2 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // Sales Jobs - 10 listings
  ...generateJobIds("sl", 10).map((id, index) => {
    const positions = [
      "Sales Representative", "Account Executive", "Sales Manager", "Business Development Rep",
      "Sales Director", "Channel Sales Manager", "Inside Sales Rep", "Enterprise Sales Executive",
      "Sales Operations Analyst", "Customer Success Manager"
    ];
    
    const companies = [
      "Sales Solutions", "Account Partners", "Strategic Sales Inc", "Business Growth Co",
      "Revenue Accelerators", "Channel Partners", "Inside Sales Pro", "Enterprise Solutions",
      "Sales Operations", "Customer Success Team"
    ];
    
    const locations = [
      "New York, NY", "Chicago, IL", "San Francisco, CA", "Dallas, TX",
      "Atlanta, GA", "Denver, CO", "Boston, MA", "Miami, FL",
      "Seattle, WA", "Los Angeles, CA"
    ];
    
    const expLevels = ["Entry Level", "Mid-Level", "Senior", "Mid-Level", "Entry Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is looking for a motivated ${positions[index]} to drive revenue growth. You will identify new opportunities, build client relationships, and close deals to achieve sales targets.`,
      requirements: "Proven sales experience. Strong communication and negotiation skills. Goal-oriented mindset with a track record of exceeding targets.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 3 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // Customer Service Jobs - 5 listings
  ...generateJobIds("cs", 5).map((id, index) => {
    const positions = [
      "Customer Support Representative", "Customer Success Specialist", "Support Team Lead",
      "Customer Experience Manager", "Technical Support Specialist"
    ];
    
    const companies = [
      "Support Solutions", "Customer Success Co", "Support Leaders",
      "Customer Experience Group", "Tech Support Inc"
    ];
    
    const locations = [
      "Phoenix, AZ", "Salt Lake City, UT", "Orlando, FL", "Nashville, TN",
      "Portland, OR"
    ];
    
    const expLevels = ["Entry Level", "Mid-Level", "Senior", "Mid-Level", "Entry Level"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is seeking a customer-focused ${positions[index]} to provide exceptional service. You will resolve customer issues, provide product guidance, and ensure a positive customer experience.`,
      requirements: "Strong communication and problem-solving skills. Customer service experience. Patience and empathy when handling customer concerns.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 2 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // HR Jobs - 5 listings
  ...generateJobIds("hr", 5).map((id, index) => {
    const positions = [
      "HR Coordinator", "Recruiter", "HR Manager", "Talent Acquisition Specialist",
      "HR Director"
    ];
    
    const companies = [
      "HR Solutions", "Recruitment Partners", "Human Resources Inc",
      "Talent Acquisition Group", "HR Leadership"
    ];
    
    const locations = [
      "Chicago, IL", "San Francisco, CA", "New York, NY", "Atlanta, GA",
      "Dallas, TX"
    ];
    
    const expLevels = ["Entry Level", "Mid-Level", "Senior", "Mid-Level", "Senior"];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is looking for a skilled ${positions[index]} to support our human resources functions. You will manage recruitment, employee relations, and HR initiatives to create a positive workplace environment.`,
      requirements: "Degree in Human Resources or related field. Experience in HR processes and best practices. Strong communication and interpersonal skills.",
      experienceLevel: expLevels[index % expLevels.length],
      remote: index % 3 === 0,
      datePosted: getRandomRecentDate()
    };
  }),

  // Executive Jobs - 5 listings
  ...generateJobIds("ex", 5).map((id, index) => {
    const positions = [
      "Chief Executive Officer", "Chief Technology Officer", "Chief Financial Officer",
      "Chief Marketing Officer", "Chief Operations Officer"
    ];
    
    const companies = [
      "Global Enterprises", "Tech Innovations", "Financial Group",
      "Marketing Solutions", "Operations Excellence"
    ];
    
    const locations = [
      "New York, NY", "San Francisco, CA", "Chicago, IL", "Boston, MA",
      "Seattle, WA"
    ];
    
    return {
      id: id,
      position: positions[index],
      company: companies[index],
      location: locations[index],
      description: `${companies[index]} is seeking an experienced ${positions[index]} to provide strategic leadership. You will drive organizational growth, set company direction, and lead teams to achieve business objectives.`,
      requirements: "Advanced degree in Business or related field. 10+ years of executive leadership experience. Strategic vision and proven track record of success in leadership roles.",
      experienceLevel: "Executive",
      remote: false,
      datePosted: getRandomRecentDate()
    };
  })
];

/**
 * Add sample jobs to localStorage
 */
export const initializeSampleJobs = () => {
  // Check if jobs already exist in localStorage
  let existingJobs = localStorage.getItem("hrJobs");
  let shouldReplace = false;
  
  try {
    // Check for invalid or placeholder data
    if (existingJobs) {
      // Check if we have placeholder data with "SS" values
      if (existingJobs.includes('"position":"SS"')) {
        console.log("Found placeholder data, will replace with sample jobs");
        shouldReplace = true;
      } else {
        // Parse and validate the existing data
        const parsedJobs = JSON.parse(existingJobs);
        if (!parsedJobs || 
            !Array.isArray(parsedJobs) || 
            parsedJobs.length === 0 ||
            !parsedJobs[0].position) {
          console.log("Invalid job data format, will replace with sample jobs");
          shouldReplace = true;
        }
      }
    } else {
      // No existing jobs
      shouldReplace = true;
    }
  } catch (e) {
    console.error("Error parsing jobs from localStorage:", e);
    shouldReplace = true;
  }
  
  // Replace jobs if needed
  if (shouldReplace) {
    localStorage.setItem("hrJobs", JSON.stringify(sampleJobs));
    console.log(`Sample jobs initialized in localStorage: ${sampleJobs.length} jobs added`);
    return sampleJobs.length;
  }
  
  return 0; // No jobs added
}; 
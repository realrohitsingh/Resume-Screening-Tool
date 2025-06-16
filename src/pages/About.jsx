import React from "react";
import "../styles/about.css";

const About = () => {
  const testimonials = [
    {
      id: 1,
      name: "Rajesh Sharma",
      role: "HR Director, Infosys",
      logo: "/src/assets/company-logos/infosys-logo.svg",
      quote: "This platform has transformed our talent acquisition process. The AI-powered screening has helped us identify top candidates 60% faster, significantly improving our hiring efficiency."
    },
    {
      id: 2,
      name: "Aditya Verma",
      role: "Senior Software Engineer, Wipro",
      logo: "/src/assets/company-logos/wipro-logo.svg",
      quote: "The resume optimization suggestions were game-changing. Within two weeks of using the platform, I secured interviews with three leading tech companies."
    },
    {
      id: 3,
      name: "Priya Malhotra",
      role: "Talent Acquisition Head, TCS",
      logo: "/src/assets/company-logos/tcs-logo.svg",
      quote: "The intelligent matching algorithms and analytics dashboard have revolutionized how we screen candidates. Our recruitment process is now 45% more efficient."
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Ankur Dixit",
      role: "Full Stack Developer",
      image: "https://ui-avatars.com/api/?name=Ankur+Dixit&background=4A6CF7&color=fff",
      bio: "4th year Information Technology student with expertise in full-stack development. Leading the technical architecture and implementation of the platform."
    },
    {
      id: 2,
      name: "Rohit Kumar Singh",
      role: "Frontend Developer",
      image: "https://ui-avatars.com/api/?name=Rohit+Kumar+Singh&background=FF6B6B&color=fff",
      bio: "4th year Information Technology student specializing in frontend development. Creating intuitive and responsive user interfaces for seamless user experience."
    },
    {
      id: 3,
      name: "Sonu Kumar Mandal",
      role: "Documentation Lead",
      image: "https://ui-avatars.com/api/?name=Sonu+Kumar+Mandal&background=51CF66&color=fff",
      bio: "4th year Information Technology student handling project documentation. Ensuring comprehensive documentation of features, APIs, and user guides."
    },
    {
      id: 4,
      name: "Satyam Kumar",
      role: "R&D and Presentation Lead",
      image: "https://ui-avatars.com/api/?name=Satyam+Kumar&background=FAB005&color=fff",
      bio: "4th year Information Technology student leading research and presentation. Exploring innovative technologies and presenting project insights."
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Transforming Resume Screening <span>& Job Matching</span></h1>
          <p className="hero-subtitle">
            We're on a mission to revolutionize how candidates find their dream jobs and how companies discover perfect talent matches.
          </p>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Team collaboration" />
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about-story">
        <div className="section-header">
          <h2>Our Story</h2>
          <div className="section-divider"></div>
        </div>
        <div className="story-content">
          <p>
            Welcome to our platform! We are dedicated to providing the best resume screening and management tools
            to help recruiters and job seekers connect more efficiently.
          </p>
          <p>
            Our mission is to streamline the recruitment process by leveraging modern technology
            to analyze and match candidate resumes with job requirements. We started in 2020 with a simple idea:
            make the hiring process more transparent, efficient, and fair for everyone involved.
          </p>
          <p>
            Today, we're proud to serve thousands of job seekers and hundreds of companies, continuously improving our
            algorithms and user experience based on real-world feedback and results.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="section-header">
          <h2>Our Team</h2>
          <div className="section-divider"></div>
        </div>
        <p className="team-intro">
          Our diverse team of professionals brings together expertise in recruitment,
          technology, and data analysis to create an innovative platform that addresses
          the challenges in today's hiring landscape.
        </p>
        <div className="team-grid">
          {teamMembers.map(member => (
            <div className="team-member" key={member.id}>
              <div className="member-image">
                <img src={member.image} alt={member.name} />
              </div>
              <h3>{member.name}</h3>
              <span className="member-role">{member.role}</span>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="about-technology">
        <div className="technology-content">
          <div className="section-header">
            <h2>Our Technology</h2>
            <div className="section-divider"></div>
          </div>
          <p>
            We use cutting-edge algorithms and machine learning techniques to analyze resumes,
            extract relevant information, and provide actionable insights for better hiring decisions.
          </p>
          <div className="tech-features">
            <div className="feature">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16a4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 2.85 1.2"></path>
                  <path d="M12 8v4l3 3"></path>
                </svg>
              </div>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced algorithms that understand context and relevance in resume content</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"></path>
                  <path d="M18 14l-6-6-6 6"></path>
                </svg>
              </div>
              <h3>Skills Matching</h3>
              <p>Precise matching of candidate skills to job requirements with weighted scoring</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>ATS Optimization</h3>
              <p>Resume scoring and suggestions to improve visibility in applicant tracking systems</p>
            </div>
          </div>
        </div>
        <div className="technology-image">
          <img src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Technology visualization" />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="about-testimonials">
        <div className="section-header">
          <h2>What People Say</h2>
          <div className="section-divider"></div>
        </div>
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div className="testimonial-card" key={testimonial.id}>
              <div className="quote-icon">"</div>
              <p className="testimonial-quote">{testimonial.quote}</p>
              <div className="testimonial-author">
                <div className="company-logo">
                  <img src={testimonial.logo} alt={`${testimonial.role} company logo`} />
                </div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <h2>Ready to transform your job search or hiring process?</h2>
        <p>Join thousands of successful job seekers and companies.</p>
        <div className="cta-buttons">
          <a href="/signup" className="cta-button primary">Get Started</a>
          <a href="/contact" className="cta-button secondary">Contact Us</a>
        </div>
      </section>
    </div>
  );
};

export default About;
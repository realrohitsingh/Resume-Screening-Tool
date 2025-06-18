import spacy
import docx2txt
import re
from pdfminer.high_level import extract_text
import os
from datetime import datetime
import pandas as pd

class ResumeParser:
    def __init__(self, resume_file):
        self.resume_file = resume_file
        self.text = self._extract_text()
        self.nlp = spacy.load("en_core_web_sm")
        self.doc = self.nlp(self.text)
        
        # Load skills from CSV if available
        skills_file = os.path.join(os.path.dirname(__file__), 'skills.csv')
        if os.path.exists(skills_file):
            try:
                self.skills_df = pd.read_csv(skills_file)
                self.skills_db = set(self.skills_df['Skill'].str.lower())
            except Exception as e:
                print(f"Error loading skills file: {e}")
                self.skills_db = self._get_default_skills()
        else:
            self.skills_db = self._get_default_skills()
        
    def _extract_text(self):
        file_extension = os.path.splitext(self.resume_file)[1].lower()
        
        try:
            if file_extension == '.pdf':
                try:
                    return extract_text(self.resume_file)
                except Exception as e:
                    print(f"Error extracting text from PDF: {e}")
                    # Try alternative method if primary fails
                    from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
                    from pdfminer.converter import TextConverter
                    from pdfminer.layout import LAParams
                    from pdfminer.pdfpage import PDFPage
                    from io import StringIO

                    output = StringIO()
                    manager = PDFResourceManager()
                    converter = TextConverter(manager, output, laparams=LAParams())
                    interpreter = PDFPageInterpreter(manager, converter)

                    with open(self.resume_file, 'rb') as fh:
                        for page in PDFPage.get_pages(fh):
                            interpreter.process_page(page)

                    text = output.getvalue()
                    converter.close()
                    output.close()
                    return text
            elif file_extension in ['.docx', '.doc']:
                return docx2txt.process(self.resume_file)
            elif file_extension == '.txt':
                with open(self.resume_file, 'r', encoding='utf-8') as file:
                    return file.read()
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
        except Exception as e:
            print(f"Error extracting text from file: {e}")
            return ""

    def _extract_phone_number(self):
        # Phone number regex pattern - more robust pattern
        phone_pattern = re.compile(
            r'(?:\+?1[-.]?)?\s*(?:\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        )
        matches = phone_pattern.finditer(self.text)
        return next((match.group() for match in matches), None)

    def _extract_email(self):
        # Email regex pattern
        email_pattern = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
        matches = email_pattern.finditer(self.text)
        return next((match.group() for match in matches), None)

    def _extract_skills(self):
        doc = self.nlp(self.text.lower())  # Convert to lowercase for better matching
        
        # Common programming languages and technologies
        skills_db = {
            # Programming Languages
            'python', 'java', 'javascript', 'js', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
            'scala', 'rust', 'golang', 'typescript', 'perl', 'r', 'matlab', 'bash', 'shell',
            
            # Web Technologies
            'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery', 'react', 'vue',
            'angular', 'node', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel',
            'webpack', 'babel', 'next.js', 'nuxt.js', 'svelte', 'graphql', 'rest', 'soap',
            
            # Databases
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
            'oracle', 'sqlite', 'mariadb', 'dynamodb', 'firebase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
            'bitbucket', 'terraform', 'ansible', 'puppet', 'chef', 'prometheus', 'grafana',
            
            # AI & Data Science
            'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow',
            'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'matplotlib',
            
            # Mobile Development
            'android', 'ios', 'swift', 'react native', 'flutter', 'xamarin', 'ionic',
            'objective-c', 'kotlin', 'mobile development',
            
            # Other Skills
            'agile', 'scrum', 'kanban', 'jira', 'confluence', 'git', 'svn', 'linux',
            'windows', 'macos', 'ci/cd', 'devops', 'testing', 'junit', 'selenium',
            'cypress', 'jest', 'mocha', 'blockchain', 'cybersecurity', 'networking'
        }
        
        found_skills = set()
        
        # First pass: direct matches
        for token in doc:
            if token.text in skills_db:
                found_skills.add(token.text)
        
        # Second pass: compound skills (bi-grams)
        for i in range(len(doc) - 1):
            bigram = f"{doc[i].text} {doc[i + 1].text}"
            if bigram in skills_db:
                found_skills.add(bigram)
        
        # Third pass: look for skills in noun phrases
        for chunk in doc.noun_chunks:
            if chunk.text in skills_db:
                found_skills.add(chunk.text)
        
        # Convert skills to proper casing for better presentation
        proper_cased_skills = []
        for skill in found_skills:
            # Special cases for acronyms and proper nouns
            if skill.upper() in ['HTML', 'CSS', 'PHP', 'SQL', 'API', 'AWS', 'GCP']:
                proper_cased_skills.append(skill.upper())
            elif skill in ['JavaScript', 'TypeScript', 'GitHub', 'GitLab', 'DevOps', 'MongoDB']:
                proper_cased_skills.append(skill)  # Keep original casing
            elif skill.startswith(('react', 'vue', 'angular')):
                proper_cased_skills.append(skill.capitalize())
            else:
                proper_cased_skills.append(skill.lower())
        
        return sorted(proper_cased_skills)

    def _extract_education(self):
        doc = self.nlp(self.text.lower())
        
        # Education related terms
        education_terms = {
            # Degrees
            'bachelor', 'master', 'phd', 'doctorate', 'doctoral', 'associate',
            'b.tech', 'm.tech', 'b.e.', 'm.e.', 'b.sc', 'm.sc', 'b.a.', 'm.a.',
            'bca', 'mca', 'b.com', 'm.com', 'mba', 'diploma',
            
            # Degree variations
            'bs', 'ms', 'ba', 'ma', 'bsc', 'msc', 'btech', 'mtech',
            
            # Education levels
            'high school', 'secondary', 'undergraduate', 'graduate', 'postgraduate',
            'post-graduate', 'ph.d', 'ph.d.',
            
            # Other terms
            'university', 'college', 'institute', 'school', 'academy',
            'certification', 'degree', 'education', 'qualification'
        }
        
        education = []
        current_edu = []
        
        for sent in doc.sents:
            sent_text = sent.text.strip()
            
            # Skip if sentence is too short
            if len(sent_text.split()) < 3:
                continue
            
            # Check if sentence contains education terms
            if any(term in sent_text for term in education_terms):
                # Clean up the sentence
                # Remove multiple spaces
                sent_text = ' '.join(sent_text.split())
                
                # Remove bullet points and common prefixes
                sent_text = re.sub(r'^[-•*]\s*', '', sent_text)
                
                # Capitalize properly
                sent_text = sent_text.capitalize()
                
                # Special handling for common abbreviations
                sent_text = re.sub(r'\bb\.tech\b', 'B.Tech', sent_text, flags=re.IGNORECASE)
                sent_text = re.sub(r'\bm\.tech\b', 'M.Tech', sent_text, flags=re.IGNORECASE)
                sent_text = re.sub(r'\bb\.sc\b', 'B.Sc', sent_text, flags=re.IGNORECASE)
                sent_text = re.sub(r'\bm\.sc\b', 'M.Sc', sent_text, flags=re.IGNORECASE)
                sent_text = re.sub(r'\bph\.d\b', 'Ph.D', sent_text, flags=re.IGNORECASE)
                sent_text = re.sub(r'\bmba\b', 'MBA', sent_text, flags=re.IGNORECASE)
                
                # Add to education list if not already present
                if sent_text not in education:
                    education.append(sent_text)
        
        return education

    def _extract_experience(self):
        doc = self.nlp(self.text.lower())
        
        # Experience related terms
        experience_terms = {
            # Job titles
            'engineer', 'developer', 'programmer', 'analyst', 'consultant',
            'manager', 'director', 'lead', 'architect', 'designer',
            'administrator', 'specialist', 'coordinator', 'supervisor',
            
            # Work-related terms
            'experience', 'work', 'employment', 'job', 'career', 'position',
            'role', 'company', 'organization', 'firm', 'corporation',
            'employer', 'client', 'project', 'responsibility',
            
            # Time indicators
            'year', 'month', 'present', 'current', 'former', 'previous',
            
            # Common prefixes
            'senior', 'junior', 'associate', 'principal', 'staff',
            'technical', 'software', 'systems', 'solution'
        }
        
        experience = []
        current_exp = []
        
        for sent in doc.sents:
            sent_text = sent.text.strip()
            
            # Skip if sentence is too short
            if len(sent_text.split()) < 3:
                continue
            
            # Check if sentence contains experience terms
            if any(term in sent_text for term in experience_terms):
                # Clean up the sentence
                # Remove multiple spaces
                sent_text = ' '.join(sent_text.split())
                
                # Remove bullet points and common prefixes
                sent_text = re.sub(r'^[-•*]\s*', '', sent_text)
                
                # Capitalize properly
                sent_text = sent_text.capitalize()
                
                # Special handling for common job titles
                sent_text = re.sub(r'\bsr\.\s*', 'Senior ', sent_text, flags=re.IGNORECASE)
                sent_text = re.sub(r'\bjr\.\s*', 'Junior ', sent_text, flags=re.IGNORECASE)
                
                # Handle company names (assumed to be proper nouns)
                for token in doc:
                    if token.pos_ == "PROPN" and len(token.text) > 1:
                        sent_text = sent_text.replace(token.text.lower(), token.text.title())
                
                # Add to experience list if not already present and contains meaningful information
                if (sent_text not in experience and 
                    len(sent_text.split()) > 3 and  # More than 3 words
                    not sent_text.startswith(('The', 'A', 'An', 'This', 'That', 'These', 'Those')) and
                    not any(sent_text.lower().startswith(skip) for skip in ['i ', 'we ', 'they ', 'you '])):
                    experience.append(sent_text)
        
        return experience

    def _extract_name(self):
        """Extract name from resume using NER"""
        # First look for a name at the beginning of the resume
        first_paragraph = self.text.split('\n')[0]
        first_doc = self.nlp(first_paragraph)
        
        for ent in first_doc.ents:
            if ent.label_ == 'PERSON':
                return ent.text
        
        # If no name found in first paragraph, look through the entire document
        for ent in self.doc.ents:
            if ent.label_ == 'PERSON':
                return ent.text
                
        return None

    def _extract_company_names(self):
        """Extract company names from resume"""
        companies = set()
        
        # Common company indicators
        company_indicators = {'inc', 'corp', 'corporation', 'ltd', 'limited', 'llc', 'llp', 'gmbh', 'co', 'company'}
        
        for ent in self.doc.ents:
            if ent.label_ == 'ORG':
                company = ent.text.strip()
                # Check if it's likely a company name
                if any(indicator in company.lower() for indicator in company_indicators):
                    companies.add(company)
                # Also add if it's followed by company indicators
                elif len(ent.text.split()) > 1:  # Multi-word organization names are more likely to be companies
                    companies.add(company)
        
        return list(companies)

    def _extract_designation(self):
        """Extract job titles/designations from resume"""
        designations = set()
        
        # Common job title patterns
        job_title_patterns = [
            r'(?i)(senior|lead|principal|staff|junior|associate)?\s*(software|systems|solutions|technical|it|web|cloud|data|network|security|business|product|project)?\s*(engineer|developer|architect|analyst|consultant|manager|administrator|specialist|coordinator|designer)',
            r'(?i)(chief|vice president|director|head|vp) (?:of )?(technology|engineering|operations|product|technical|information|software|development|business)',
            r'(?i)(full[ -]stack|backend|frontend|ios|android|mobile|devops|qa|sre) (engineer|developer)',
            r'(?i)(program|product|project|technical|engineering|team) (manager|lead)'
        ]
        
        # Search for job titles using regex patterns
        for pattern in job_title_patterns:
            matches = re.finditer(pattern, self.text)
            for match in matches:
                designation = match.group().strip()
                # Proper casing
                designation = ' '.join(word.capitalize() if word.lower() not in {'of', 'the'} else word.lower() 
                                    for word in designation.split())
                designations.add(designation)
        
        return list(designations)

    def _calculate_total_experience(self):
        """Calculate total work experience in years"""
        # Common date patterns
        date_patterns = [
            r'(?i)(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)[,\s]+\d{4}',
            r'\d{2}/\d{2}/\d{4}',
            r'\d{2}-\d{2}-\d{4}',
            r'\d{4}'
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.finditer(pattern, self.text)
            for match in matches:
                date_str = match.group()
                try:
                    # Convert various formats to datetime
                    if '/' in date_str or '-' in date_str:
                        date = datetime.strptime(date_str, '%m/%d/%Y' if '/' in date_str else '%m-%d-%Y')
                    elif len(date_str) == 4:  # Just year
                        date = datetime.strptime(date_str, '%Y')
                    else:  # Month Year format
                        date = datetime.strptime(date_str, '%B %Y' if len(date_str.split()[0]) > 3 else '%b %Y')
                    dates.append(date)
                except ValueError:
                    continue
        
        if dates:
            earliest_date = min(dates)
            latest_date = max(dates)
            experience = (latest_date.year - earliest_date.year) + (latest_date.month - earliest_date.month) / 12
            return round(experience, 1)
        
        return None

    def _get_default_skills(self):
        """Get default skills database"""
        return {
            # Programming Languages
            'python', 'java', 'javascript', 'js', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
            'scala', 'rust', 'golang', 'typescript', 'perl', 'r', 'matlab', 'bash', 'shell',
            
            # Web Technologies
            'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery', 'react', 'vue',
            'angular', 'node', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel',
            'webpack', 'babel', 'next.js', 'nuxt.js', 'svelte', 'graphql', 'rest', 'soap',
            
            # Databases
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
            'oracle', 'sqlite', 'mariadb', 'dynamodb', 'firebase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
            'bitbucket', 'terraform', 'ansible', 'puppet', 'chef', 'prometheus', 'grafana',
            
            # AI & Data Science
            'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow',
            'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'matplotlib',
            
            # Mobile Development
            'android', 'ios', 'swift', 'react native', 'flutter', 'xamarin', 'ionic',
            'objective-c', 'kotlin', 'mobile development',
            
            # Other Skills
            'agile', 'scrum', 'kanban', 'jira', 'confluence', 'git', 'svn', 'linux',
            'windows', 'macos', 'ci/cd', 'devops', 'testing', 'junit', 'selenium',
            'cypress', 'jest', 'mocha', 'blockchain', 'cybersecurity', 'networking'
        }

    def get_extracted_data(self):
        """
        Returns a dictionary containing the extracted information from the resume
        """
        return {
            'name': self._extract_name(),
            'email': self._extract_email(),
            'phone_number': self._extract_phone_number(),
            'skills': self._extract_skills(),
            'education': self._extract_education(),
            'experience': self._extract_experience(),
            'company_names': self._extract_company_names(),
            'designation': self._extract_designation(),
            'total_experience': self._calculate_total_experience()
        }

# Example usage:
# parser = ResumeParser('path/to/resume.pdf')
# data = parser.get_extracted_data() 
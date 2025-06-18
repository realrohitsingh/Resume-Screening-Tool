from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys
import hashlib
from .resume_parser import ResumeParser  # Use our local resume parser instead
from . import auth
import re
import uuid

# Get the absolute path to the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up one level to the server directory
server_dir = os.path.dirname(current_dir)
# Paths
dataset_path = os.path.join(server_dir, 'job_final.csv')
ats_scores_path = os.path.join(server_dir, 'ats_scores.json')
uploads_path = os.path.join(server_dir, 'uploads')
hr_jobs_path = os.path.join(server_dir, 'hr_jobs.json')

# Create uploads directory if it doesn't exist
os.makedirs(uploads_path, exist_ok=True)

# Load or create ATS scores file
if os.path.exists(ats_scores_path):
    with open(ats_scores_path, 'r') as f:
        ats_scores = json.load(f)
else:
    ats_scores = {}

# Load job data
jobs_df = pd.read_csv(dataset_path)

# Load or create HR jobs file
if os.path.exists(hr_jobs_path):
    with open(hr_jobs_path, 'r') as f:
        hr_jobs = json.load(f)
else:
    hr_jobs = {"jobs": []}
    with open(hr_jobs_path, 'w') as f:
        json.dump(hr_jobs, f)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5174"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize auth routes
auth.init_auth_routes(app)

def generate_resume_hash(resume_data):
    """Generate a deterministic hash for resume data"""
    # Create a sorted, deterministic string representation of resume data
    resume_str = json.dumps({
        'skills': sorted(resume_data.get('skills', [])),
        'education': sorted(resume_data.get('education', [])),
        'experience': sorted(resume_data.get('experience', [])),
        'total_experience': resume_data.get('total_experience', 0),
        'email': resume_data.get('email', ''),
        'phone_number': resume_data.get('phone_number', '')
    }, sort_keys=True)
    
    # Generate hash
    return hashlib.md5(resume_str.encode()).hexdigest()

def calculate_ats_score(resume_data, job_description):
    """Calculate ATS score based on resume data and job requirements"""
    try:
        # Generate resume hash
        resume_hash = generate_resume_hash(resume_data)
        
        # Check if we have a cached score for this resume and job
        job_hash = hashlib.md5(job_description.encode()).hexdigest()
        cache_key = f"{resume_hash}_{job_hash}"
        
        if cache_key in ats_scores.get('score_cache', {}):
            return ats_scores['score_cache'][cache_key]
        
        score = 70  # Base score
        
        # Extract skills from resume
        resume_skills = set(s.lower() for s in resume_data.get('skills', []))
        
        # Extract skills from job description
        nlp = spacy.load('en_core_web_sm')
        job_doc = nlp(job_description.lower())
        
        # Load skills from CSV
        skills_file = os.path.join(current_dir, 'skills.csv')
        if os.path.exists(skills_file):
            skills_df = pd.read_csv(skills_file)
            all_skills = set(skill.lower() for skill in skills_df['Skill'])
        else:
            # Fallback to default skills from resume parser
            all_skills = resume_skills
        
        # Find skills mentioned in job description
        job_skills = set()
        for skill in all_skills:
            if skill in job_description.lower():
                job_skills.add(skill)
        
        if job_skills:
            # Calculate skill match percentage
            matching_skills = resume_skills.intersection(job_skills)
            skill_match_percentage = len(matching_skills) / len(job_skills)
            
            # Add up to 20 points based on skill matches
            score += min(20, skill_match_percentage * 20)
        
        # Check for education match
        education = resume_data.get('education', [])
        education_text = ' '.join(education).lower()
        required_degrees = ['bachelor', 'master', 'phd', 'mba']
        if any(degree in education_text for degree in required_degrees):
            score += 5
        
        # Check for experience match
        total_experience = resume_data.get('total_experience')
        if total_experience:
            if total_experience >= 5:
                score += 5
            elif total_experience >= 3:
                score += 3
            elif total_experience >= 1:
                score += 2
        
        final_score = min(round(score), 100)
        
        # Cache the score
        if 'score_cache' not in ats_scores:
            ats_scores['score_cache'] = {}
        ats_scores['score_cache'][cache_key] = final_score
        
        # Save cache to file
        with open(ats_scores_path, 'w') as f:
            json.dump(ats_scores, f)
        
        return final_score
    except Exception as e:
        print(f"Error calculating ATS score: {e}")
        return 70  # Default score on error

def get_job_recommendations(resume_data, user_id=None):
    """Get job recommendations based on resume data"""
    try:
        # Generate resume hash
        resume_hash = generate_resume_hash(resume_data)
        
        # Check if we have cached recommendations
        if resume_hash in ats_scores.get('recommendation_cache', {}):
            cached_data = ats_scores['recommendation_cache'][resume_hash]
            # Only use cache if it's less than 24 hours old
            cache_time = datetime.fromisoformat(cached_data['timestamp'])
            if (datetime.now() - cache_time).total_seconds() < 86400:  # 24 hours
                return cached_data['recommendations']
        
        # Extract data from resume
        resume_skills = set(s.lower() for s in resume_data.get('skills', []))
        resume_experience = resume_data.get('experience', [])
        resume_education = resume_data.get('education', [])
        total_experience = resume_data.get('total_experience', 0)
        
        # Create profile text combining all resume information
        profile_text = ' '.join([
            ' '.join(resume_skills),
            ' '.join(resume_experience),
            ' '.join(resume_education)
        ]).lower()
        
        # Create TF-IDF vectors for job descriptions and resume profile
        tfidf = TfidfVectorizer(stop_words='english')
        
        # Combine job title, requirements, and description for better matching
        jobs_df['combined_text'] = jobs_df['Position'].fillna('') + ' ' + \
                                 jobs_df['Job_Description'].fillna('')
        
        # Create vectors
        job_vectors = tfidf.fit_transform(jobs_df['combined_text'])
        profile_vector = tfidf.transform([profile_text])
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(profile_vector, job_vectors)
        
        # Get top matching jobs
        top_indices = similarity_scores[0].argsort()[-10:][::-1]
        
        # Prepare recommendations
        recommendations = []
        for idx in top_indices:
            job = jobs_df.iloc[idx]
            
            # Calculate ATS score for this job
            ats_score = calculate_ats_score(resume_data, job['Job_Description'])
            
            # Get matching skills
            job_skills = set()
            for skill in resume_skills:
                if skill.lower() in job['Job_Description'].lower():
                    job_skills.add(skill)
            
            # Calculate experience match
            experience_match = True
            required_exp = extract_required_experience(job['Job_Description'])
            if required_exp and total_experience < required_exp:
                experience_match = False
            
            # Calculate education match
            education_match = True
            required_edu = extract_required_education(job['Job_Description'])
            if required_edu and not any(req.lower() in ' '.join(resume_education).lower() for req in required_edu):
                education_match = False
            
            # Calculate match percentage based on multiple factors
            skill_score = len(job_skills) / max(1, len(resume_skills))
            exp_score = 1 if experience_match else 0.5
            edu_score = 1 if education_match else 0.5
            profile_score = similarity_scores[0][idx]
            
            match_score = (skill_score * 0.4 + exp_score * 0.3 + edu_score * 0.2 + profile_score * 0.1) * 100
            
            recommendations.append({
                'position': job['Position'],
                'company': job['Company'],
                'location': job['Location'],
                'description': job['Job_Description'],
                'match_score': round(match_score),
                'ats_score': ats_score,
                'matching_skills': list(job_skills),
                'experience_match': experience_match,
                'education_match': education_match
            })
        
        # Sort recommendations by match score
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Cache the recommendations
        if 'recommendation_cache' not in ats_scores:
            ats_scores['recommendation_cache'] = {}
        ats_scores['recommendation_cache'][resume_hash] = {
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }
        
        # Save cache to file
        with open(ats_scores_path, 'w') as f:
            json.dump(ats_scores, f)
        
        return recommendations
        
    except Exception as e:
        print(f"Error getting job recommendations: {e}")
        return []

def extract_required_experience(job_description):
    """Extract required years of experience from job description"""
    try:
        # Common patterns for experience requirements
        exp_patterns = [
            r'(\d+)[\+]?\s*(?:years?|yrs?)(?:\s+of)?\s+experience',
            r'experience\s*(?:of|:)?\s*(\d+)[\+]?\s*(?:years?|yrs?)',
            r'(\d+)[\+]?\s*(?:years?|yrs?)(?:\s+of)?\s+work\s+experience'
        ]
        
        job_desc_lower = job_description.lower()
        for pattern in exp_patterns:
            matches = re.findall(pattern, job_desc_lower)
            if matches:
                return int(matches[0])
        return None
    except:
        return None

def extract_required_education(job_description):
    """Extract required education from job description"""
    try:
        # Common education requirements
        edu_patterns = [
            "bachelor's degree", "bachelors degree", "b.s.", "b.a.",
            "master's degree", "masters degree", "m.s.", "m.a.",
            "phd", "ph.d.", "doctorate",
            "mba", "m.b.a."
        ]
        
        job_desc_lower = job_description.lower()
        required_edu = []
        for pattern in edu_patterns:
            if pattern in job_desc_lower:
                required_edu.append(pattern)
        return required_edu if required_edu else None
    except:
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the API is running"""
    return jsonify({'status': 'healthy'})

@app.route('/api/ats-score', methods=['POST'])
def save_ats_score():
    """Save ATS score for a resume"""
    try:
        data = request.json
        user_id = data.get('userId')
        resume_id = data.get('resumeId')
        score = data.get('score')
        feedback = data.get('feedback')
        
        if not all([user_id, resume_id, score, feedback]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Create unique key for the score
        score_key = f"{user_id}_{resume_id}"
        
        # Save score with timestamp
        ats_scores[score_key] = {
            'score': score,
            'feedback': feedback,
            'timestamp': datetime.datetime.now().isoformat(),
            'user_id': user_id,
            'resume_id': resume_id
        }
        
        # Save to file
        with open(ats_scores_path, 'w') as f:
            json.dump(ats_scores, f)
            
        return jsonify({
            'status': 'success',
            'message': 'ATS score saved successfully'
        })
        
    except Exception as e:
        print(f"Error saving ATS score: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ats-scores/<user_id>', methods=['GET'])
def get_user_ats_scores(user_id):
    """Get ATS scores for a user"""
    try:
        user_scores = {
            k: v for k, v in ats_scores.items()
            if v['user_id'] == user_id
        }
        return jsonify({
            'status': 'success',
            'scores': user_scores
        })
    except Exception as e:
        print(f"Error getting ATS scores: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/job-recommendation', methods=['POST'])
def job_recommendation():
    """API endpoint to get job recommendations based on uploaded resume"""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No resume file selected'}), 400
        
        # Save the file
        file_path = os.path.join(uploads_path, file.filename)
        file.save(file_path)
        
        try:
            # Parse resume using our enhanced parser
            parser = ResumeParser(file_path)
            resume_data = parser.get_extracted_data()
            
            if not resume_data.get('skills'):
                return jsonify({'error': 'No skills found in resume'}), 400
            
            # Generate resume hash
            resume_hash = generate_resume_hash(resume_data)
            
            # Check if we have cached results for this resume
            if resume_hash in ats_scores.get('analysis_cache', {}):
                cached_data = ats_scores['analysis_cache'][resume_hash]
                # Only use cache if it's less than 24 hours old
                cache_time = datetime.fromisoformat(cached_data['timestamp'])
                if (datetime.now() - cache_time).total_seconds() < 86400:  # 24 hours
                    return jsonify(cached_data['result'])
            
            # Get job recommendations
            user_id = request.form.get('userId')
            recommendations = get_job_recommendations(resume_data, user_id)
            
            # Calculate overall ATS score
            overall_ats_score = sum(rec['ats_score'] for rec in recommendations) / len(recommendations) if recommendations else 70
            
            # Generate feedback
            feedback = []
            
            # Skills feedback
            if resume_data.get('skills'):
                feedback.append({
                    'category': 'Skills',
                    'positive': f"Found {len(resume_data['skills'])} relevant skills",
                    'suggestion': "Consider adding more industry-specific keywords" if len(resume_data['skills']) < 10 else None
                })
            
            # Education feedback
            if resume_data.get('education'):
                feedback.append({
                    'category': 'Education',
                    'positive': "Education section properly formatted",
                    'suggestion': None
                })
            
            # Experience feedback
            if resume_data.get('total_experience'):
                feedback.append({
                    'category': 'Experience',
                    'positive': f"Found {resume_data['total_experience']} years of experience",
                    'suggestion': None
                })
            
            # Contact information feedback
            contact_info = []
            if resume_data.get('email'): contact_info.append('email')
            if resume_data.get('phone_number'): contact_info.append('phone')
            if contact_info:
                feedback.append({
                    'category': 'Contact Information',
                    'positive': f"Found {' and '.join(contact_info)}",
                    'suggestion': None if len(contact_info) == 2 else "Add missing contact information"
                })
            
            result = {
                'status': 'success',
                'recommendations': recommendations,
                'extracted_data': resume_data,
                'ats_score': overall_ats_score,
                'feedback': feedback
            }
            
            # Cache the analysis results
            if 'analysis_cache' not in ats_scores:
                ats_scores['analysis_cache'] = {}
            ats_scores['analysis_cache'][resume_hash] = {
                'result': result,
                'timestamp': datetime.now().isoformat()
            }
            
            # Save cache to file
            with open(ats_scores_path, 'w') as f:
                json.dump(ats_scores, f)
            
            return jsonify(result)
            
        finally:
            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
        
    except Exception as e:
        print(f"Error processing resume: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = jobs_df.head(100).to_dict('records')
        return jsonify({
            'status': 'success',
            'jobs': jobs
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/jobs/search', methods=['POST'])
def search_jobs():
    try:
        data = request.json
        search_term = data.get('searchTerm', '')
        
        # Simple search implementation
        filtered_jobs = jobs_df[
            jobs_df['title'].str.contains(search_term, case=False) |
            jobs_df['company'].str.contains(search_term, case=False)
        ].head(20).to_dict('records')
        
        return jsonify({
            'status': 'success',
            'jobs': filtered_jobs
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/jobs/add', methods=['POST'])
def add_job():
    try:
        job_data = request.json
        # In a real application, you would save this to a database
        # For now, we'll just return success
        return jsonify({
            'status': 'success',
            'message': 'Job added successfully'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/hr/jobs', methods=['GET'])
def get_hr_jobs():
    try:
        hr_id = request.args.get('hr_id')
        if not hr_id:
            return jsonify({'error': 'HR ID is required'}), 400
            
        # Get jobs for specific HR
        hr_specific_jobs = [job for job in hr_jobs['jobs'] if job.get('hr_id') == hr_id]
        return jsonify({
            'status': 'success',
            'jobs': hr_specific_jobs
        })
    except Exception as e:
        print(f"Error getting HR jobs: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/hr/jobs', methods=['POST'])
def add_hr_job():
    try:
        data = request.json
        hr_id = data.get('hr_id')
        
        if not hr_id:
            return jsonify({'error': 'HR ID is required'}), 400
            
        # Create new job with HR ID
        new_job = {
            'id': str(uuid.uuid4()),
            'hr_id': hr_id,
            'position': data.get('position'),
            'company': data.get('company'),
            'location': data.get('location'),
            'description': data.get('description'),
            'requirements': data.get('requirements'),
            'experienceLevel': data.get('experienceLevel'),
            'remote': data.get('remote', False),
            'datePosted': datetime.now().isoformat()
        }
        
        # Add to jobs list
        hr_jobs['jobs'].append(new_job)
        
        # Save to file
        with open(hr_jobs_path, 'w') as f:
            json.dump(hr_jobs, f)
            
        return jsonify({
            'status': 'success',
            'job': new_job
        })
    except Exception as e:
        print(f"Error adding HR job: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/hr/jobs/<job_id>', methods=['DELETE'])
def delete_hr_job():
    try:
        hr_id = request.args.get('hr_id')
        if not hr_id:
            return jsonify({'error': 'HR ID is required'}), 400
            
        # Find and remove job
        job_index = next((i for i, job in enumerate(hr_jobs['jobs']) 
                         if job['id'] == job_id and job['hr_id'] == hr_id), -1)
                         
        if job_index == -1:
            return jsonify({'error': 'Job not found or unauthorized'}), 404
            
        # Remove job
        hr_jobs['jobs'].pop(job_index)
        
        # Save to file
        with open(hr_jobs_path, 'w') as f:
            json.dump(hr_jobs, f)
            
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error deleting HR job: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
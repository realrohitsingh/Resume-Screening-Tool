from pyresparser import ResumeParser
from docx import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import re
import os
from ftfy import fix_text
from nltk.corpus import stopwords
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import spacy
import json

import nltk
nltk.download('stopwords')

stopw = set(stopwords.words('english'))

# Get the absolute path to the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up one level to the server directory
server_dir = os.path.dirname(current_dir)
# Path to the dataset
dataset_path = os.path.join(server_dir, 'job_final.csv')

df = pd.read_csv(dataset_path) 
df['test'] = df['Job_Description'].apply(lambda x: ' '.join([word for word in str(x).split() if len(word)>2 and word not in (stopw)]))

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Upload directory for resume files
UPLOAD_FOLDER = os.path.join(server_dir, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load job data
jobs_df = pd.read_csv(dataset_path)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the API is running"""
    return jsonify({'status': 'healthy'})

@app.route('/api/job-recommendation', methods=['POST'])
def job_recommendation():
    """API endpoint to get job recommendations based on uploaded resume"""
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No resume file selected'}), 400
    
    # Save the file to the upload directory
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    try:
        # Try to process as a DOCX file
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            # Load SpaCy model with disable options
            nlp = spacy.load('en_core_web_sm', disable=["parser", "ner"])
            data = ResumeParser(file_path, custom_nlp=nlp).get_extracted_data()
        except Exception as e:
            print(f"Error processing DOCX: {e}")
            data = ResumeParser(file_path).get_extracted_data()
        
        # Extract skills from resume
        resume = data['skills']
        
        # Process skills for recommendation
        skills = []
        skills.append(' '.join(word for word in resume))
        org_name_clean = skills
        
        # Define ngrams function
        def ngrams(string, n=3):
            string = fix_text(string)  # fix text
            string = string.encode("ascii", errors="ignore").decode()  # remove non ascii chars
            string = string.lower()
            chars_to_remove = [")","(",".","|","[","]","{","}","'"]
            rx = '[' + re.escape(''.join(chars_to_remove)) + ']'
            string = re.sub(rx, '', string)
            string = string.replace('&', 'and')
            string = string.replace(',', ' ')
            string = string.replace('-', ' ')
            string = string.title()  # normalise case - capital at start of each word
            string = re.sub(' +',' ',string).strip()  # get rid of multiple spaces and replace with a single
            string = ' '+ string +' '  # pad names for ngrams...
            string = re.sub(r'[,-./]|\sBD',r'', string)
            ngrams = zip(*[string[i:] for i in range(n)])
            return [''.join(ngram) for ngram in ngrams]
        
        # Vectorize skills
        vectorizer = TfidfVectorizer(min_df=1, analyzer=ngrams, lowercase=False)
        tfidf = vectorizer.fit_transform(org_name_clean)
        
        # Define nearest neighbor function
        def getNearestN(query):
            queryTFIDF_ = vectorizer.transform(query)
            distances, indices = nbrs.kneighbors(queryTFIDF_)
            return distances, indices
        
        # Fit nearest neighbors model
        nbrs = NearestNeighbors(n_neighbors=1, n_jobs=-1).fit(tfidf)
        unique_org = (df['test'].values)
        distances, indices = getNearestN(unique_org)
        
        # Process matches
        matches = []
        for i, j in enumerate(indices):
            dist = round(distances[i][0], 2)
            temp = [dist]
            matches.append(temp)
        
        matches = pd.DataFrame(matches, columns=['Match confidence'])
        df['match'] = matches['Match confidence']
        df1 = df.sort_values('match')
        df2 = df1[['Position', 'Company', 'Location']].head(10).reset_index()
        
        # Clean location data
        df2['Location'] = df2['Location'].str.replace(r'[^\x00-\x7F]', '')   
        df2['Location'] = df2['Location'].str.replace('-', '-')  # Replace any special dash with standard dash
        
        # Create list of jobs
        job_list = []
        for _, row in df2.iterrows():
            job_list.append({
                'position': row['Position'],
                'company': row['Company'],
                'location': row['Location']
            })
        
        # Get unique locations for filtering
        locations = sorted(df2['Location'].unique().tolist())
        
        # Return recommendations
        return jsonify({
            'jobs': job_list,
            'locations': locations,
            'skills_extracted': resume
        })
    
    except Exception as e:
        print(f"Error processing resume: {e}")
        return jsonify({'error': f'Failed to process resume: {str(e)}'}), 500

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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
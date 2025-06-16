# Job Recommendation System Backend

This is the backend server for the Job Recommendation System. It provides API endpoints for analyzing resumes and recommending suitable jobs based on the skills extracted.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Create a virtual environment (recommended):
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Download required NLTK data:
   ```
   python -c "import nltk; nltk.download('stopwords')"
   ```

5. Install SpaCy model:
   ```
   python -m spacy download en_core_web_sm
   ```

## Running the server

1. Make sure you're in the server directory:
   ```
   cd server
   ```

2. Start the Flask server:
   ```
   python api/job_api.py
   ```

3. The server will start on `http://localhost:5000` by default.

## API Endpoints

### Health Check

- URL: `/api/health`
- Method: `GET`
- Response: `{ "status": "healthy" }`

### Job Recommendation

- URL: `/api/job-recommendation`
- Method: `POST`
- Body: Form data with a file field named `resume` (PDF or DOCX)
- Response: 
  ```json
  {
    "jobs": [
      {
        "position": "Software Developer",
        "company": "Tech Company",
        "location": "New York, NY"
      },
      ...
    ],
    "locations": ["New York, NY", "Remote", ...],
    "skills_extracted": ["python", "javascript", ...]
  }
  ```

## Troubleshooting

- If you encounter issues with SpaCy, try running:
  ```
  pip uninstall -y spacy
  pip install spacy==2.3.9
  python -m spacy download en_core_web_sm
  ```

- If PyResParser installation fails, you might need to install additional system dependencies. On Windows, ensure you have Visual C++ Build Tools installed.

## Project Structure

- `/api` - Contains the Flask API code
- `/uploads` - Directory where uploaded resumes are stored
- `job_final.csv` - Dataset containing job listings 
# Resume Builder and Job Recommendation System

This project is a comprehensive resume builder and job recommendation system that helps users create professional resumes and find matching job opportunities based on their skills and preferences.

## Features

- **Resume Builder**: Create professional resumes with customizable templates
- **Resume Parser**: Extract information from existing resumes
- **Job Recommendations**: Get personalized job suggestions based on your skills
- **AI-Powered Analysis**: Receive insights and suggestions to improve your job prospects

## Project Structure

- `src/` - Frontend React application
- `server/` - Backend Flask API for job recommendations

## Technologies Used

### Frontend
- React
- Vite
- React Router
- CSS3

### Backend
- Flask (Python)
- scikit-learn
- PyResParser
- NLTK & SpaCy for NLP

## Getting Started

### Quick Start (Windows)

For Windows users, we've provided a batch file to easily start both the frontend and backend servers:

1. Simply double-click the `start_app.bat` file
2. The script will:
   - Create a Python virtual environment if it doesn't exist
   - Install backend dependencies
   - Start the Flask server
   - Start the React development server
3. Open your browser and navigate to `http://localhost:5173`

### Manual Setup

#### Prerequisites
- Node.js (v14+)
- npm or yarn
- Python 3.8+
- pip

#### Running the Frontend

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

#### Running the Backend

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Setup required NLP components:
   ```
   python -c "import nltk; nltk.download('stopwords')"
   python -m spacy download en_core_web_sm
   ```

5. Start the Flask server:
   ```
   python api/job_api.py
   ```

6. The API will be available at `http://localhost:5000`

## How to Use

1. **Upload Resume**: Upload your existing resume (PDF or DOCX) on the Upload Resume page
2. **Get Recommendations**: Fill in your preferences and get AI-powered job recommendations
3. **Create New Resume**: Create a new resume from scratch using our templates
4. **Export and Share**: Download your resume in PDF format or share it directly

## Integration Details

The Job Recommendation System was integrated from an external project. Key integration points:
- Resume parsing functionality using PyResParser
- Job matching using TF-IDF vectorization and nearest neighbor algorithms
- Frontend-backend communication via REST API

## Troubleshooting

If you encounter any issues:
1. Make sure all dependencies are installed correctly
2. Check that both servers are running
3. Verify that port 5000 (backend) and port 5173 (frontend) are not being used by other applications

For Windows users experiencing issues with Python dependencies, you may need to install Visual C++ Build Tools:
- Download and install from [Visual Studio Downloads](https://visualstudio.microsoft.com/downloads/) (select "Build Tools")

## License

This project is licensed under the MIT License - see the LICENSE file for details. 


## 🚀 Live Demo

You can see my website live here:
https://resume-screening-tool-hz91.vercel.app/

I have hosted this project on Vercel, which means it is fast, easy to access, and always up to date.
Feel free to visit the website to try out the Resume Screening Tool and see how it works in real time.
No need to install anything—just open the link and explore the features!


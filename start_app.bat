@echo off
echo Starting the Resume Builder and Job Recommendation System...

cd server

echo === Setting up Python virtual environment ===
python -m venv venv
call venv\Scripts\activate

echo === Installing Python dependencies for the backend ===
pip install -r requirements.txt

echo === Installing NLTK data ===
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

echo === Installing spaCy model ===
python -m spacy download en_core_web_sm

echo === Starting the backend server ===
start cmd /k "cd server && venv\Scripts\python api/job_api.py"

cd ..

echo === Installing frontend dependencies ===
call npm install

echo === Starting the frontend server ===
start cmd /k "npm run dev"

echo Both servers are starting up...
echo - Frontend will be available at: http://localhost:5173
echo - Backend API will be available at: http://localhost:5000

echo Press any key to close this window...
pause 
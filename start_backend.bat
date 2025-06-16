@echo off
echo Starting the Backend Server...

cd server

echo === Setting up Python virtual environment ===
python -m venv venv
call venv\Scripts\activate

echo === Installing Python dependencies ===
pip install -r requirements.txt

echo === Installing NLTK data ===
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

echo === Installing spaCy model ===
python -m spacy download en_core_web_sm

echo === Starting the Flask server ===
python api/job_api.py 
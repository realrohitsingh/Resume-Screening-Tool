from resume_parser import ResumeParser
import os

def test_parser():
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to a sample resume (you'll need to provide a resume file)
    resume_path = os.path.join(current_dir, '..', 'pyresparser-master', 'OmkarResume.pdf')
    
    if not os.path.exists(resume_path):
        print(f"Resume file not found at: {resume_path}")
        return
    
    # Parse the resume
    parser = ResumeParser(resume_path)
    data = parser.get_extracted_data()
    
    # Print the extracted information
    print("\nExtracted Information:")
    print("=====================")
    for key, value in data.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    test_parser() 
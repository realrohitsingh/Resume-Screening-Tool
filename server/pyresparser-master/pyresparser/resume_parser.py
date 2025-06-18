# Author: Omkar Pathak

import os
import multiprocessing as mp
import io
import spacy
import pprint
import logging
import pandas as pd
from spacy.matcher import Matcher
from . import utils
from spacy.tokens import Doc
from typing import Dict, List


class ResumeParser(object):

    def __init__(
        self,
        resume: str,
        skills_file: str = None,
        custom_regex: Dict = None
    ):
        """
        Args:
            resume (str): path to resume file
            skills_file (str): path to skills file (optional)
            custom_regex (Dict): custom regex patterns (optional)
        """
        print("Initializing ResumeParser...")
        self.__resume = resume
        self.__skills_file = skills_file or os.path.join(os.path.dirname(__file__), 'skills.csv')
        self.__custom_regex = custom_regex
        self.__text = ''
        print("Loading spaCy model...")
        self.__nlp = spacy.load('en_core_web_sm')
        print("Creating Matcher...")
        self.__matcher = Matcher(self.__nlp.vocab)
        self.__details = {
            'name': None,
            'email': None,
            'mobile_number': None,
            'skills': None,
            'college_name': None,
            'degree': None,
            'designation': None,
            'experience': None,
            'company_names': None,
            'no_of_pages': None,
            'total_experience': None,
        }
        self.__resume_sections = {}
        self.__resume_labels = {}
        self.__resume_patterns = {}
        print("Loading config...")
        self.load_config()
        print("Initialization complete.")

    def load_config(self):
        """Load configuration from config.cfg file"""
        import configparser
        config = configparser.ConfigParser()
        config_path = os.path.join(os.path.dirname(__file__), 'config.cfg')
        print(f"Loading config from {config_path}")
        config.read(config_path)

        self.__resume_sections = dict(config.items('resume_sections'))
        self.__resume_labels = dict(config.items('resume_labels'))
        self.__resume_patterns = dict(config.items('resume_patterns'))
        print("Config loaded successfully.")

    def get_extracted_data(self) -> Dict:
        """
        Extract data from resume
        Returns:
            Dict: dictionary containing extracted data
        """
        try:
            print(f"Extracting text from {self.__resume}")
            text = utils.extract_text(self.__resume, os.path.splitext(self.__resume)[1])
            print("Text extracted successfully.")
            self.__text = ' '.join(text.split())
            print("Processing text with spaCy...")
            self.__nlp_text = self.__nlp(self.__text)
            print("Getting basic details...")
            self.__get_basic_details()
            print("Getting skills...")
            self.__get_skills()
            print("Getting education...")
            self.__get_education()
            print("Getting experience...")
            self.__get_experience()
            print("Extraction complete.")
            return self.__details
        except Exception as e:
            print(f"Error in extracting data: {str(e)}")
            logging.error(f'Error in extracting data from resume: {str(e)}')
            return self.__details

    def __get_basic_details(self):
        """Extract basic details from resume"""
        try:
            # Extract name
            for ent in self.__nlp_text.ents:
                if ent.label_ == 'PERSON':
                    self.__details['name'] = ent.text
                    break

            # Extract email
            self.__details['email'] = utils.extract_email(self.__text)

            # Extract mobile number
            self.__details['mobile_number'] = utils.extract_mobile_number(self.__text, self.__resume_patterns.get('phone', None))

            # Extract number of pages
            self.__details['no_of_pages'] = utils.get_number_of_pages(self.__resume)

        except Exception as e:
            print(f"Error in extracting basic details: {str(e)}")
            logging.error(f'Error in extracting basic details: {str(e)}')

    def __get_skills(self):
        """Extract skills from resume"""
        try:
            if self.__skills_file:
                print(f"Loading skills from {self.__skills_file}")
                skills = pd.read_csv(self.__skills_file)
                skills['Skill'] = skills['Skill'].apply(lambda x: x.lower())
                skills_list = list(skills['Skill'])
            else:
                print("No skills file provided.")
                skills_list = []

            # Extract skills
            self.__details['skills'] = utils.extract_skills(
                self.__nlp_text,
                skills_list
            )

        except Exception as e:
            print(f"Error in extracting skills: {str(e)}")
            logging.error(f'Error in extracting skills: {str(e)}')

    def __get_education(self):
        """Extract education from resume"""
        try:
            # Extract education
            education = utils.extract_education(self.__nlp_text)
            if education:
                self.__details['college_name'] = education.get('college_name', None)
                self.__details['degree'] = education.get('degree', None)

        except Exception as e:
            print(f"Error in extracting education: {str(e)}")
            logging.error(f'Error in extracting education: {str(e)}')

    def __get_experience(self):
        """Extract experience from resume"""
        try:
            # Extract experience
            experience = utils.extract_experience(self.__nlp_text)
            if experience:
                self.__details['designation'] = experience.get('designation', None)
                self.__details['company_names'] = experience.get('company_names', None)
                self.__details['experience'] = experience.get('experience', None)
                self.__details['total_experience'] = experience.get('total_experience', None)

        except Exception as e:
            print(f"Error in extracting experience: {str(e)}")
            logging.error(f'Error in extracting experience: {str(e)}')


def resume_result_wrapper(resume):
    parser = ResumeParser(resume)
    return parser.get_extracted_data()


if __name__ == '__main__':
    pool = mp.Pool(mp.cpu_count())

    resumes = []
    data = []
    for root, directories, filenames in os.walk('resumes/'):
        for filename in filenames:
            file = os.path.join(root, filename)
            resumes.append(file)

    results = [
        pool.apply_async(
            resume_result_wrapper,
            args=(x,)
        ) for x in resumes
    ]

    results = [p.get() for p in results]

    pprint.pprint(results)

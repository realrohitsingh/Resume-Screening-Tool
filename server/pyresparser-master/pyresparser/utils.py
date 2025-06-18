# Author: Omkar Pathak

import io
import os
import re
import nltk
import spacy
import pandas as pd
import docx2txt
import logging
from datetime import datetime
from dateutil import relativedelta
from . import constants as cs
from pdfminer.converter import TextConverter
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.layout import LAParams
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfparser import PDFSyntaxError
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from spacy.matcher import Matcher

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

def extract_text_from_pdf(pdf_path):
    '''
    Helper function to extract the plain text from .pdf files

    :param pdf_path: path to PDF file to be extracted (remote or local)
    :return: iterator of string of extracted text
    '''
    # https://www.blog.pythonlibrary.org/2018/05/03/exporting-data-from-pdfs-with-python/
    if not isinstance(pdf_path, io.BytesIO):
        # extract text from local pdf file
        with open(pdf_path, 'rb') as fh:
            try:
                for page in PDFPage.get_pages(
                        fh,
                        caching=True,
                        check_extractable=True
                ):
                    resource_manager = PDFResourceManager()
                    fake_file_handle = io.StringIO()
                    converter = TextConverter(
                        resource_manager,
                        fake_file_handle,
                        codec='utf-8',
                        laparams=LAParams()
                    )
                    page_interpreter = PDFPageInterpreter(
                        resource_manager,
                        converter
                    )
                    page_interpreter.process_page(page)

                    text = fake_file_handle.getvalue()
                    yield text

                    # close open handles
                    converter.close()
                    fake_file_handle.close()
            except PDFSyntaxError:
                return
    else:
        # extract text from remote pdf file
        try:
            for page in PDFPage.get_pages(
                    pdf_path,
                    caching=True,
                    check_extractable=True
            ):
                resource_manager = PDFResourceManager()
                fake_file_handle = io.StringIO()
                converter = TextConverter(
                    resource_manager,
                    fake_file_handle,
                    codec='utf-8',
                    laparams=LAParams()
                )
                page_interpreter = PDFPageInterpreter(
                    resource_manager,
                    converter
                )
                page_interpreter.process_page(page)

                text = fake_file_handle.getvalue()
                yield text

                # close open handles
                converter.close()
                fake_file_handle.close()
        except PDFSyntaxError:
            return


def get_number_of_pages(file_name):
    try:
        if isinstance(file_name, io.BytesIO):
            # for remote pdf file
            count = 0
            for page in PDFPage.get_pages(
                        file_name,
                        caching=True,
                        check_extractable=True
            ):
                count += 1
            return count
        else:
            # for local pdf file
            if file_name.endswith('.pdf'):
                count = 0
                with open(file_name, 'rb') as fh:
                    for page in PDFPage.get_pages(
                            fh,
                            caching=True,
                            check_extractable=True
                    ):
                        count += 1
                return count
            else:
                return None
    except PDFSyntaxError:
        return None


def extract_text_from_docx(doc_path):
    '''
    Helper function to extract plain text from .docx files

    :param doc_path: path to .docx file to be extracted
    :return: string of extracted text
    '''
    try:
        temp = docx2txt.process(doc_path)
        text = [line.replace('\t', ' ') for line in temp.split('\n') if line]
        return ' '.join(text)
    except KeyError:
        return ' '


def extract_text_from_doc(doc_path):
    '''
    Helper function to extract plain text from .doc files

    :param doc_path: path to .doc file to be extracted
    :return: string of extracted text
    '''
    try:
        try:
            import textract
        except ImportError:
            return ' '
        text = textract.process(doc_path).decode('utf-8')
        return text
    except KeyError:
        return ' '


def extract_text(file_path, extension):
    '''
    Wrapper function to detect the file extension and call text
    extraction function accordingly

    :param file_path: path of file of which text is to be extracted
    :param extension: extension of file `file_name`
    '''
    text = ''
    if extension == '.pdf':
        for page in extract_text_from_pdf(file_path):
            text += ' ' + page
    elif extension == '.docx':
        text = extract_text_from_docx(file_path)
    elif extension == '.doc':
        text = extract_text_from_doc(file_path)
    return text


def extract_entity_sections_grad(text):
    '''
    Helper function to extract all the raw text from sections of
    resume specifically for graduates and undergraduates

    :param text: Raw text of resume
    :return: dictionary of entities
    '''
    text_split = [i.strip() for i in text.split('\n')]
    # sections_in_resume = [i for i in text_split if i.lower() in sections]
    entities = {}
    key = False
    for phrase in text_split:
        if len(phrase) == 1:
            p_key = phrase
        else:
            p_key = set(phrase.lower().split()) & set(cs.RESUME_SECTIONS_GRAD)
        try:
            p_key = list(p_key)[0]
        except IndexError:
            pass
        if p_key in cs.RESUME_SECTIONS_GRAD:
            entities[p_key] = []
            key = p_key
        elif key and phrase.strip():
            entities[key].append(phrase)

    # entity_key = False
    # for entity in entities.keys():
    #     sub_entities = {}
    #     for entry in entities[entity]:
    #         if u'\u2022' not in entry:
    #             sub_entities[entry] = []
    #             entity_key = entry
    #         elif entity_key:
    #             sub_entities[entity_key].append(entry)
    #     entities[entity] = sub_entities

    # pprint.pprint(entities)

    # make entities that are not found None
    # for entity in cs.RESUME_SECTIONS:
    #     if entity not in entities.keys():
    #         entities[entity] = None
    return entities


def extract_entities_wih_custom_model(custom_nlp_text):
    '''
    Helper function to extract different entities with custom
    trained model using SpaCy's NER

    :param custom_nlp_text: object of `spacy.tokens.doc.Doc`
    :return: dictionary of entities
    '''
    entities = {}
    for ent in custom_nlp_text.ents:
        if ent.label_ not in entities.keys():
            entities[ent.label_] = [ent.text]
        else:
            entities[ent.label_].append(ent.text)
    for key in entities.keys():
        entities[key] = list(set(entities[key]))
    return entities


def get_total_experience(experience_list):
    '''
    Wrapper function to extract total months of experience from a resume

    :param experience_list: list of experience text extracted
    :return: total months of experience
    '''
    exp_ = []
    for line in experience_list:
        experience = re.search(
            r'(?P<fmonth>\w+.\d+)\s*(\D|to)\s*(?P<smonth>\w+.\d+|present)',
            line,
            re.I
        )
        if experience:
            exp_.append(experience.groups())
    total_exp = sum(
        [get_number_of_months_from_dates(i[0], i[2]) for i in exp_]
    )
    total_experience_in_months = total_exp
    return total_experience_in_months


def get_number_of_months_from_dates(date1, date2):
    '''
    Helper function to extract total months of experience from a resume

    :param date1: Starting date
    :param date2: Ending date
    :return: months of experience from date1 to date2
    '''
    if date2.lower() == 'present':
        date2 = datetime.now().strftime('%b %Y')
    try:
        if len(date1.split()[0]) > 3:
            date1 = date1.split()
            date1 = date1[0][:3] + ' ' + date1[1]
        if len(date2.split()[0]) > 3:
            date2 = date2.split()
            date2 = date2[0][:3] + ' ' + date2[1]
    except IndexError:
        return 0
    try:
        date1 = datetime.strptime(str(date1), '%b %Y')
        date2 = datetime.strptime(str(date2), '%b %Y')
        months_of_experience = relativedelta.relativedelta(date2, date1)
        months_of_experience = (months_of_experience.years
                                * 12 + months_of_experience.months)
    except ValueError:
        return 0
    return months_of_experience


def extract_entity_sections_professional(text):
    '''
    Helper function to extract all the raw text from sections of
    resume specifically for professionals

    :param text: Raw text of resume
    :return: dictionary of entities
    '''
    text_split = [i.strip() for i in text.split('\n')]
    entities = {}
    key = False
    for phrase in text_split:
        if len(phrase) == 1:
            p_key = phrase
        else:
            p_key = set(phrase.lower().split()) \
                    & set(cs.RESUME_SECTIONS_PROFESSIONAL)
        try:
            p_key = list(p_key)[0]
        except IndexError:
            pass
        if p_key in cs.RESUME_SECTIONS_PROFESSIONAL:
            entities[p_key] = []
            key = p_key
        elif key and phrase.strip():
            entities[key].append(phrase)
    return entities


def extract_email(text):
    '''
    Helper function to extract email id from text

    :param text: plain text extracted from resume file
    '''
    email = re.findall(r"([^@|\s]+@[^@]+\.[^@|\s]+)", text)
    if email:
        try:
            return email[0].split()[0].strip(';')
        except IndexError:
            return None


def extract_name(nlp_text, matcher):
    '''
    Helper function to extract name from spacy nlp text

    :param nlp_text: object of `spacy.tokens.doc.Doc`
    :param matcher: object of `spacy.matcher.Matcher`
    :return: string of full name
    '''
    pattern = [cs.NAME_PATTERN]

    matcher.add('NAME', None, *pattern)

    matches = matcher(nlp_text)

    for _, start, end in matches:
        span = nlp_text[start:end]
        if 'name' not in span.text.lower():
            return span.text


def extract_mobile_number(text, custom_regex=None):
    '''
    Helper function to extract mobile number from text

    :param text: plain text extracted from resume file
    :return: string of extracted mobile numbers
    '''
    # Found this complicated regex on :
    # https://zapier.com/blog/extract-links-email-phone-regex/
    # mob_num_regex = r'''(?:(?:\+?([1-9]|[0-9][0-9]|
    #     [0-9][0-9][0-9])\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|
    #     [2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([0-9][1-9]|
    #     [0-9]1[02-9]|[2-9][02-8]1|
    #     [2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|
    #     [2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{7})
    #     (?:\s*(?:#|x\.?|ext\.?|
    #     extension)\s*(\d+))?'''
    if not custom_regex:
        mob_num_regex = r'''(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)
                        [-\.\s]*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})'''
        phone = re.findall(re.compile(mob_num_regex), text)
    else:
        phone = re.findall(re.compile(custom_regex), text)
    if phone:
        number = ''.join(phone[0])
        return number


def extract_skills(nlp_text, skills_list):
    """
    Extract skills from spacy nlp text
    """
    tokens = [token.text.lower() for token in nlp_text]
    skills = []
    
    # check for one-grams
    for token in tokens:
        if token.lower() in skills_list:
            skills.append(token)
    
    # check for bi-grams and tri-grams
    for i in range(len(tokens) - 1):
        if ' '.join(tokens[i:i+2]).lower() in skills_list:
            skills.append(' '.join(tokens[i:i+2]))
    for i in range(len(tokens) - 2):
        if ' '.join(tokens[i:i+3]).lower() in skills_list:
            skills.append(' '.join(tokens[i:i+3]))
    
    return list(set(skills))


def cleanup(token, lower=True):
    if lower:
        token = token.lower()
    return token.strip()


def clean_text(text):
    """
    Clean text by removing unnecessary whitespace and newlines
    """
    text = re.sub(r'[\n\r]+', ' ', text)  # Replace newlines with space
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with single space
    return text.strip()


def clean_name(text):
    """
    Clean name by removing titles and unnecessary words
    """
    # Remove common titles
    text = re.sub(r'\b(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*', '', text)
    # Remove any parentheses and their contents
    text = re.sub(r'\([^)]*\)', '', text)
    return clean_text(text)


def clean_education(text):
    """
    Clean education text by removing unnecessary information
    """
    # Remove dates
    text = re.sub(r'\b\d{1,2}/\d{4}\s*[-–]\s*(?:Present|Current|\d{1,2}/\d{4})\b', '', text)
    text = re.sub(r'\b(?:0[1-9]|1[0-2])/\d{4}\b', '', text)  # MM/YYYY format
    
    # Remove common section headers
    text = re.sub(r'\b(?:EDUCATION|Education):', '', text)
    
    # Remove role information
    text = re.sub(r'(?:Event Management Lead|Club Governer|Coding Club).*$', '', text)
    
    # Remove any text after degree information
    degree_pattern = r'(?:B\.Tech|M\.Tech|B\.E|M\.E|Bachelor|Master|PhD)'
    match = re.search(degree_pattern, text, re.IGNORECASE)
    if match:
        end_idx = match.end()
        # Include the field of study if present
        field_match = re.search(r'\s*[-]\s*\w+(?:\s+\w+)*', text[end_idx:])
        if field_match:
            end_idx += field_match.end()
        text = text[:end_idx]
    
    # Clean up whitespace and remove any remaining unnecessary characters
    text = re.sub(r'[^\w\s,.-]', '', text)  # Keep only word chars, spaces, commas, dots, and hyphens
    text = clean_text(text)
    
    return text


def clean_company_name(text):
    """
    Clean company name by removing common words and punctuation
    """
    # Remove common words that aren't part of company names
    remove_words = ['PROFILE', 'PROJECTS', 'PROJECT', 'EXPERIENCE', 'WORK', 'EMPLOYMENT']
    for word in remove_words:
        text = re.sub(r'\b' + word + r'\b', '', text, flags=re.IGNORECASE)
    return clean_text(text)


def extract_education(nlp_text):
    """
    Extract education from spacy nlp text
    """
    edu = {}
    
    # Common education-related keywords
    degree_keywords = [
        'bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'm.e',
        'b.s', 'm.s', 'b.a', 'm.a', 'bachelor of technology', 'master of technology',
        'bachelor of engineering', 'master of engineering', 'bachelor of science',
        'master of science', 'bachelor of arts', 'master of arts'
    ]
    
    institution_keywords = [
        'college', 'university', 'institute', 'school', 'academy',
        'polytechnic', 'campus'
    ]

    # Extract education degree
    try:
        for sent in nltk.sent_tokenize(nlp_text.text):
            sent_lower = sent.lower()
            if any(keyword in sent_lower for keyword in degree_keywords):
                # Extract the specific degree
                for keyword in degree_keywords:
                    if keyword in sent_lower:
                        # Get the sentence containing the degree
                        start_idx = max(0, sent_lower.find(keyword) - 50)
                        end_idx = min(len(sent_lower), sent_lower.find(keyword) + 100)
                        degree_context = sent[start_idx:end_idx].strip()
                        edu['degree'] = clean_education(degree_context)
                        break
                break
    except Exception:
        pass

    # Extract college name
    try:
        for sent in nltk.sent_tokenize(nlp_text.text):
            sent_lower = sent.lower()
            if any(keyword in sent_lower for keyword in institution_keywords):
                # Extract the specific institution
                for keyword in institution_keywords:
                    if keyword in sent_lower:
                        # Get the sentence containing the institution
                        start_idx = max(0, sent_lower.find(keyword) - 50)
                        end_idx = min(len(sent_lower), sent_lower.find(keyword) + 100)
                        institution_context = sent[start_idx:end_idx].strip()
                        edu['college_name'] = clean_education(institution_context)
                        break
                break
    except Exception:
        pass

    return edu


def extract_experience(nlp_text):
    """
    Extract experience from spacy nlp text
    """
    exp = {}
    
    # Common job title keywords
    job_titles = [
        'engineer', 'developer', 'manager', 'analyst', 'consultant',
        'specialist', 'director', 'coordinator', 'administrator', 'supervisor',
        'lead', 'architect', 'designer', 'researcher', 'intern', 'trainee'
    ]

    # Extract designation
    try:
        for ent in nlp_text.ents:
            if ent.label_ == 'ORG':  # organizations can often be job titles
                text_lower = ent.text.lower()
                if any(title in text_lower for title in job_titles):
                    exp['designation'] = clean_text(ent.text)
                    break
        
        # If no designation found from entities, try from job title keywords
        if 'designation' not in exp:
            for sent in nltk.sent_tokenize(nlp_text.text):
                sent_lower = sent.lower()
                for title in job_titles:
                    if title in sent_lower:
                        # Get the sentence containing the job title
                        start_idx = max(0, sent_lower.find(title) - 30)
                        end_idx = min(len(sent_lower), sent_lower.find(title) + 50)
                        title_context = sent[start_idx:end_idx].strip()
                        exp['designation'] = clean_text(title_context)
                        break
                if 'designation' in exp:
                    break
    except Exception:
        pass

    # Extract company names
    try:
        companies = []
        for ent in nlp_text.ents:
            if ent.label_ == 'ORG':  # organizations
                # Filter out common false positives
                if not any(x in ent.text.lower() for x in ['university', 'college', 'school', 'institute']):
                    clean_company = clean_company_name(ent.text)
                    if clean_company:  # Only add if not empty after cleaning
                        companies.append(clean_company)
        if companies:
            exp['company_names'] = list(set(companies))  # Remove duplicates
    except Exception:
        pass

    # Extract experience duration
    try:
        experience = []
        for sent in nltk.sent_tokenize(nlp_text.text):
            # Look for date patterns
            if re.search(r'(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}', sent.lower()):
                # Also check if the sentence contains work-related keywords
                if any(word in sent.lower() for word in ['work', 'job', 'employ', 'position', 'role']):
                    experience.append(clean_text(sent))
        if experience:
            exp['experience'] = experience
            
            # Calculate total experience
            dates = []
            for text in experience:
                matches = re.findall(r'(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}', text.lower())
                for match in matches:
                    try:
                        date = datetime.strptime(match, '%B %Y')
                        dates.append(date)
                    except ValueError:
                        try:
                            date = datetime.strptime(match, '%b %Y')
                            dates.append(date)
                        except ValueError:
                            pass
            
            if len(dates) >= 2:
                dates.sort()
                total_experience = relativedelta.relativedelta(dates[-1], dates[0])
                exp['total_experience'] = total_experience.years + (total_experience.months / 12.0)
    except Exception:
        pass

    return exp

from setuptools import setup, find_packages
from os import path

here = path.abspath(path.dirname(__file__))

setup(
    name='pyresparser',
    version='1.0.6',
    description='Resume Parser and Analyzer',
    long_description=open('README.md', encoding='utf-8').read(),
    url='https://github.com/OmkarPathak/pyresparser',
    author='Omkar Pathak',
    author_email='omkarpathak27@gmail.com',
    license='GPL-3.0',
    include_package_data=True,
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Libraries',
        'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
    ],
    keywords='resume parser analyzer',
    packages=find_packages(),
    install_requires=[
        'spacy>=2.3.5',
        'nltk>=3.5',
        'pandas>=1.1.4',
        'pdfminer.six>=20200726',
        'docx2txt>=0.8',
        'phonenumbers>=8.12.13',
        'pyyaml>=5.3.1',
    ],
    zip_safe=False,
    entry_points = {
        'console_scripts': ['pyresparser=pyresparser.command_line:main'],
    }
)
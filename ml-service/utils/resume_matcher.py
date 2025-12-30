import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import numpy as np


class ResumeMatcher:
    """
    NLP-based resume matching system using Spacy and Scikit-learn
    """
    
    def __init__(self):
        """Initialize the matcher with Spacy model"""
        try:
            # Load medium English model for better word vectors
            self.nlp = spacy.load("en_core_web_md")
        except Exception as e:
            print(f"Error loading Spacy model: {e}")
            print("Please download the model using: python -m spacy download en_core_web_md")
            self.nlp = None
    
    def preprocess_text(self, text):
        """
        Preprocess text: lowercase, remove stopwords, lemmatization
        """
        if not self.nlp or not text:
            return text.lower()
        
        doc = self.nlp(text.lower())
        
        # Remove stopwords and lemmatize
        tokens = [token.lemma_ for token in doc 
                 if not token.is_stop and not token.is_punct and len(token.text) > 2]
        
        return " ".join(tokens)
    
    def extract_skills(self, text):
        """
        Extract potential skills from text (simple keyword-based approach)
        """
        # Common tech skills keywords
        tech_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node',
            'nodejs', 'express', 'django', 'flask', 'fastapi', 'mongodb', 'sql',
            'mysql', 'postgresql', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
            'git', 'machine learning', 'deep learning', 'nlp', 'tensorflow',
            'pytorch', 'scikit-learn', 'pandas', 'numpy', 'html', 'css', 'typescript',
            'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin', 'redux',
            'bootstrap', 'tailwind', 'sass', 'webpack', 'api', 'rest', 'graphql',
            'agile', 'scrum', 'ci/cd', 'devops', 'linux', 'bash', 'junit', 'jest'
        ]
        
        text_lower = text.lower()
        found_skills = set()
        
        for skill in tech_skills:
            if skill in text_lower:
                found_skills.add(skill)
        
        return found_skills
    
    def calculate_tfidf_similarity(self, resume_text, job_description):
        """
        Calculate TF-IDF based cosine similarity
        """
        try:
            # Preprocess texts
            resume_processed = self.preprocess_text(resume_text)
            job_processed = self.preprocess_text(job_description)
            
            # Create TF-IDF vectorizer
            vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
            
            # Fit and transform both texts
            tfidf_matrix = vectorizer.fit_transform([resume_processed, job_processed])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return similarity
        except Exception as e:
            print(f"Error calculating TF-IDF similarity: {e}")
            return 0.0
    
    def calculate_semantic_similarity(self, resume_text, job_description):
        """
        Calculate semantic similarity using Spacy word vectors
        """
        if not self.nlp:
            return 0.0
        
        try:
            doc1 = self.nlp(resume_text[:1000000])  # Limit text length for performance
            doc2 = self.nlp(job_description[:1000000])
            
            similarity = doc1.similarity(doc2)
            return similarity
        except Exception as e:
            print(f"Error calculating semantic similarity: {e}")
            return 0.0
    
    def calculate_skill_match(self, resume_text, job_description):
        """
        Calculate skill match percentage
        """
        resume_skills = self.extract_skills(resume_text)
        job_skills = self.extract_skills(job_description)
        
        if not job_skills:
            return 0.0
        
        matching_skills = resume_skills.intersection(job_skills)
        skill_match_score = len(matching_skills) / len(job_skills)
        
        return skill_match_score
    
    def calculate_keyword_density(self, resume_text, job_description):
        """
        Calculate how many important keywords from job description appear in resume
        """
        # Extract important words from job description
        job_doc = self.nlp(job_description.lower()) if self.nlp else None
        
        if job_doc:
            # Get keywords (nouns, proper nouns, adjectives)
            keywords = [token.text for token in job_doc 
                       if token.pos_ in ['NOUN', 'PROPN', 'ADJ'] and len(token.text) > 3]
        else:
            # Fallback: simple word extraction
            keywords = [word for word in job_description.lower().split() if len(word) > 3]
        
        if not keywords:
            return 0.0
        
        resume_lower = resume_text.lower()
        matches = sum(1 for keyword in keywords if keyword in resume_lower)
        
        return matches / len(keywords)
    
    def calculate_match_score(self, resume_text, job_description):
        """
        Calculate overall match score (0-100) using multiple algorithms
        """
        if not resume_text or not job_description:
            return 0
        
        # Calculate different similarity metrics
        tfidf_score = self.calculate_tfidf_similarity(resume_text, job_description)
        semantic_score = self.calculate_semantic_similarity(resume_text, job_description)
        skill_score = self.calculate_skill_match(resume_text, job_description)
        keyword_score = self.calculate_keyword_density(resume_text, job_description)
        
        # Weighted average of different scores
        weights = {
            'tfidf': 0.30,      # 30% - TF-IDF similarity
            'semantic': 0.25,   # 25% - Semantic similarity
            'skills': 0.30,     # 30% - Skill matching
            'keywords': 0.15    # 15% - Keyword density
        }
        
        final_score = (
            tfidf_score * weights['tfidf'] +
            semantic_score * weights['semantic'] +
            skill_score * weights['skills'] +
            keyword_score * weights['keywords']
        )
        
        # Convert to 0-100 scale
        final_score = round(final_score * 100, 2)
        
        # Ensure score is within bounds
        final_score = max(0, min(100, final_score))
        
        return final_score


# Create a global instance
matcher = ResumeMatcher()

import spacy
import pdfminer.high_level
import docx2txt
import json
import re

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Predefined list of relevant skills (extend this list)
TECH_SKILLS = {
    "Python", "Java", "JavaScript", "React", "Node.js", "MongoDB", "SQL", "AWS",
    "Docker", "Kubernetes", "Machine Learning", "Deep Learning", "NLP",
    "TensorFlow", "PyTorch", "Flask", "Django", "Golang", "Data Science",
    "Hadoop", "Spark", "Tableau", "Power BI"
}

def extract_text(file_path):
    """Extract text from PDF or DOCX files."""
    if file_path.endswith(".pdf"):
        return pdfminer.high_level.extract_text(file_path)
    elif file_path.endswith(".docx"):
        return docx2txt.process(file_path)
    else:
        return None  # Unsupported file formatā

def extract_skills_experience(text):
    """Extract relevant skills and experience using spaCy & regex."""
    doc = nlp(text)

    # Extract potential skills (nouns & proper nouns)
    extracted_skills = set(token.text for token in doc if token.pos_ in ["NOUN", "PROPN"])

    # Match extracted skills with predefined skills list
    skills = sorted(extracted_skills.intersection(TECH_SKILLS))

    # Extract experience using regex (e.g., "3 years", "5+ years")
    experience = re.findall(r"(\d{1,2}\s*\+?\s*years?)", text)

    return {"skills": skills, "experience": experience}

def parse_resume(file_path):
    """Extract and parse skills & experience from a resume."""
    text = extract_text(file_path)
    if text is None:
        return {"error": "Unsupported file format."}
    
    extracted_data = extract_skills_experience(text)

    # Save extracted data to resume_data.json
    with open("resume_data.json", "w") as file:
        json.dump(extracted_data, file, indent=4)
    
    print("Resume data saved to resume_data.json")
    return extracted_data

# Example Usage
file_path = "/Users/krutin/Desktop/projects/job-recommandation-system-main/resumes/RITVIK PRATHAPANI.pdf"  # Replace with actual resume file
resume_data = parse_resume(file_path)
print(resume_data)

from flask import Flask, request, jsonify
import spacy
import pdfminer.high_level
import docx2txt
import requests
import os
import re
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

nlp = spacy.load("en_core_web_sm")

# Define tech skills (case-insensitive match)
TECH_SKILLS = {
    skill.lower() for skill in [
        "Python", "Java", "JavaScript", "React", "Node.js", "MongoDB", "SQL", "AWS",
        "Docker", "Kubernetes", "Machine Learning", "Deep Learning", "NLP",
        "TensorFlow", "PyTorch", "Flask", "Django", "Golang", "Data Science",
        "Hadoop", "Spark", "Tableau", "Power BI"
    ]
}

# RapidAPI settings
API_KEY = "2eff766ffbmshe9a5ed4d9f01569p1faf92jsn05fd7a8ed8d1"
API_URL = "https://jsearch.p.rapidapi.com/search"
HEADERS = {"X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": "jsearch.p.rapidapi.com"}

def extract_text(file_path):
    """Extract text from PDF or DOCX files."""
    try:
        if file_path.endswith(".pdf"):
            return pdfminer.high_level.extract_text(file_path)
        elif file_path.endswith(".docx"):
            return docx2txt.process(file_path)
    except Exception as e:
        print(f"Error extracting text: {e}")
    return None

def extract_skills_experience(text):
    """Extract skills and experience from text."""
    doc = nlp(text)
    found_skills = {token.text.lower() for token in doc if token.pos_ in ["NOUN", "PROPN"]}
    matched_skills = sorted(found_skills.intersection(TECH_SKILLS))
    experience = re.findall(r"(\d{1,2}\s*\+?\s*years?)", text)

    return {"skills": matched_skills, "experience": experience}

def fetch_jobs(skills, role="", city="", country=""):
    """Fetch job listings for extracted skills with optional role, city, and country filters."""
    if not skills:
        print("No relevant skills found. Skipping job search.")
        return []
    
    all_jobs = []
    for skill in skills:
        # Construct the query with skill, role, city, and country
        query_parts = []
        if skill:
            query_parts.append(skill)
        if role:
            query_parts.append(role)
        if city:
            query_parts.append(f"in {city}")
        if country:
            query_parts.append(country)
        
        query = " ".join(query_parts)
        
        try:
            params = {"query": query, "page": 1, "num_pages": 1}
            response = requests.get(API_URL, headers=HEADERS, params=params)
            
            if response.status_code == 200:
                job_results = response.json().get("data", [])
                jobs = [
                    {
                        "job_id": job.get("job_id"),
                        "title": job.get("job_title"),
                        "company": job.get("employer_name", "Unknown"),
                        "location": job.get("job_city", "Remote"),
                        "apply_link": job.get("job_apply_link", "#"),
                        "skill": skill.capitalize()
                    } for job in job_results
                ]
                all_jobs.extend(jobs)
            else:
                print(f"Error fetching jobs for {query}: {response.text}")
        except Exception as e:
            print(f"Exception during job fetching: {e}")
    
    return all_jobs

@app.route("/upload", methods=["POST"]) 
def upload_resume():
    """Handle resume upload and extract relevant job recommendations."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    # Validate file extension
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx")):
        return jsonify({"error": "Unsupported file format. Only PDF and DOCX are allowed."}), 400
    
    # Save file temporarily
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)
    
    text = extract_text(file_path)
    os.remove(file_path)  # Cleanup after extraction
    
    if not text:
        return jsonify({"error": "Could not extract text from the file."}), 400
    
    # Extract skills & experience
    extracted_data = extract_skills_experience(text)
    
    # Get additional filters from the request
    role = request.form.get("role", "")
    city = request.form.get("city", "")
    country = request.form.get("country", "")
    
    # Fetch jobs based on extracted skills and additional filters
    jobs = fetch_jobs(
        skills=extracted_data["skills"], 
        role=role, 
        city=city, 
        country=country
    )
    
    return jsonify({"resume_data": extracted_data, "jobs": jobs})
@app.route("/job-details/<job_id>", methods=["GET"])
def job_details(job_id):
    """Fetch job details from API based on job_id in the URL."""
    if not job_id:
        return jsonify({"error": "Missing job ID"}), 400

    try:
        # Ensure job_id is URL-encoded properly
        job_id_encoded = job_id if job_id.endswith("%3D%3D") else f"{job_id}%3D%3D"

        job_api_url = f"https://jsearch.p.rapidapi.com/job-details?job_id={job_id_encoded}&country=us"
        response = requests.get(job_api_url, headers=HEADERS)

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch job details"}), response.status_code

        job_data = response.json().get("data", [])

        if not job_data:
            return jsonify({"error": "Job details not found"}), 404

        job_data = response.json()  # Return full response instead of extracting specific fields

        return jsonify(job_data), 200

    except Exception as e:
        return jsonify({"error": f"Error fetching job details: {str(e)}"}), 500
if __name__ == "__main__":
    app.run(debug=True)
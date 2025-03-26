import requests
import json

# Load skills from JSON file
with open("resume_data.json", "r") as f:
    skills_data = json.load(f)

skills = skills_data.get("skills", [])  # Assumes skills are stored under "skills" key
API_KEY = "c4dead3e0bmshee8cd6361b3ec1dp1f1bb0jsn36250c7271c1"  # Replace with your API key
API_URL = "https://jsearch.p.rapidapi.com/search"

headers = {
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

all_jobs = []  # List to store all job results

# Loop through each skill and make an API request
for skill in skills:
    params = {
        "query": skill,  # Search using only one skill at a time
        "page": 1,
        "num_pages": 1
    }

    response = requests.get(API_URL, headers=headers, params=params)

    if response.status_code == 200:
        job_results = response.json().get("data", [])
        
        # Extract required job details
        jobs = [
            {
                "title": job.get("job_title"),
                "company": job.get("employer_name"),
                "location": job.get("job_city"),
                "apply_link": job.get("job_apply_link"),
                "skill": skill  # Add skill to track which query fetched this job
            }
            for job in job_results
        ]
        
        all_jobs.extend(jobs)  # Add jobs to the main list

    else:
        print(f"Error fetching jobs for {skill}: {response.text}")

# Save all jobs to JSON file
with open("jobs.json", "w") as f:
    json.dump(all_jobs, f, indent=4)

print("Jobs saved successfully to jobs.json")
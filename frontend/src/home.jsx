import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, CircularProgress, Card, CardContent, Box, Alert, TextField } from "@mui/material";

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState("");
    const [loadingJobId, setLoadingJobId] = useState(null);
    const [role, setRole] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Restore data from sessionStorage when user navigates back
        const storedFile = sessionStorage.getItem("uploadedFile");
        const storedJobs = sessionStorage.getItem("jobs");

        if (storedFile) {
            setFile(storedFile);
        }

        if (storedJobs) {
            setJobs(JSON.parse(storedJobs));
        }
    }, []);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setError("");
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError("");
        setJobs([]);

        const formData = new FormData();
        formData.append("file", file);
        
        // Append additional filter fields to form data
        formData.append("role", role);
        formData.append("city", city);
        formData.append("country", country);

        try {
            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (response.ok) {
                setJobs(data.jobs || []);

                // Store data in sessionStorage
                sessionStorage.setItem("uploadedFile", file.name);
                sessionStorage.setItem("jobs", JSON.stringify(data.jobs || []));

                if (!data.jobs || data.jobs.length === 0) {
                    setError("No matching jobs found.");
                }
            } else {
                setError(data.error || "Something went wrong.");
            }
        } catch (err) {
            setError("Failed to fetch job data. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleGetDetails = (jobId) => {
        const cleanedJobId = jobId.endsWith("==") ? jobId.slice(0, -2) : jobId;
        setLoadingJobId(cleanedJobId);
        navigate(`/job-details/${cleanedJobId}`);
    };

    return (
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Upload Your Resume to Find Jobs
            </Typography>

            <Box sx={{ my: 2 }}>
                <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
            </Box>

            {/* New input fields for additional filters */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <TextField 
                    label="Role" 
                    variant="outlined" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    sx={{ width: '30%' }}
                />
                <TextField 
                    label="City" 
                    variant="outlined" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    sx={{ width: '30%' }}
                />
                <TextField 
                    label="Country" 
                    variant="outlined" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    sx={{ width: '30%' }}
                />
            </Box>

            <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading} sx={{ mt: 2 }}>
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Upload & Get Jobs"}
            </Button>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {jobs.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5">Matching Jobs</Typography>
                    {jobs.map((job) => (
                        <Card key={job.job_id} sx={{ mt: 2, p: 2, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h6">
                                    {job.title}=
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {job.company} - {job.location}
                                </Typography>

                                <Button href={job.apply_link} target="_blank" variant="contained" color="secondary" sx={{ mt: 2, mr: 1 }}>
                                    Apply Now
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleGetDetails(job.job_id)}
                                    disabled={loadingJobId === job.job_id}
                                >
                                    {loadingJobId === job.job_id ? <CircularProgress size={18} /> : "Get Details"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default ResumeUpload;
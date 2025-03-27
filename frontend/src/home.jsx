import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";
import { Button, Container, Typography, CircularProgress, Card, CardContent, Box, Alert, TextField } from "@mui/material";
import "./assets/home.css"

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
        const storedFile = sessionStorage.getItem("uploadedFile");
        const storedJobs = sessionStorage.getItem("jobs");
        if (storedFile) setFile(storedFile);
        if (storedJobs) setJobs(JSON.parse(storedJobs));
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
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
        <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "#f5f5f5", p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: "black" }}>
                Upload Your Resume to Find Jobs
            </Typography>
            <Box sx={{ position: "absolute", top: 20, right: 20 }}>
    <ChatIcon
        sx={{ fontSize: 40, cursor: "pointer", color: "#333" }}
        onClick={() => navigate("/chatbot")}
    />
</Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <input type="file" accept=".pdf,.docx" onChange={handleFileChange} style={{ color: "black", marginBottom: "1rem" }} />

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, width: "100%" }}>
                    <TextField label="Role" variant="outlined" value={role} onChange={(e) => setRole(e.target.value)} sx={{ width: '30%' }} />
                    <TextField label="City" variant="outlined" value={city} onChange={(e) => setCity(e.target.value)} sx={{ width: '30%' }} />
                    <TextField label="Country" variant="outlined" value={country} onChange={(e) => setCountry(e.target.value)} sx={{ width: '30%' }} />
                </Box>

                <Button variant="contained" sx={{ backgroundColor: "#333", color: "#fff", mt: 2 }} onClick={handleUpload} disabled={loading}>
                    {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Upload & Get Jobs"}
                </Button>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Box>

            {jobs.length > 0 && (
                <Box sx={{ mt: 4, width: "100%" }}>
                    <Typography variant="h5" sx={{ color: "black" }}>Matching Jobs</Typography>
                    {jobs.map((job) => (
                        <Card key={job.job_id} sx={{ mt: 2, p: 2, boxShadow: 3, bgcolor: "#e0e0e0" }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: "black" }}>{job.title}</Typography>
                                <Typography variant="body2" color="textSecondary">{job.company} - {job.location}</Typography>
                                
                                {/* Buttons wrapped in a flex container to align properly */}
                                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                    <Button 
                                        href={job.apply_link} 
                                        target="_blank" 
                                        variant="contained" 
                                        sx={{ backgroundColor: "#333", color: "#fff", mr: 1 }}
                                    >
                                        Apply Now
                                    </Button>

                                    <Button 
                                        variant="outlined" 
                                        sx={{ borderColor: "#333", color: "#333", height: "100%" }} 
                                        onClick={() => handleGetDetails(job.job_id)} 
                                        disabled={loadingJobId === job.job_id}
                                    >
                                        {loadingJobId === job.job_id ? <CircularProgress size={18} /> : "Get Details"}
                                    </Button>
                                </Box>

                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default ResumeUpload;
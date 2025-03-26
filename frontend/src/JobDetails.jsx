import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress, Alert, Box, Paper } from "@mui/material";

const JobDetails = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/job-details/${jobId}`);
                const data = await response.json();

                if (response.ok && data.data && data.data.length > 0) {
                    setJob(data.data[0]); // Extract the first job object
                } else {
                    setError("No job details found.");
                }
            } catch (err) {
                setError("Something went wrong while fetching job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    return (
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Box>
                    <Typography variant="h4" sx={{ mb: 2, color: "black" }}>
                        Job Details
                    </Typography>
                    <Paper sx={{ p: 3, textAlign: "left" }}>
                        <Typography variant="h6"><strong>Title:</strong> {job.job_title}</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}><strong>Description:</strong></Typography>
                        <Typography variant="body2">{job.job_description}</Typography>
                        {job.apply_options?.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1"><strong>Apply Links:</strong></Typography>
                                {job.apply_options.map((option, index) => (
                                    <Typography key={index}>
                                        <a href={option.apply_link} target="_blank" rel="noopener noreferrer">
                                            Apply Here
                                        </a>
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Box>
            )}
        </Container>
    );
};

export default JobDetails;
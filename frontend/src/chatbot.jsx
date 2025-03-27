import { useState } from "react";
import { Container, TextField, Button, Box, Typography, CircularProgress } from "@mui/material";

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: "mistral", prompt: input, stream: false }),
            });

            const data = await response.json();
            const botMessage = { role: "assistant", content: data.response };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not reach the server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5, bgcolor: "#f5f5f5", p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: "center", color: "black" }}>
                Chat with Ollama
            </Typography>

            {/* Chat Display */}
            <Box sx={{ maxHeight: 400, overflowY: "auto", mb: 2, p: 2, bgcolor: "#fff", borderRadius: 2 }}>
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            mb: 1,
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: "70%",
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: msg.role === "user" ? "#007bff" : "#e0e0e0",
                                color: msg.role === "user" ? "white" : "black",
                                boxShadow: 1,
                            }}
                        >
                            <Typography variant="body1">{msg.content}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Input Field */}
            <TextField
                fullWidth
                variant="outlined"
                label="Type your message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                sx={{ mb: 2 }}
            />

            {/* Send Button */}
            <Button
                variant="contained"
                sx={{ backgroundColor: "#333", color: "#fff" }}
                onClick={sendMessage}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Send"}
            </Button>
        </Container>
    );
};

export default ChatBot;
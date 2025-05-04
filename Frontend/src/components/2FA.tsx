import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import wallpaper from "./../assets/Wallpaper.png";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  width: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: "12px",
    },
  },
  "& .MuiInputBase-input": {
    textAlign: "center",
    letterSpacing: "8px",
    fontSize: "24px",
    padding: "12px",
  },
}));

function TwoFA() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email: string })?.email || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }
      
      const response = await axios.post(
        "http://127.0.0.1:5000/app/verify-2fa",
        {
          email,
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (response.data.status === 'success') {
        navigate("/dashboard");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        setError("Invalid or expired code.");
      } else if (axiosError.response?.status === 400) {
        setError("Invalid request.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <StyledPaper elevation={3}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
            Two-Factor Authentication
          </Typography>
          
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Enter the 6-digit code from your authenticator app
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <StyledTextField
            fullWidth
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            inputProps={{
              maxLength: 6,
              pattern: "[0-9]*",
              inputMode: "numeric",
            }}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading || code.length !== 6}
            sx={{
              borderRadius: "12px",
              py: 1.5,
              mt: 2,
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify"
            )}
          </Button>
        </Box>
      </StyledPaper>
    </Box>
  );
}

export default TwoFA;

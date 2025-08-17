import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function Connections() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);

  const handleFetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    setFiles([]);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get("/api/list-ldap-server-files", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data.status === "success") {
        setFiles(response.data.files);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to connect to the backend server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          <Typography variant="h4" fontWeight="bold" mb={4}>
            Remote Connections
          </Typography>
          <Paper sx={{ p: 3, maxWidth: "md", margin: "auto" }}>
            <Typography variant="h6" mb={2}>
              LDAP Server File System
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Click the button to list files from the home directory on the
              remote LDAP Server via a secure SSH connection.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleFetchFiles}
                disabled={isLoading}
              >
                List Files from LDAP Server
              </Button>
              {isLoading && <CircularProgress size={24} />}
            </Box>
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            {files.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" fontSize="1rem" fontWeight="bold">
                  Files Found:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ mt: 1, maxHeight: "400px", overflow: "auto" }}
                >
                  <List dense>
                    {files.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primaryTypographyProps={{
                            sx: {
                              fontFamily: "monospace",
                              fontSize: "0.875rem",
                            },
                          }}
                          primary={file}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Connections;

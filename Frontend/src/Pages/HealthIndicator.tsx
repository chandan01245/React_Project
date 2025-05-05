import { Box, Chip, LinearProgress, Typography } from "@mui/material";
import React from "react";

interface HealthIndicatorProps {
  title: string; // Node name or category (e.g., "Manager", "Metadata")
  status: string; // e.g., "3/5" (healthy nodes/total nodes)
  isHealthy: boolean; // Overall health status of the node
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  title,
  status,
  isHealthy,
}) => {
  // Extract current and total values from the status (e.g., "3/5")
  const [current, total] = status.split("/").map(Number);
  const progress = (current / total) * 100; // Calculate progress percentage

  return (
    <Box
      sx={{
        padding: 4, // Increased padding for better spacing
        border: "1px solid #333", // Darker border color
        borderRadius: 5, // Slightly more rounded corners
        marginBottom: 4, // Increased margin for better spacing between components
        backgroundColor: "#f9f9f9", // Slightly lighter gray background for contrast
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Slightly deeper shadow for better depth
      }}
    >
      {/* Title and Overall Health */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3, // Added spacing below the title and chip
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            color: "#333", // Darker font color
          }}
        >
          {title} Nodes
        </Typography>
        <Chip
          label={isHealthy ? "Nodes Healthy" : "Nodes Unhealthy"}
          color={isHealthy ? "success" : "error"}
          variant="outlined"
          sx={{
            fontWeight: "bold",
            fontSize: "0.875rem", // Slightly larger font size for better visibility
            padding: "0 8px", // Added padding inside the chip for better spacing
          }}
        />
      </Box>

      {/* Status and Progress Bar */}
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: "#555",
            marginBottom: 2, // Added spacing between the status text and progress bar
          }}
        >
          {`Healthy Nodes: ${status}`}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12, // Slightly thicker progress bar
            borderRadius: 6, // Rounded corners for the progress bar
            backgroundColor: "#e0e0e0", // Light gray background for the progress bar
            "& .MuiLinearProgress-bar": {
              backgroundColor: isHealthy ? "#4caf50" : "#f44336", // Green for healthy, red for unhealthy
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default HealthIndicator;

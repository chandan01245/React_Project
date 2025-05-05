import { Box, Button, Chip, LinearProgress, Typography } from "@mui/material";
import React from "react";

interface HealthIndicatorProps {
  title: string; // Node name or category (e.g., "Manager", "Metadata")
  status: string; // e.g., "3/5" (healthy nodes/total nodes)
  isHealthy: boolean; // Overall health status of the node
  ip: string; // IP address of the node
  mgs: string; // MGS status
  mds: string; // MDS status
  oss: string; // OSS status
  targets: string; // Targets status
  haCluster: boolean; // Whether the node is part of an HA cluster
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  title,
  status,
  isHealthy,
  ip,
  mgs,
  mds,
  oss,
  targets,
  haCluster,
}) => {
  // Extract current and total values from the status (e.g., "3/5")
  const [current, total] = status.split("/").map(Number);
  const progress = (current / total) * 100; // Calculate progress percentage

  return (
    <Box
      sx={{
        padding: 4,
        border: "1px solid #333",
        borderRadius: 5,
        marginBottom: 4,
        backgroundColor: "#f9f9f9",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Title and Overall Health */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            color: "#333",
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
            fontSize: "0.875rem",
            padding: "0 8px",
          }}
        />
      </Box>

      {/* Node Details */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: "#555", marginBottom: 1 }}>
          <strong>IP:</strong> {ip}
        </Typography>
        <Typography variant="body2" sx={{ color: "#555", marginBottom: 1 }}>
          <strong>MGS:</strong> {mgs}
        </Typography>
        <Typography variant="body2" sx={{ color: "#555", marginBottom: 1 }}>
          <strong>MDS:</strong> {mds}
        </Typography>
        <Typography variant="body2" sx={{ color: "#555", marginBottom: 1 }}>
          <strong>OSS:</strong> {oss}
        </Typography>
        <Typography variant="body2" sx={{ color: "#555", marginBottom: 1 }}>
          <strong>Targets:</strong> {targets}
        </Typography>
        <Typography variant="body2" sx={{ color: "#555", marginBottom: 1 }}>
          <strong>HA Cluster:</strong> {haCluster ? "Yes" : "No"}
        </Typography>
      </Box>

      {/* Status and Progress Bar */}
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: "#555",
            marginBottom: 2,
          }}
        >
          {`Healthy Nodes: ${status}`}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: isHealthy ? "#4caf50" : "#f44336",
            },
          }}
        />
      </Box>

      {/* Add Node Button */}
      <Box sx={{ marginTop: 2, textAlign: "center" }}>
        <Button variant="contained" color="primary">
          Add Node
        </Button>
      </Box>
    </Box>
  );
};

export default HealthIndicator;

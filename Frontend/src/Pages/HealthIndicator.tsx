import { Box, Button, Chip, LinearProgress, Typography } from "@mui/material";
import React from "react";

interface HealthIndicatorProps {
  title: string;
  status: string;
  isHealthy: boolean;
  ip: string;
  mgs: string;
  mds: string;
  oss: string;
  targets: string;
  haCluster: boolean;
  showAddButton?: boolean;
  onClick?: () => void;
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
  showAddButton = false,
  onClick,
}) => {
  // Safely parse status
  let current = 0;
  let total = 1; // Default to avoid division by zero
  try {
    [current, total] = status.split("/").map(Number);
  } catch (error) {
    console.error("Invalid status format. Expected 'current/total'.", error);
  }
  const progress = Math.min((current / total) * 100, 100); // Ensure progress doesn't exceed 100%

  // Node info mapping for cleaner code
  const nodeInfo = [
    { label: "IP", value: ip },
    { label: "MGS", value: mgs },
    { label: "MDS", value: mds },
    { label: "OSS", value: oss },
    { label: "Targets", value: targets },
    { label: "HA Cluster", value: haCluster ? "Yes" : "No" },
  ];

  return (
    <Box
      onClick={onClick}
      sx={{
        padding: 4,
        border: "1px solid #ccc",
        borderRadius: 5,
        backgroundColor: "#fdfdfd",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "scale(1.02)",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
            }
          : {},
      }}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `Health Indicator for ${title}` : undefined}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#333">
          {title} Nodes
        </Typography>
        <Chip
          label={isHealthy ? "Healthy" : "Unhealthy"}
          color={isHealthy ? "success" : "error"}
          variant="outlined"
          sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
        />
      </Box>

      {/* Node Info */}
      <Box sx={{ marginBottom: 2 }}>
        {nodeInfo.map((info) => (
          <Typography key={info.label} variant="body2" color="text.secondary">
            <strong>{info.label}:</strong> {info.value}
          </Typography>
        ))}
      </Box>

      {/* Progress */}
      <Box>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          Healthy Nodes: {status}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#eee",
            "& .MuiLinearProgress-bar": {
              backgroundColor: isHealthy ? "#4caf50" : "#f44336",
            },
          }}
        />
      </Box>

      {/* Add Node Button (optional) */}
      {showAddButton && (
        <Box sx={{ marginTop: 2, textAlign: "center" }}>
          <Button variant="contained" color="primary">
            Add Node
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default HealthIndicator;

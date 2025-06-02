import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import HealthIndicator from "./HealthIndicator";

function Node() {
  const location = useLocation();
  const node = location.state;

  if (!node) {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h6" color="error">
          No node data provided.
        </Typography>
      </Box>
    );
  }

  const {
    title = "Unknown",
    ip = "N/A",
    status = "0/0",
    haCluster = false,
    mgs = "N/A",
    mds = "N/A",
    oss = "N/A",
    targets = "N/A",
  } = node;

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f9f9f9", overflowY: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {title} Node Details
      </Typography>

      {/* Two-column layout using flexbox */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 4,
          mb: 4,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography><strong>IP Address:</strong> {ip}</Typography>
          <Typography><strong>Status:</strong> {status}</Typography>
          <Typography><strong>HA Cluster:</strong> {haCluster ? "Yes" : "No"}</Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography><strong>MGS:</strong> {mgs}</Typography>
          <Typography><strong>MDS:</strong> {mds}</Typography>
          <Typography><strong>OSS:</strong> {oss}</Typography>
          <Typography><strong>Targets:</strong> {targets}</Typography>
        </Box>
      </Box>

      {/* Health Indicator */}
      <Box mt={4}>
        <HealthIndicator
          title={title}
          status={status}
          isHealthy={status.split("/")[0] === status.split("/")[1]}
          ip={ip}
          mgs={mgs}
          mds={mds}
          oss={oss}
          targets={targets}
          haCluster={haCluster}
        />
      </Box>
    </Box>
  );
}

export default Node;

import { Box, Grid, Typography } from "@mui/material";
import Sidebar from "../components/ui/Sidebar";
import { useLocation } from "react-router-dom";
import HealthIndicator from "./HealthIndicator";

function Node() {
  const location = useLocation();
  const node = location.state;

  if (!node) {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h6">No node data provided.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flex: 1, padding: 4, backgroundColor: "#f9f9f9" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {node.title} Node Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>IP Address: {node.ip}</Typography>
            <Typography>Status: {node.status}</Typography>
            <Typography>HA Cluster: {node.haCluster ? "Yes" : "No"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>MGS: {node.mgs}</Typography>
            <Typography>MDS: {node.mds}</Typography>
            <Typography>OSS: {node.oss}</Typography>
            <Typography>Targets: {node.targets}</Typography>
          </Grid>
        </Grid>

        <Box mt={4}>
          <HealthIndicator {...node} />
        </Box>
      </Box>
    </Box>
  );
}

export default Node;

import { Box, Grid, Typography } from "@mui/material";
import Sidebar from "../Components/Sidebar";
import HealthIndicator from "./HealthIndicator";

function Node() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, padding: 4, backgroundColor: "#f9f9f9" }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#333" }} // Darker font color for better readability
        >
          Node
        </Typography>

        {/* Health Indicators */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator title="Manager" status="3/5" isHealthy={true} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator title="Metadata" status="2/5" isHealthy={false} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator title="OSS" status="4/4" isHealthy={true} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator title="Protocol" status="1/3" isHealthy={false} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Node;

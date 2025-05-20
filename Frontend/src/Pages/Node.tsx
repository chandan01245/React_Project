import { Box, Grid, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
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
          sx={{ color: "#333", marginBottom: 3 }} // Added spacing between the title and health indicators
        >
          Node Overview
        </Typography>

        {/* Health Indicators */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator
              title="Manager"
              status="3/5"
              isHealthy={true}
              ip="192.168.1.1"
              mgs="Active"
              mds="Active"
              oss="Active"
              targets="5/5"
              haCluster={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator
              title="Metadata"
              status="2/5"
              isHealthy={false}
              ip="192.168.1.2"
              mgs="Inactive"
              mds="Active"
              oss="Inactive"
              targets="3/5"
              haCluster={false}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator
              title="OSS"
              status="4/4"
              isHealthy={true}
              ip="192.168.1.3"
              mgs="Active"
              mds="Active"
              oss="Active"
              targets="4/4"
              haCluster={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HealthIndicator
              title="Protocol"
              status="1/3"
              isHealthy={false}
              ip="192.168.1.4"
              mgs="Inactive"
              mds="Inactive"
              oss="Active"
              targets="1/3"
              haCluster={false}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Node;

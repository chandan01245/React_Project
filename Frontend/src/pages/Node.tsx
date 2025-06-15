import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import HealthIndicator from "./HealthIndicator";
import Sidebar from "../components/Sidebar";

function Node() {
  const location = useLocation();
  const node = location.state;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        background: "#fff",
        color: "#222",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Header />
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {node ? (
            <>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {node.title} Node Details
              </Typography>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "2rem",
                  marginBottom: "2rem",
                }}
              >
                <div style={{ minWidth: 220 }}>
                  <Typography>IP Address: {node.ip}</Typography>
                  <Typography>Status: {node.status}</Typography>
                  <Typography>HA Cluster: {node.haCluster ? "Yes" : "No"}</Typography>
                </div>
                <div style={{ minWidth: 220 }}>
                  <Typography>MGS: {node.mgs}</Typography>
                  <Typography>MDS: {node.mds}</Typography>
                  <Typography>OSS: {node.oss}</Typography>
                  <Typography>Targets: {node.targets}</Typography>
                </div>
              </div>
              <Box mt={4}>
                <HealthIndicator
                  title={node.title}
                  status={node.status}
                  isHealthy={node.isHealthy}
                  ip={node.ip}
                  mgs={node.mgs}
                  mds={node.mds}
                  oss={node.oss}
                  targets={node.targets}
                  haCluster={node.haCluster}
                />
              </Box>
            </>
          ) : (
            <Typography variant="h6">No node data provided.</Typography>
          )}
        </div>
      </div>
    </div>
  );
}

export default Node;

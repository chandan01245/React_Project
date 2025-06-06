// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";

import HealthIndicator from "./HealthIndicator";

function Dashboard() {
  const navigate = useNavigate();

  const nodes = [
    {
      title: "Manager",
      status: "3/5",
      isHealthy: true,
      ip: "192.168.1.1",
      mgs: "Active",
      mds: "Active",
      oss: "Active",
      targets: "5/5",
      haCluster: true,
    },
    {
      title: "Metadata",
      status: "2/5",
      isHealthy: false,
      ip: "192.168.1.2",
      mgs: "Inactive",
      mds: "Active",
      oss: "Inactive",
      targets: "3/5",
      haCluster: false,
    },
    {
      title: "OSS",
      status: "4/4",
      isHealthy: true,
      ip: "192.168.1.3",
      mgs: "Active",
      mds: "Active",
      oss: "Active",
      targets: "4/4",
      haCluster: true,
    },
    {
      title: "Protocol",
      status: "1/3",
      isHealthy: false,
      ip: "192.168.1.4",
      mgs: "Inactive",
      mds: "Inactive",
      oss: "Active",
      targets: "1/3",
      haCluster: false,
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-4">
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "#333", mb: 3 }}
      >
        Cluster Overview
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nodes.map((node, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => navigate("/node", { state: node })}
          >
            <HealthIndicator {...node} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

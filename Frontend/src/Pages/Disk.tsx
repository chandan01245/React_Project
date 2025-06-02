import "../App.css";
import { Typography } from "@mui/material";
import HealthIndicator from "./HealthIndicator";

// Dummy disk data — replace with real data or API fetch later
const disks = [
  {
    title: "Disk A",
    status: "2/2",
    isHealthy: true,
    ip: "10.0.0.1",
    mgs: "Mounted",
    mds: "Clean",
    oss: "Online",
    targets: "2/2",
    haCluster: true,
  },
  {
    title: "Disk B",
    status: "1/2",
    isHealthy: false,
    ip: "10.0.0.2",
    mgs: "Unmounted",
    mds: "Dirty",
    oss: "Offline",
    targets: "1/2",
    haCluster: false,
  },
];

function Disk() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "#333", mb: 3 }}
      >
        Disk Overview
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {disks.map((disk, index) => (
          <HealthIndicator key={index} {...disk} />
        ))}
      </div>
    </div>
  );
}

export default Disk;

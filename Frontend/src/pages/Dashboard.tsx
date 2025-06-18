import { Outlet, useNavigate } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import GrafanaPanel from '../components/GrafanaPanel';

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
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <div className="flex-1 overflow-auto p-4">
          <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            {/* Render nodes or other dashboard info */}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import { Outlet } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function Dashboard() {

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

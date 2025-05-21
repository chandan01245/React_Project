import { Outlet } from "react-router-dom";
import "../App.css";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

function Dashboard() {
  return (
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
          {localStorage.getItem("user_group") === "admin" ? (
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          ) : (
            <h1 className="text-2xl font-bold">User Dashboard</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

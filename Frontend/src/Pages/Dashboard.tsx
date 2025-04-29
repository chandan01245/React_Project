import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../App.css";
import { Outlet } from "react-router-dom";


function Dashboard() {
  return (
      <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full">
          <Header />
          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>
        </div>
      </div>
  );
};


export default Dashboard;

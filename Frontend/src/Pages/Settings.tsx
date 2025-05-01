import Sidebar from "../Components/Sidebar";
import "../App.css";
import { Outlet } from "react-router-dom";

function Settings() {
    return (
        <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
        <Sidebar />
            <div className="flex-1 overflow-auto p-4">
            <Outlet />
            </div>
        </div>
    );
}

export default Settings;

import React from "react";
import {
  FiDatabase,
  FiFolder,
  FiGlobe,
  FiHardDrive,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: "Home", path: "/Home", icon: <FiHome /> },
    { name: "Disk", path: "/Disk", icon: <FiHardDrive /> },
    { name: "Storage", path: "/Storage", icon: <FiDatabase /> },
    { name: "Network", path: "/Network", icon: <FiGlobe /> },
    { name: "File System", path: "/Filesystem", icon: <FiFolder /> },
  ];
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logged out");
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 bg-white p-6 h-screen hidden md:flex flex-col justify-between border-r shadow-lg">
      {/* Logo */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-10 tracking-tight">
          AcceleronLabs
        </h2>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-gray-700 hover:bg-gray-100 ${
                  isActive
                    ? "bg-gray-100 border-l-4 border-blue-600 pl-3 text-blue-600"
                    : ""
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition duration-200 font-semibold tracking-wide shadow hover:shadow-md"
      >
        <FiLogOut className="text-lg" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;

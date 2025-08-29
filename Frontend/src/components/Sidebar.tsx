import React from "react";
import { AiOutlineNodeIndex } from "react-icons/ai";
import {
    FiDatabase,
    FiFolder,
    FiGlobe,
    FiHardDrive,
    FiHome,
    FiLink,
    FiLogOut,
    FiMonitor,
    FiSettings,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome /> },
  { name: "Server", path: "/server", icon: <FiMonitor /> },
    { name: "Metrics", path: "/metrics", icon: <FiMonitor /> },
    { name: "Node", path: "/node", icon: <AiOutlineNodeIndex /> },
    { name: "Disk", path: "/disk", icon: <FiHardDrive /> },
    { name: "Storage", path: "/storage", icon: <FiDatabase /> },
    { name: "Network", path: "/network", icon: <FiGlobe /> },
    { name: "File System", path: "/filesystem", icon: <FiFolder /> },
    { name: "Connections", path: "/connections", icon: <FiLink /> },
    { name: "Settings", path: "/settings", icon: <FiSettings /> },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logged out");
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 bg-sidebar p-6 h-screen hidden md:flex flex-col justify-between border-r border-sidebar-border shadow-lg">
      {/* Logo */}
      <div>
        <h2 className="text-2xl font-bold text-sidebar-foreground mb-10 tracking-tight">
          <a href="/dashboard">AcceleronLabs</a>
        </h2>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sidebar-foreground hover:bg-sidebar-accent ${
                  isActive
                    ? "bg-sidebar-accent border-l-4 border-sidebar-primary pl-3 text-sidebar-primary"
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
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition duration-200 font-semibold tracking-wide shadow hover:shadow-md"
      >
        <FiLogOut className="text-lg" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;

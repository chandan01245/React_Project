import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <div className="flex-1 overflow-auto p-4">
          {children}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

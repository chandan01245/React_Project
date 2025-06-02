import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Breadcrumbs from "./breadcrumbs";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <Breadcrumbs />
        <main className="p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;

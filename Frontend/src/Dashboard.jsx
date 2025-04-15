import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./Pages/Home";
import Files from "./Pages/Files";
import Analytics from "./Pages/Analytics";
import Settings from "./Pages/Settings";

function Dashboard() {
  return (
    <div className="flex h-screen w-screen bg-white text-black dark:bg-[#121212] dark:text-white transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <div className="flex-1 overflow-auto p-4">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/files" element={<Files />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

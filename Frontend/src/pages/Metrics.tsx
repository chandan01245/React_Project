import { Outlet } from "react-router-dom";
import "../App.css";
import GrafanaPanel from "../components/GrafanaPanel";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function Metrics() {
  return (
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <div className="flex-1 overflow-auto p-4">
          <div>
            <h1 className="text-2xl font-bold mb-4">Metrics</h1>
            {/* Render nodes or other dashboard info */}
            <div>
              <h1>Server Metrics</h1>
              <div className="flex gap-4">
                <GrafanaPanel src="http://192.168.1.4:3000/d-solo/d9704356-0828-4f5f-b8b8-5285d6239a94/new-dashboard?orgId=1&from=1750523163105&to=1750523463105&timezone=browser&panelId=1&__feature.dashboardSceneSolo" />
                <GrafanaPanel src="http://192.168.1.4:3000/d-solo/e6e4ea4a-7209-4ade-b961-4d520b79a933/cpu?orgId=1&from=1750519980793&to=1750523580793&timezone=browser&panelId=1&__feature.dashboardSceneSolo" />
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Metrics;

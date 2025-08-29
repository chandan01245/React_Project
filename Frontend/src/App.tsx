// src/App.tsx
import "./App.css";
import TwoFA from "./components/2FA";
import Login from "./components/login";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardProvider } from "./contexts/DashboardContext";
import Connections from "./pages/Connections";
import Dashboard from "./pages/Dashboard";
import Disk from "./pages/Disk";
import Filesystem from "./pages/FileSystem";
import Metrics from "./pages/Metrics";
import Network from "./pages/Network";
import Node from "./pages/Node";
import NotFound from "./pages/NotFound";
import Server from "./pages/Server";
import Settings from "./pages/Settings";
import Storage from "./pages/Storage";

function App() {
  return (
    <DashboardProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/2fa" element={<TwoFA />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/metrics"
          element={
            <ProtectedRoute>
              <Metrics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/node"
          element={
            <ProtectedRoute>
              <Node />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disk"
          element={
            <ProtectedRoute>
              <Disk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/storage"
          element={
            <ProtectedRoute>
              <Storage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <Network />
            </ProtectedRoute>
          }
        />
        <Route
          path="/filesystem"
          element={
            <ProtectedRoute>
              <Filesystem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <Connections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/server"
          element={
            <ProtectedRoute>
              <Server />
            </ProtectedRoute>
          }
        />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </DashboardProvider>
  );
}

export default App;

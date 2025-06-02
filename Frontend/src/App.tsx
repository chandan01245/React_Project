// src/App.tsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import TwoFA from "./Components/2FA";
import Login from "./Components/login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/Dashboard";
import Disk from "./pages/Disk";
import Filesystem from "./pages/FileSystem";
import Node from "./pages/Node";
import Network from "./pages/Network";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Storage from "./pages/Storage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/2fa"
          element={
            <ProtectedRoute>
              <TwoFA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/node"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Node />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disk"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Disk />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/storage"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Storage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Network />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/filesystem"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Filesystem />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

// src/App.tsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import TwoFA from "./components/2FA";
import Login from "./components/login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./Pages/Dashboard";
import Disk from "./Pages/Disk";
import Filesystem from "./Pages/FileSystem";
import Node from "./Pages/Node";
import Network from "./Pages/Network";
import NotFound from "./Pages/NotFound";
import Settings from "./Pages/Settings";
import Storage from "./Pages/Storage";
import MainLayout from "./components/mainlayout";


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

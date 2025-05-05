import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import TwoFA from "./Components/2FA";
import Login from "./Components/login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Dashboard from "./Pages/Dashboard";
import Disk from "./Pages/Disk";
import Filesystem from "./Pages/FileSystem";
import Node from "./Pages/Node";
import Network from "./Pages/Network";
import NotFound from "./Pages/NotFound";
import Settings from "./Pages/Settings";
import Storage from "./Pages/Storage";


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
                <Dashboard />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
  );
}

export default App;

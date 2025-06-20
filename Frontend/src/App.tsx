// src/App.tsx
import "./App.css";
import TwoFA from "./components/2FA";
import Login from "./components/login";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Disk from "./pages/Disk";
import Filesystem from "./pages/FileSystem";
import Metrics from "./pages/Metrics";
import Network from "./pages/Network";
import Node from "./pages/Node";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Storage from "./pages/Storage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/2fa" element={<TwoFA />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/node" element={<Node />} />
        <Route path="/disk" element={<Disk />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/network" element={<Network />} />
        <Route path="/filesystem" element={<Filesystem />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

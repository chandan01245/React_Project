import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import TwoFA from "./Components/2FA";
import Login from "./Components/login";
import ProtectedRoute from "./Components/ProtectedRoute";
import { Theme, ThemeContext } from "./Context/ThemeContext";
import Dashboard from "./Pages/Dashboard";
import Disk from "./Pages/Disk";
import Filesystem from "./Pages/FileSystem";
import Home from "./Pages/Home";
import Network from "./Pages/Network";
import NotFound from "./Pages/NotFound";
import Settings from "./Pages/Settings";
import Storage from "./Pages/Storage";

function App() {
  const [theme, setTheme] = useState<Theme>(Theme.Light);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === Theme.Light || savedTheme === Theme.Dark) {
      setTheme(savedTheme as Theme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
            path="/Home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Disk"
            element={
              <ProtectedRoute>
                <Disk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Storage"
            element={
              <ProtectedRoute>
                <Storage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Network"
            element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Filesystem"
            element={
              <ProtectedRoute>
                <Filesystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;

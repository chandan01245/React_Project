import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import TwoFA from "./Components/2FA";
import Login from "./Components/login";
import { ThemeContext, Theme } from "./Context/ThemeContext";
import Dashboard from "./Pages/Dashboard";
import Disk from "./Pages/Disk";
import FileSystem from "./Pages/FileSystem";
import Home from "./Pages/Home";
import Network from "./Pages/Network";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
          <Route path="/2fa" element={<TwoFA />} />
          <Route index element={<Home />} />
          <Route path="Disk" element={<Disk />} />
          <Route path="Storage" element={<Storage />} />
          <Route path="Network" element={<Network />} />
          <Route path="Filesystem" element={<FileSystem />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;

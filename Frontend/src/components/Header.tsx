import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

// Map routes to sidebar/page names
const routeToTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/metrics": "Metrics",
  "/disk": "Disk",
  "/filesystem": "File System",
  "/network": "Network",
  "/node": "Node",
  "/connections": "Connections",
  "/settings": "Settings",
  "/storage": "Storage",
};

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    // Example: get email from localStorage or context
    const email = localStorage.getItem("userEmail") || "";
    const username = email.split("@")[0];

    // Fetch user info from backend using username
    if (username) {
      axios
        .get(`/api/user/${username}`)
        .then((res: { data: { name?: string } }) => {
          setUserName(res.data?.name || username);
        })
        .catch(() => {
          setUserName(username);
        });
    }
  }, []);

  // Get the current page title from the route
  const pageTitle = routeToTitle[location.pathname] || "App";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        borderBottom: '1px solid var(--border)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
          <Typography variant="h6" fontWeight="bold" noWrap sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
            {pageTitle}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            aria-label="Toggle theme"
            onClick={() => setIsDark((v: boolean) => !v)}
            sx={{
              color: 'var(--foreground)'
            }}
          >
            {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'Inter, Roboto, sans-serif' }}>
            {userName}
          </Typography>
          <Avatar sx={{ bgcolor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {userName ? userName[0].toUpperCase() : "U"}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

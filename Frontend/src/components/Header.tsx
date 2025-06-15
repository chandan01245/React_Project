import { AppBar, Avatar, Box, Toolbar, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

// Map routes to sidebar/page names
const routeToTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/disk": "Disk",
  "/filesystem": "File System",
  "/network": "Network",
  "/node": "Node",
  "/settings": "Settings",
  "/storage": "Storage",
};

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    // Example: get email from localStorage or context
    const email = localStorage.getItem("userEmail") || "";
    const username = email.split("@")[0];

    // Fetch user info from backend using username
    if (username) {
      axios
        .get(`/api/user/${username}`)
        .then((res) => {
          setUserName(res.data.name || username);
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
      elevation={1}
      sx={{
        background: "#fff",
        color: "#222",
        borderBottom: "1px solid #e0e0e0",
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
          <Typography variant="h6" fontWeight="bold" noWrap>
            {pageTitle}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {userName}
          </Typography>
          <Avatar sx={{ bgcolor: "#1976d2" }}>
            {userName ? userName[0].toUpperCase() : "U"}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

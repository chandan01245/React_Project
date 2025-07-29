import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const fetchUserGroup = async (): Promise<string | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await axios.get("/app/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user_group;
  } catch (err) {
    console.error("Token validation failed:", err);
    return null;
  }
};

const fetch2FAStatus = async (): Promise<{
  is2FARequired: boolean;
  is2FACompleted: boolean;
} | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await axios.get("/app/2fa-status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      is2FARequired: response.data.is_2fa_enabled,
      is2FACompleted: response.data["2fa_completed"],
    };
  } catch (err) {
    console.error("Failed to fetch 2FA status:", err);
    return null;
  }
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validate = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      // Set token in axios globally
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Set User Group
      const group = await fetchUserGroup();
      if (!group) {
        setIsAuthorized(false);
        return;
      }
      localStorage.setItem("user_group", group);

      // Check 2FA status
      const twoFAStatus = await fetch2FAStatus();
      if (!twoFAStatus) {
        setIsAuthorized(false);
        return;
      }

      if (
        twoFAStatus.is2FARequired &&
        !twoFAStatus.is2FACompleted &&
        window.location.pathname !== "/2fa"
      ) {
        navigate("/2fa");
        return;
      }

      setIsAuthorized(true);
    };

    validate();
  }, [navigate]);

  if (isAuthorized === null) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

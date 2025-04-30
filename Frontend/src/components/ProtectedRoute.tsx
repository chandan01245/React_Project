import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const fetchUserGroup = async (): Promise<string | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await axios.get("http://127.0.0.1:5000/app/user", {
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

      //Set User Group
      const group = await fetchUserGroup();
      if (!group) {
        setIsAuthorized(false);
        return;
      }
      localStorage.setItem("user_group", group);

      // Check 2FA logic
      const is2FARequired = localStorage.getItem("2fa_required") === "true";
      const is2FACompleted = localStorage.getItem("2fa_completed") === "true";

      if (
        is2FARequired &&
        !is2FACompleted &&
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

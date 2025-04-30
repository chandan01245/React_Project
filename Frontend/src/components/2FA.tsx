import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import wallpaper from "./../assets/Wallpaper.png";

function TwoFA() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email: string })?.email || "";
  const password = (location.state as { password: string })?.password || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  // Fetch QR code for 2FA setup
  useEffect(() => {
    async function fetchQr() {
      try {
        const token = localStorage.getItem("token");
        const resp = await axios.post(
          "http://127.0.0.1:5000/app/2fa",
          {
            email,
            password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setQr("data:image/png;base64," + resp.data.qr_code);
      } catch (err) {
        setError("Could not load QR code.");
      }
    }
    if (email && password) fetchQr();
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:5000/app/verify-2fa",
        {
          email,
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Set 2FA completion flag
      localStorage.setItem("2fa_completed", "true");
      navigate("/dashboard");
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        setError("Invalid or expired code.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center"
      >
        <h2 className="text-black font-bold mb-6 text-center">
          Two-Factor Authentication
        </h2>
        {qr && (
          <div className="mb-4 flex flex-col items-center">
            <img src={qr} alt="2FA QR Code" className="w-40 h-40" />
            <p className="text-xs text-gray-500 mt-2">
              Scan this QR code with Google Authenticator.
            </p>
          </div>
        )}
        <p className="mb-4 text-gray-600 text-center">
          Enter the 6-digit code from your authenticator app.
        </p>
        {error && (
          <div className="w-full p-2 mb-2 bg-red-100 text-red-600 text-sm rounded text-center">
            {error}
          </div>
        )}
        <input
          type="text"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4 text-center text-lg tracking-widest text-black"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-60"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}

export default TwoFA;

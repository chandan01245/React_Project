import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import "../App.css";
import Sidebar from "../Components/Sidebar";

function Settings() {
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  // Fetch the initial 2FA status and email from the database
  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }
      
      try {
        const resp = await axios.get("http://127.0.0.1:5000/app/2fa-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("User data response:", resp.data);
        setIs2FAEnabled(resp.data.is_2fa_enabled);
        setUserEmail(resp.data.email);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Error fetching user data:", {
          message: axiosError.message,
          response: axiosError.response?.data,
          status: axiosError.response?.status
        });
      }
    }

    fetchUserData();
  }, []);

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userEmail) {
      console.error("Token or email not found");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:5000/app/update-2fa-status",
        { email: userEmail, is_2fa_enabled: !is2FAEnabled },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIs2FAEnabled(!is2FAEnabled);
      
      // If enabling 2FA, show the QR code dialog
      if (!is2FAEnabled) {
        try {
          const resp = await axios.post(
            "http://127.0.0.1:5000/app/2fa",
            { email: userEmail },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            }
          );
          
          if (resp.data.qr_code) {
            setQrCode("data:image/png;base64," + resp.data.qr_code);
            setShowQRDialog(true);
          }
        } catch (error) {
          const axiosError = error as AxiosError;
          console.error("Error fetching QR code:", {
            message: axiosError.message,
            response: axiosError.response?.data,
            status: axiosError.response?.status
          });
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error updating 2FA status:", {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
    }
  };

  const handleCloseQRDialog = () => {
    setShowQRDialog(false);
  };

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        {/* 2FA Settings */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => setIs2FAOpen(!is2FAOpen)}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-200 transition-colors"
          >
            <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
            <svg
              className={`w-6 h-6 transform transition-transform ${
                is2FAOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {is2FAOpen && (
            <div className="p-4 border-t border-gray-200">
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    value="left"
                    control={
                      <Switch
                        checked={is2FAEnabled}
                        onChange={handle2FAToggle}
                      />
                    }
                    label="Two-Factor Authentication"
                    labelPlacement="start"
                  />
                </FormGroup>
              </FormControl>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog
        open={showQRDialog}
        onClose={handleCloseQRDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Set Up Two-Factor Authentication
          <IconButton
            aria-label="close"
            onClick={handleCloseQRDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center p-4">
            <p className="mb-4 text-center text-gray-600">
              Scan this QR code with your authenticator app to set up 2FA:
            </p>
            {qrCode && (
              <img
                src={qrCode}
                alt="QR code to set up 2FA"
                className="w-64 h-64"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Settings;

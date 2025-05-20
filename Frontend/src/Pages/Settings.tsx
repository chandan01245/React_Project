import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";

function Settings() {
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");

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
          status: axiosError.response?.status,
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

    if (is2FAEnabled) {
      // Disable 2FA
      try {
        await axios.post(
          "http://127.0.0.1:5000/app/update-2fa-status",
          { email: userEmail, is_2fa_enabled: false },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIs2FAEnabled(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Error updating 2FA status:", {
          message: axiosError.message,
          response: axiosError.response?.data,
          status: axiosError.response?.status,
        });
      }
    } else {
      // Enable 2FA - show QR code first
      try {
        const resp = await axios.post(
          "http://127.0.0.1:5000/app/2fa",
          { email: userEmail },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
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
          status: axiosError.response?.status,
        });
      }
    }
  };

  const handleCloseQRDialog = () => {
    setShowQRDialog(false);
  };

  const handleNextStep = () => {
    setShowQRDialog(false);
    setShowVerificationDialog(true);
  };

  const handleVerifyCode = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userEmail) {
      console.error("Token or email not found");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/app/verify-2fa",
        {
          email: userEmail,
          code: verificationCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update 2FA status in database
        await axios.post(
          "http://127.0.0.1:5000/app/update-2fa-status",
          { email: userEmail, is_2fa_enabled: true },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIs2FAEnabled(true);
        setShowVerificationDialog(false);
        setVerificationCode("");
        setVerificationError("");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      setVerificationError("Invalid verification code. Please try again.");
      console.error("Error verifying code:", {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
      });
    }
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
              position: "absolute",
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
              Scan this QR code with your authenticator app:
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
        <DialogActions>
          <Button onClick={handleCloseQRDialog}>Cancel</Button>
          <Button onClick={handleNextStep} variant="contained" color="primary">
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Code Dialog */}
      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, boxShadow: 3 },
        }}
      >
        <DialogTitle>
          Verify Setup
          <IconButton
            aria-label="close"
            onClick={() => setShowVerificationDialog(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
            padding: 3,
          }}
        >
          <Typography
            variant="body1"
            className="mb-4 text-center text-gray-600"
          >
            Enter the 6-digit code from your authenticator app:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Verification Code"
            variant="filled"
            type="text"
            fullWidth
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!verificationError}
            helperText={verificationError}
            inputProps={{ maxLength: 6 }}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 1,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowVerificationDialog(false);
              setShowQRDialog(true);
            }}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            onClick={handleVerifyCode}
            variant="contained"
            color="primary"
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Settings;

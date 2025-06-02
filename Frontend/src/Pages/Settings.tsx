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

function Settings() {
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const resp = await axios.get("http://127.0.0.1:5000/app/2fa-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIs2FAEnabled(resp.data.is_2fa_enabled);
        setUserEmail(resp.data.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  const handle2FAToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userEmail) return;

    if (is2FAEnabled) {
      try {
        await axios.post(
          "http://127.0.0.1:5000/app/update-2fa-status",
          { email: userEmail, is_2fa_enabled: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIs2FAEnabled(false);
      } catch (error) {
        console.error("Error disabling 2FA:", error);
      }
    } else {
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
        console.error("Error enabling 2FA:", error);
      }
    }
  };

  const handleVerifyCode = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userEmail) return;

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/app/verify-2fa",
        { email: userEmail, code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        await axios.post(
          "http://127.0.0.1:5000/app/update-2fa-status",
          { email: userEmail, is_2fa_enabled: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIs2FAEnabled(true);
        setShowVerificationDialog(false);
        setVerificationCode("");
        setVerificationError("");
      }
    } catch (error) {
      setVerificationError("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="p-4 text-black dark:text-white transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* 2FA Section */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setIs2FAOpen(!is2FAOpen)}
          className="w-full p-4 flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <FormControl component="fieldset">
              <FormGroup>
                <FormControlLabel
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

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Set Up Two-Factor Authentication
          <IconButton onClick={() => setShowQRDialog(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center">
            <p className="mb-4 text-center text-gray-600">Scan the QR code with your authenticator app:</p>
            {qrCode && <img src={qrCode} alt="QR Code" className="w-64 h-64" />}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            setShowQRDialog(false);
            setShowVerificationDialog(true);
          }} variant="contained">Next</Button>
        </DialogActions>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onClose={() => setShowVerificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Verify Setup
          <IconButton onClick={() => setShowVerificationDialog(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="bg-gray-50">
          <Typography className="mb-4">Enter the 6-digit code from your authenticator app:</Typography>
          <TextField
            autoFocus
            fullWidth
            label="Verification Code"
            variant="filled"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!verificationError}
            helperText={verificationError}
            inputProps={{ maxLength: 6 }}
            sx={{ backgroundColor: "white", borderRadius: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowVerificationDialog(false);
            setShowQRDialog(true);
          }}>Back</Button>
          <Button onClick={handleVerifyCode} variant="contained">Verify</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Settings;

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useEffect, useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function Settings() {
  // 2FA state
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");

  // USERS state
  const [users, setUsers] = useState<
    {
      email: string;
      password: string;
      username?: string;
      user_group?: string;
    }[]
  >([]);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState(""); // New state for username
  const [newUserGroup, setNewUserGroup] = useState(""); // New state for user group
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [userGroup, setUserGroup] = useState(""); // For admin check
  const [successMessage, setSuccessMessage] = useState(""); // Success message state


  // Fetch the initial 2FA status and email from the database
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
        // handle error if needed
      }
    }
    fetchUserData();
    // Get user group for admin check
    const group = localStorage.getItem("user_group") || "";
    setUserGroup(group);

  }, []);

  // USERS logic
  const fetchUsers = async () => {
    console.log("fetchUsers called");
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      console.log("API response:", res.data);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching users:", e);
      setUsers([]);
    }
  };

  const handleDelete = async (email: string) => {
    await axios.delete(
      `http://localhost:5000/api/users/${encodeURIComponent(email)}`
    );
    fetchUsers();
  };

  const handleAddUser = async () => {
    setError("");
    setSuccessMessage("");
    if (
      !newEmail ||
      !newUsername ||
      !newUserGroup ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/users", {
        email: newEmail,
        username: newUsername,
        user_group: newUserGroup,
        password: newPassword,
      });
      setSuccessMessage("User added successfully!");
      // Don't close dialog yet, wait for user to see message
      setNewEmail("");
      setNewUsername("");
      setNewUserGroup("");
      setNewPassword("");
      setConfirmPassword("");
      fetchUsers();
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to add user.");
    }
  };

  // 2FA logic
  const handle2FAToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userEmail) return;

    if (is2FAEnabled) {
      // Disable 2FA
      try {
        await axios.post(
          "http://127.0.0.1:5000/app/update-2fa-status",
          { email: userEmail, is_2fa_enabled: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIs2FAEnabled(false);
      } catch (error) {
        // handle error if needed
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
        // handle error if needed
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
        // Update 2FA status in database
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
    <div className="flex h-screen w-screen bg-background text-foreground transition-theme overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Only pass the pageTitle or nothing at all */}
        <Header />
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        {/* 2FA Settings */}
        <div className="bg-card rounded-lg overflow-hidden mb-6 transition-theme">
          <button
            onClick={() => setIs2FAOpen(!is2FAOpen)}
            className="w-full p-4 flex justify-between items-center hover:bg-muted transition-theme"
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
            <div className="p-4 border-t border-border transition-theme">
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

        {/* USERS Section (only for admin group) */}
        {userGroup === "admin" && (
          <div className="bg-card rounded-lg overflow-hidden mb-6 transition-theme">
            <button
              onClick={() => {
                if (!isUsersOpen) fetchUsers();
                setIsUsersOpen((prev) => !prev);
              }}
              className="w-full p-4 flex justify-between items-center hover:bg-muted transition-theme"
            >
              <h2 className="text-xl font-semibold">Users</h2>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  isUsersOpen ? "rotate-180" : ""
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
            {isUsersOpen && (
              <div className="p-4 border-t border-border transition-theme">
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: 2, boxShadow: 1 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Email</b>
                        </TableCell>
                        <TableCell>
                          <b>Password</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Action</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.email}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>********</TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(user.email)}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                boxShadow: "none",
                                minWidth: 0,
                                px: 2,
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                  }}
                >
                  Add User
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Add User Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSuccessMessage("");
            window.location.reload();
          }}
        >
          <DialogTitle>
            Add User
            <IconButton
              aria-label="close"
              onClick={() => {
                setAddDialogOpen(false);
                setSuccessMessage("");
                window.location.reload();
              }}
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
            <TextField
              label="User Email"
              fullWidth
              margin="normal"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <TextField
              label="User Group"
              fullWidth
              margin="normal"
              value={newUserGroup}
              onChange={(e) => setNewUserGroup(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {successMessage && (
              <Typography color="success.main" sx={{ mt: 1 }}>
                {successMessage}
              </Typography>
            )}
            {error && !successMessage && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleAddUser}
              variant="contained"
              color="primary"
              sx={{ background: "#1976d2" }}
              disabled={!!successMessage}
            >
              Add
            </Button>
            <Button
              onClick={() => {
                setAddDialogOpen(false);
                setSuccessMessage("");
                fetchUsers();
              }}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

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
              <p className="mb-4 text-center text-muted-foreground transition-theme">
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
            <Button
              onClick={handleNextStep}
              variant="contained"
              color="primary"
            >
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
              padding: 3,
            }}
          >
            <Typography
              variant="body1"
              className="mb-4 text-center text-muted-foreground"
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
    </div>
  );
}

export default Settings;

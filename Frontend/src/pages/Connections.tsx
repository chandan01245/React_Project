import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const Connections: React.FC = () => {
  const [ldapDialogOpen, setLdapDialogOpen] = useState(false);
  const [ldapUsers, setLdapUsers] = useState<any[]>([]);
  const [ldapLoading, setLdapLoading] = useState(false);
  const [baseDN, setBaseDN] = useState("dc=example,dc=com");
  const [ldapURI, setLdapURI] = useState("ldap://192.168.1.5");
  const [ldapFilter, setLdapFilter] = useState("(|(objectClass=person)(objectClass=inetOrgPerson))");
  const [ldapError, setLdapError] = useState<string | null>(null);
  const [bindDN, setBindDN] = useState("cn=admin,dc=example,dc=com");
  const [bindPassword, setBindPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [useStartTLS, setUseStartTLS] = useState(false);
  const [useSSL, setUseSSL] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const openDialog = () => setLdapDialogOpen(true);
  const closeDialog = () => setLdapDialogOpen(false);

  const fetchUsers = async () => {
    setLdapLoading(true);
    setLdapError(null);
    setLdapUsers([]);
    try {
      const params: Record<string,string> = { base: baseDN, uri: ldapURI, filter: ldapFilter };
      if (bindDN.trim()) params.bind_dn = bindDN.trim();
      if (bindPassword) params.bind_password = bindPassword;
      if (useStartTLS) params.starttls = '1';
      if (useSSL) params.ssl = '1';
      if (debugMode) params.debug = '1';
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/ldap/users?${qs}`);
      const data = await res.json();
      if (data.status === 'success') {
        setLdapUsers(data.users || []);
      } else {
        setLdapError(data.message || 'Failed to fetch users');
        if (debugMode && data.detail) console.warn('LDAP detail', data.detail);
      }
    } catch (e: any) {
      setLdapError(e.message || 'Network error');
    } finally {
      setLdapLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <Typography variant="h4" fontWeight="bold" mb={4}>
            <span className="text-3xl font-bold text-foreground">Remote Connections</span>
          </Typography>
          <Paper sx={{ p:3, maxWidth: 'md', margin: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">LDAP Directory Users</Typography>
              <Button variant="contained" onClick={openDialog}>Connect to LDAP Server</Button>
            </Box>
            {ldapError && <Alert severity="error" sx={{ mb:2 }}>{ldapError}</Alert>}
            {ldapLoading && <CircularProgress size={28} />}
            {!ldapLoading && ldapUsers.length > 0 && (
              <Paper variant="outlined" sx={{ maxHeight:400, overflow:'auto' }}>
                <List dense>
                  {ldapUsers.map((u: any, i: number) => (
                    <ListItem key={i} divider>
                      <ListItemText primary={u.cn || u.uid || u.dn} secondary={u.mail || u.dn} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            {!ldapLoading && ldapUsers.length === 0 && !ldapError && (
              <Typography variant="body2" color="text.secondary">No users loaded yet. Click Connect to query.</Typography>
            )}
          </Paper>
        </div>
      </div>
      <Dialog open={ldapDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Connect to LDAP Server</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth margin="normal" label="Base DN" value={baseDN} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setBaseDN(e.target.value)} />
          <TextField fullWidth margin="normal" label="LDAP URI" value={ldapURI} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setLdapURI(e.target.value)} helperText="Example: ldap://host:389 or ldaps://host:636" />
          <TextField fullWidth margin="normal" label="Filter" value={ldapFilter} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setLdapFilter(e.target.value)} helperText="LDAP search filter" />
          <TextField fullWidth margin="normal" label="Bind DN (optional)" value={bindDN} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setBindDN(e.target.value)} helperText="Leave empty for anonymous (if allowed)" />
          <TextField fullWidth margin="normal" label="Bind Password" type={showPassword ? 'text' : 'password'} value={bindPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setBindPassword(e.target.value)} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={()=>setShowPassword((prev: boolean)=>!prev)} edge="end" size="small">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
          <Box display="flex" flexWrap="wrap" columnGap={2}>
            <FormControlLabel control={<Checkbox checked={useStartTLS} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUseStartTLS(e.target.checked)} disabled={useSSL || ldapURI.startsWith('ldaps://')} />} label="StartTLS" />
            <FormControlLabel control={<Checkbox checked={useSSL} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUseSSL(e.target.checked)} disabled={useStartTLS} />} label="SSL" />
            <Tooltip title="Include diagnostic info (avoid in prod)"><FormControlLabel control={<Checkbox checked={debugMode} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDebugMode(e.target.checked)} />} label="Debug" /></Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={()=>{ setBindPassword(''); setLdapUsers([]); setLdapError(null); }} disabled={ldapLoading}>Clear</Button>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={fetchUsers} disabled={ldapLoading}>Fetch Users</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Connections;

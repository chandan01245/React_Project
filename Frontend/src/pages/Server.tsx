import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FiPlus, FiRefreshCcw, FiTrash2 } from 'react-icons/fi';
import { createServer, deleteServer, fetchServers, refreshServer, ServerRecord } from '../api/servers';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Server: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [servers, setServers] = useState<ServerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hostname, setHostname] = useState('');
  const [bmcIp, setBmcIp] = useState('');
  const [authMethod, setAuthMethod] = useState<'ssh-key' | 'root-password'>('ssh-key');
  const [sshKey, setSshKey] = useState('');
  const [rootPassword, setRootPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await fetchServers();
        setServers(list);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const resetForm = () => {
    setHostname('');
    setBmcIp('');
    setAuthMethod('ssh-key');
    setSshKey('');
    setRootPassword('');
  };

  const handleAdd = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const server = await createServer({
        hostname: hostname.trim(),
        bmc_ip: bmcIp.trim() || undefined,
        auth_method: authMethod,
        ssh_key: authMethod === 'ssh-key' ? sshKey || undefined : undefined,
        root_password: authMethod === 'root-password' ? rootPassword : undefined
      });
      setServers(prev => [server, ...prev]);
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    const old = servers;
    setServers(prev => prev.filter(s => s.id !== id));
    try {
      await deleteServer(id);
    } catch (e: any) {
      setError(e.message);
      setServers(old); // rollback
    }
  };

  const handleRefresh = async (id: number) => {
    try {
      const updated = await refreshServer(id);
      setServers(prev => prev.map(s => s.id === id ? updated : s));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const stateColor = (state: ServerRecord['state']) => {
    switch (state) {
      case 'Up': return 'success';
      case 'Down': return 'error';
      default: return 'default';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={600}>Server Management</Typography>
            <Button variant="contained" startIcon={<FiPlus />} onClick={() => setDialogOpen(true)}>Add Server</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Hostname</TableCell>
                  <TableCell>BMC IP</TableCell>
                  <TableCell>Auth Method</TableCell>
                  <TableCell>Server State</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py:4 }}>Loading...</TableCell>
                  </TableRow>
                )}
                {!loading && servers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py:4, color:'text.secondary' }}>
                      No servers added yet.
                    </TableCell>
                  </TableRow>
                )}
                {servers.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.hostname}</TableCell>
                    <TableCell>{s.bmc_ip || '-'}</TableCell>
                    <TableCell>{s.auth_method === 'ssh-key' ? 'SSH Key' : 'Root Password'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={s.state} color={stateColor(s.state) as any} variant={s.state==='Unconfigured' ? 'outlined' : 'filled'} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Refresh State">
                        <IconButton size="small" onClick={() => handleRefresh(s.id)}>
                          <FiRefreshCcw />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => handleRemove(s.id)}>
                          <FiTrash2 />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Server</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label="Hostname/IP *"
            value={hostname}
            onChange={e => setHostname(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="BMC IP"
            value={bmcIp}
            onChange={e => setBmcIp(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="auth-method-label">Authentication Method</InputLabel>
            <Select
              labelId="auth-method-label"
              label="Authentication Method"
              value={authMethod}
              onChange={e => setAuthMethod(e.target.value as any)}
            >
              <MenuItem value="ssh-key">SSH Key</MenuItem>
              <MenuItem value="root-password">Root Password</MenuItem>
            </Select>
          </FormControl>
          {authMethod === 'ssh-key' ? (
            <TextField
              fullWidth
              margin="normal"
              label="SSH Key (Optional)"
              value={sshKey}
              onChange={e => setSshKey(e.target.value)}
              multiline
              minRows={4}
              placeholder="Paste SSH private key here..."
            />
          ) : (
            <TextField
              fullWidth
              margin="normal"
              label="Root Password"
              type="password"
              value={rootPassword}
              onChange={e => setRootPassword(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!hostname.trim() || submitting || (authMethod === 'root-password' && !rootPassword)}
            onClick={handleAdd}
          >
            {submitting ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Server;
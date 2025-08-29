export interface ServerRecord {
  id: number;
  hostname: string;
  bmc_ip?: string;
  auth_method: 'ssh-key' | 'root-password';
  state: 'Up' | 'Down' | 'Unconfigured';
  created_at?: string;
  updated_at?: string;
}

const BASE = ''; // same origin proxy

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
  if (!res.ok) {
    throw new Error(data.error || data.message || res.statusText);
  }
  return data as T;
}

export async function fetchServers(): Promise<ServerRecord[]> {
  const res = await fetch(`${BASE}/api/servers`);
  const data = await parse<{servers: ServerRecord[]}>(res);
  return data.servers;
}

export async function createServer(payload: {
  hostname: string;
  bmc_ip?: string;
  auth_method: 'ssh-key' | 'root-password';
  ssh_key?: string;
  root_password?: string;
}): Promise<ServerRecord> {
  const res = await fetch(`${BASE}/api/servers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await parse<{server: ServerRecord}>(res);
  return data.server;
}

export async function deleteServer(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/servers/${id}`, { method: 'DELETE' });
  await parse(res);
}

export async function refreshServer(id: number): Promise<ServerRecord> {
  const res = await fetch(`${BASE}/api/servers/${id}/refresh`, { method: 'POST' });
  const data = await parse<{server: ServerRecord}>(res);
  return data.server;
}
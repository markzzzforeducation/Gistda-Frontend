// Support both VITE_ and NEXT_PUBLIC_ for compatibility
// If no API_BASE is set, use empty string (will use Vite proxy)
// Otherwise use the provided URL (useful when backend is on different host/port)
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.NEXT_PUBLIC_API_BASE || '';

// Debug: Log API base URL in development
if (import.meta.env.DEV) {
  const finalApiBase = API_BASE || '(using Vite proxy)';
  console.log('[API] API Base URL:', finalApiBase);
  console.log('[API] Environment variables:', {
    VITE_API_BASE: import.meta.env.VITE_API_BASE || '(not set)',
    NEXT_PUBLIC_API_BASE: import.meta.env.NEXT_PUBLIC_API_BASE || '(not set)',
  });
  if (!API_BASE) {
    console.log('[API] Using Vite proxy for /api requests (target: http://localhost:5174)');
  }
}

function getAuthToken(): string | null {
  return sessionStorage.getItem('kb-token');
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let message = 'Request failed';
  try {
    const data = await res.json();
    message = (data && (data.details || data.error || data.message)) || message;
  } catch {
    try { message = await res.text(); } catch { /* ignore */ }
  }
  throw new Error(message);
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
  try { console.debug('[API][GET]', url, res.status); } catch { }
  return handle<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body ?? {}) });
  try { console.debug('[API][POST]', url, res.status, body); } catch { }
  return handle<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body ?? {}) });
  try { console.debug('[API][PUT]', url, res.status, body); } catch { }
  return handle<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() } });
  try { console.debug('[API][DELETE]', url, res.status); } catch { }
  return handle<T>(res);
}

export function setAuthToken(token: string | null) {
  if (token) sessionStorage.setItem('kb-token', token);
  else sessionStorage.removeItem('kb-token');
}

// Google OAuth helper functions
export async function initiateGoogleAuth(): Promise<string> {
  // This function will redirect to Google OAuth or return auth URL
  // For now, we'll simulate the flow
  const res = await apiPost<{ authUrl: string }>('/api/auth/google/initiate', {});
  return res.authUrl;
}

export async function handleGoogleCallback(code: string): Promise<{ token: string; user: { id: string; name: string; email: string } }> {
  const res = await apiPost<{ token: string; user: { id: string; name: string; email: string } }>('/api/auth/google/callback', { code });
  return res;
}



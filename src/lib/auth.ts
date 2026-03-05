const AUTH_BASE = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000';
const CLIENT_ID = 'mortar-app';
const SCOPES = 'openid profile offline_access';

const TOKEN_KEY = 'mortar_tokens';

export type User = {
  sub: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export type TokenSet = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_at: number;
};

// --- Token persistence ---

export function loadTokens(): TokenSet | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveTokens(tokens: TokenSet) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
}

// --- Parse ID token claims ---

export function parseIdToken(idToken: string): User | null {
  try {
    const payload = idToken.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json);
    return {
      sub: claims.sub,
      username: claims.username,
      display_name: claims.display_name,
      avatar_url: claims.avatar_url || null,
    };
  } catch {
    return null;
  }
}

// --- Token refresh ---

async function refreshAccessToken(refreshToken: string): Promise<TokenSet | null> {
  try {
    const res = await fetch(`${AUTH_BASE}/oidc/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const tokens: TokenSet = {
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };
    saveTokens(tokens);
    return tokens;
  } catch {
    return null;
  }
}

// --- Get a valid access token (refreshing if needed) ---

export async function getAccessToken(): Promise<string | null> {
  let tokens = loadTokens();
  if (!tokens) return null;

  if (tokens.expires_at - Date.now() < 60_000) {
    if (tokens.refresh_token) {
      tokens = await refreshAccessToken(tokens.refresh_token);
      if (!tokens) return null;
    } else {
      return null;
    }
  }

  return tokens.access_token;
}

// --- Login ---

export async function login(username: string, password: string): Promise<{ tokens: TokenSet; user: User }> {
  const res = await fetch(`${AUTH_BASE}/oidc/token/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, client_id: CLIENT_ID, scope: SCOPES }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || 'Login failed');
  }

  const data = await res.json();
  const tokens: TokenSet = {
    access_token: data.access_token,
    id_token: data.id_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  saveTokens(tokens);

  const user = parseIdToken(tokens.id_token);
  if (!user) throw new Error('Invalid token');

  return { tokens, user };
}

// --- Register ---

export async function register(email: string, username: string, password: string): Promise<{ tokens: TokenSet; user: User }> {
  const res = await fetch(`${AUTH_BASE}/oidc/token/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, client_id: CLIENT_ID, scope: SCOPES }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || 'Registration failed');
  }

  const data = await res.json();
  const tokens: TokenSet = {
    access_token: data.access_token,
    id_token: data.id_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  saveTokens(tokens);

  const user = parseIdToken(tokens.id_token);
  if (!user) throw new Error('Invalid token');

  return { tokens, user };
}

// --- Logout ---

export async function logout() {
  const tokens = loadTokens();
  if (tokens?.refresh_token) {
    fetch(`${AUTH_BASE}/oidc/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: tokens.refresh_token }),
    }).catch(() => {});
  }
  clearTokens();
}

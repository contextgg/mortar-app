import { getAccessToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type MapSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  maps: MapSummary[];
  stats: {
    map_count: number;
    total_likes: number;
    tournaments_played: number;
  };
};

export type Tournament = {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  max_players: number;
  player_count: number;
  organizer_name: string;
  starts_at: string | null;
  created_at: string;
};

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  const token = await getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  maps: {
    list: (q?: string) => fetchApi<MapSummary[]>(`/api/maps${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    get: (slug: string) => fetchApi<MapSummary>(`/api/maps/${slug}`),
  },
  users: {
    profile: (username: string) => fetchApi<UserProfile>(`/api/users/${username}`),
  },
  tournaments: {
    list: (status?: string) => fetchApi<Tournament[]>(`/api/tournaments${status ? `?status=${status}` : ''}`),
    get: (id: string) => fetchApi<Tournament>(`/api/tournaments/${id}`),
    join: (id: string) => fetchApi<{ ok: boolean }>(`/api/tournaments/${id}/join`, { method: 'POST' }),
    leave: (id: string) => fetchApi<{ ok: boolean }>(`/api/tournaments/${id}/leave`, { method: 'POST' }),
  },
};

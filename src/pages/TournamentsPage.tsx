import { useState, useEffect } from 'react';
import { api, type Tournament } from '../lib/api';

export function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.tournaments.list(filter || undefined)
      .then(setTournaments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Tournaments</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-mortar-500"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading tournaments...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-gray-500">No tournaments found.</p>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-100">{t.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  t.status === 'open' ? 'bg-green-900/50 text-green-400' :
                  t.status === 'in_progress' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              {t.description && <p className="text-sm text-gray-400 mb-2">{t.description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>by {t.organizer_name}</span>
                <span>{t.player_count}/{t.max_players} players</span>
                {t.starts_at && <span>Starts {new Date(t.starts_at).toLocaleDateString()}</span>}
              </div>
              {t.status === 'open' && (
                <button
                  onClick={() => api.tournaments.join(t.id).catch(console.error)}
                  className="mt-3 bg-mortar-600 hover:bg-mortar-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Join Tournament
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

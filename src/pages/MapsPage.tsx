import { useState, useEffect } from 'react';
import { api, type MapSummary } from '../lib/api';
import { launchGame } from '../lib/game';
import { MapCard } from '../components/MapCard';

export function MapsPage() {
  const [maps, setMaps] = useState<MapSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.maps.list(search || undefined)
      .then(setMaps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const handlePlay = async (map: MapSummary) => {
    try {
      await launchGame(map.slug);
    } catch (err) {
      console.error('Failed to launch game:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Maps</h2>
        <input
          type="text"
          placeholder="Search maps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-mortar-500 w-64"
        />
      </div>
      {loading ? (
        <p className="text-gray-500">Loading maps...</p>
      ) : maps.length === 0 ? (
        <p className="text-gray-500">No maps found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maps.map((map) => (
            <MapCard key={map.id} map={map} onPlay={handlePlay} />
          ))}
        </div>
      )}
    </div>
  );
}

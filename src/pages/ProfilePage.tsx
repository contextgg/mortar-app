import { useState, useEffect } from 'react';
import { api, type UserProfile } from '../lib/api';
import { useAuthStore } from '../lib/store';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.users.profile(user.username)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="text-gray-500">Loading profile...</p>;
  if (!profile) return <p className="text-gray-500">Could not load profile.</p>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        {profile.avatar_url && (
          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full" />
        )}
        <div>
          <h2 className="text-2xl font-bold">{profile.display_name}</h2>
          <p className="text-gray-500">@{profile.username}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-mortar-400">{profile.stats.map_count}</p>
          <p className="text-sm text-gray-500">Maps</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-mortar-400">{profile.stats.total_likes}</p>
          <p className="text-sm text-gray-500">Likes</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-mortar-400">{profile.stats.tournaments_played}</p>
          <p className="text-sm text-gray-500">Tournaments</p>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-4">Your Maps</h3>
      {profile.maps.length === 0 ? (
        <p className="text-gray-500">No published maps yet.</p>
      ) : (
        <div className="space-y-2">
          {profile.maps.map((map) => (
            <div key={map.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex justify-between items-center">
              <span className="font-medium">{map.title}</span>
              <span className="text-sm text-gray-500">{map.likes} likes</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

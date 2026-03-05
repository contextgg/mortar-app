import { useAuthStore } from '../lib/store';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-6 max-w-lg">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Mortar Engine</h3>
          <p className="text-sm text-gray-400 mb-3">Path to the mortar binary used to launch games.</p>
          <input
            type="text"
            placeholder="/usr/local/bin/mortar"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-mortar-500"
          />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Account</h3>
          {user && (
            <div className="flex items-center gap-3 mb-3">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-200">{user.display_name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

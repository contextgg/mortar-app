export function SettingsPage() {
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
          <p className="text-sm text-gray-400 mb-3">Sign in with GitHub or Discord to save maps and join tournaments.</p>
          <div className="flex gap-2">
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/github`}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              GitHub
            </a>
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/discord`}
              className="px-4 py-2 text-sm bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300 rounded-lg transition-colors"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

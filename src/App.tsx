import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Sidebar } from './components/Sidebar';
import { MapsPage } from './pages/MapsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TournamentsPage } from './pages/TournamentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './lib/store';
import { checkEngine } from './lib/engine';

export function App() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const init = useAuthStore((s) => s.init);
  const [status, setStatus] = useState<string | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  // Check for app updates on launch
  useEffect(() => {
    check().then(async (update) => {
      if (update) {
        setStatus(`Updating app to v${update.version}...`);
        await update.downloadAndInstall();
        await relaunch();
      }
    }).catch(() => {});
  }, []);

  // Check engine after auth
  useEffect(() => {
    if (!user) return;
    setStatus('Checking engine...');
    checkEngine()
      .then(() => setStatus(null))
      .catch((err) => {
        setEngineError(typeof err === 'string' ? err : 'Failed to update engine');
        setStatus(null);
      });
  }, [user]);

  if (loading || status) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-500">{status || 'Loading...'}</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {engineError && (
          <div className="mb-4 bg-yellow-900/30 border border-yellow-700 rounded-lg px-4 py-3 text-sm text-yellow-300">
            {engineError}
          </div>
        )}
        <Routes>
          <Route path="/" element={<MapsPage />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

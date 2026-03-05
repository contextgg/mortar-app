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

export function App() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const init = useAuthStore((s) => s.init);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    check().then(async (update) => {
      if (update) {
        setUpdateStatus(`Updating to v${update.version}...`);
        await update.downloadAndInstall();
        await relaunch();
      }
    }).catch(() => {});
  }, []);

  if (loading || updateStatus) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-500">{updateStatus || 'Loading...'}</p>
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

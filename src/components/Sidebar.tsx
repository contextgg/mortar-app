import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

const links = [
  { to: '/maps', label: 'Maps' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-mortar-400">Mortar</h1>
        <p className="text-xs text-gray-500">ctx.gg</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-mortar-600/20 text-mortar-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            {user.avatar_url && (
              <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-200 truncate">{user.display_name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors text-left px-1"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

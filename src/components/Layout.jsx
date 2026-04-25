import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/questions', label: 'Questions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-surface-0 flex relative z-[1]">

      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-surface-1 border-r border-surface-3 relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-surface-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center shadow-glow-sm">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5l4 4-4 4M9 13h6" stroke="#0d1117" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-ink-base tracking-tight">DSA Tracker</div>
              <div className="text-[11px] text-ink-muted font-mono mt-0.5">problem log</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 pt-4">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-surface-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400/15 border border-lime-400/25 flex items-center justify-center text-lime-400 font-display font-bold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-display font-semibold text-ink-base truncate">{user?.name}</div>
              <div className="text-[11px] text-ink-muted truncate font-mono">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-xs text-ink-muted hover:text-red-400 py-2 transition-colors font-mono text-left px-3"
          >
            ↩ sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

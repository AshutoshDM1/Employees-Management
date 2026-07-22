import { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  User,
  Loader2,
  Menu,
  LayoutDashboard,
  Users,
  Network,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function Dasboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Sign out failed:', err);
      setSigningOut(false);
    }
  };

  const navLinks = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Employees',
      path: '/dashboard/employees',
      icon: Users,
      exact: false,
    },
    {
      name: 'Org Hierarchy',
      path: '/dashboard/hierarchy',
      icon: Network,
      exact: false,
    },
    {
      name: 'My Profile',
      path: '/dashboard/profile',
      icon: User,
      exact: false,
    },
  ];

  const checkActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'SUPER_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
          <ShieldCheck className="h-3 w-3" /> Super Admin
        </span>
      );
    }
    if (role === 'HR_MANAGER') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold">
          <UserCheck className="h-3 w-3" /> HR Manager
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
        <User className="h-3 w-3" /> Employee
      </span>
    );
  };

  return (
    <div className="flex h-screen w-full relative bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl z-20">
        {/* Brand header */}
        <div className="flex items-center space-x-3 px-6 py-5 border-b border-zinc-800/80">
          <div className="p-2 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 text-white font-black text-sm tracking-wider">
            EMS
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white">VEDAZ EMS</h2>
            <p className="text-[10px] text-zinc-500">Enterprise Console</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 flex flex-col min-h-0 pt-6 justify-between">
          <nav className="px-4 space-y-1.5">
            {navLinks.map((link) => {
              const isActive = checkActive(link.path, link.exact);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-xs ${
                    isActive
                      ? 'bg-linear-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 border border-indigo-500/30 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <link.icon
                    className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile bottom footer */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 space-y-3">
            <div className="flex items-center space-x-3">
              <img
                src={
                  user?.image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt={user?.name}
                className="h-9 w-9 rounded-full object-cover border border-zinc-700/60"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</p>
                <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
            >
              {signingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-zinc-950 border-r border-zinc-800 h-full p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-indigo-500 text-white font-bold text-xs">
                  EMS
                </div>
                <span className="text-sm font-bold text-white">VEDAZ EMS</span>
              </div>
              <button
                className="text-zinc-400 hover:text-white p-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navLinks.map((link) => {
                const isActive = checkActive(link.path, link.exact);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    user?.image ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover border border-zinc-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                {signingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content View */}
      <div className="flex-1 w-full flex flex-col h-full bg-zinc-900/10 backdrop-blur-sm z-10 overflow-hidden relative">
        {/* Mobile Header Bar */}
        <div className="md:hidden px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1 rounded-md bg-indigo-500 text-white font-bold text-[10px]">EMS</div>
            <span className="text-xs font-semibold tracking-wider text-white">VEDAZ EMS</span>
          </div>
          <button
            className="text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Nested Route Pages Outlet */}
        <div className="flex-1 h-full overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, User, Loader2, Menu, LayoutDashboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dasboard() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await authClient.signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out failed:', err);
      setSigningOut(false);
    }
  };

  const navLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Profile Settings',
      path: '/dashboard/profile',
      icon: User,
      exact: false,
    },
  ];

  const checkActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && location.pathname !== '/dashboard';
  };

  return (
    <div className="flex h-screen w-full relative bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar navigation for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900/20 backdrop-blur-md z-20">
        {/* Brand header */}
        <div className="flex items-center space-x-3 p-[20.5px] border-b border-zinc-800/80">
          <img src="/favicon.svg" alt="EMS Logo" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold tracking-wider bg-linear-to-b from-white to-zinc-300 bg-clip-text text-transparent">
            VEDAZ EMS
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 flex flex-col min-h-0 pt-6 justify-between">
          <nav className="px-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = checkActive(link.path, link.exact);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <link.icon className="h-4.5 w-4.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile bottom footer */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/10">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-9 w-9 border border-zinc-800">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-indigo-950 text-indigo-400">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {session?.user?.name || 'Loading User...'}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{session?.user?.email}</p>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              disabled={signingOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-zinc-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 rounded-lg cursor-pointer"
            >
              {signingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-2" />
              )}
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-zinc-950 border-r border-zinc-800 h-full p-6 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <img src="/favicon.svg" alt="EMS Logo" className="h-7 w-7 object-contain" />
                <span className="text-lg font-bold tracking-wider text-white">VEDAZ EMS</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 justify-between">
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = checkActive(link.path, link.exact);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <link.icon className="h-4.5 w-4.5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <div className="flex items-center space-x-3 mb-2 px-2">
                  <Avatar className="h-8 w-8 border border-zinc-800">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-indigo-950 text-indigo-400">
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {session?.user?.name || 'Loading User...'}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">{session?.user?.email}</p>
                  </div>
                </div>

                <Button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg cursor-pointer border border-transparent hover:border-red-900/40"
                >
                  {signingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                  )}
                  Log Out
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main layout container */}
      <div className="flex-1 w-full flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm z-10 overflow-hidden relative">
        {/* Toggle mobile menu button in layout header */}
        <div className="md:hidden p-4 border-b border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="EMS Logo" className="h-6 w-6 object-contain" />
            <span className="text-sm font-semibold tracking-wider text-white">VEDAZ EMS</span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Outlet for Nested Pages */}
        <div className="flex-1 h-full overflow-hidden">
          <Outlet context={{ setMobileMenuOpen }} />
        </div>
      </div>
    </div>
  );
}

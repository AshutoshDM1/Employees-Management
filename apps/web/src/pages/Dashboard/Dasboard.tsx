import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useNavigate, Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useUsersQuery } from '@/hooks/useUsers';
import { LogOut, User, Loader2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dasboard() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeUserId = searchParams.get('userid');

  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Fetch users using custom react-query hook
  const { data: users = [], isLoading: loadingUsers } = useUsersQuery();

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

  const filteredUsers = users.filter((u) => u.id !== session?.user?.id);

  return (
    <div className="flex h-screen w-full relative bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar navigation for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900/20 backdrop-blur-md z-20">
        {/* Brand header using favicon.svg */}
        <div className="flex items-center space-x-3 p-[20.5px] border-b border-zinc-800/80">
          <img src="/favicon.svg" alt="Vedaz Logo" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold tracking-wider bg-linear-to-b from-white to-zinc-300 bg-clip-text text-transparent">
            VEDAZ Chat
          </span>
        </div>

        {/* Navigation / Users list */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* User List Panel */}
          <div className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3">
              Direct Messages
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-5 w-5 animate-spin text-zinc-650" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-xs text-zinc-600 text-center py-4">No other users active</div>
            ) : (
              <nav className="space-y-1">
                {filteredUsers.map((user) => {
                  const isActive = location.pathname === '/chat' && activeUserId === user.id;
                  const isOnline = onlineUsers.includes(user.id);
                  return (
                    <Link
                      key={user.id}
                      to={`/chat?userid=${user.id}`}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-6.5 w-6.5 border border-zinc-850">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="bg-indigo-950 text-indigo-400 text-[10px] font-semibold">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-zinc-950" />
                        )}
                      </div>
                      <span className="text-sm truncate font-medium">{user.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Profile link in separate section at bottom of sidebar list */}
          <div className="px-4 pb-4">
            <Link
              to="/profile"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                location.pathname === '/profile'
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              <span className="text-sm">Profile Settings</span>
            </Link>
          </div>
        </div>

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
            Disconnect Portal
          </Button>
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
            <div className="flex items-center space-x-3 pb-6 border-b border-zinc-800">
              <img src="/favicon.svg" alt="Vedaz Logo" className="h-7 w-7 object-contain" />
              <span className="text-lg font-bold tracking-wider text-white">VEDAZ</span>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-4">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Direct Messages
              </div>
              <nav className="space-y-1">
                {filteredUsers.map((user) => {
                  const isActive = location.pathname === '/chat' && activeUserId === user.id;
                  const isOnline = onlineUsers.includes(user.id);
                  return (
                    <Link
                      key={user.id}
                      to={`/chat?userid=${user.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-6 w-6 border border-zinc-800">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="bg-indigo-950 text-indigo-400 text-[10px] font-semibold">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-zinc-950" />
                        )}
                      </div>
                      <span className="text-sm truncate">{user.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

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

              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/profile'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Profile Settings</span>
                </Link>

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
                  Disconnect Portal
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main layout container */}
      <div className="flex-1 w-full flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm z-10 overflow-hidden relative">
        {/* Outlet for Nested Pages */}
        <div className="flex-1 h-full overflow-hidden">
          <Outlet context={{ onlineUsers, setMobileMenuOpen }} />
        </div>
      </div>
    </div>
  );
}

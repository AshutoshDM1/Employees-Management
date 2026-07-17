import { authClient } from '@/lib/auth-client';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, ShieldCheck, Info, Calendar, Lock, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { data: session } = authClient.useSession();
  const { setMobileMenuOpen } = useOutletContext<{ setMobileMenuOpen: (open: boolean) => void }>();

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm overflow-y-auto">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/40 flex items-center">
        <Button
          variant="ghost"
          size="icon-xs"
          className="md:hidden text-zinc-400 hover:text-zinc-100 mr-3 cursor-pointer"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-sm font-semibold text-zinc-200">User Profile</h1>
          <p className="text-[10px] text-zinc-500">
            Manage account credentials and security tokens
          </p>
        </div>
      </header>

      {/* Main content grid */}
      <div className="p-6 max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24 border-2 border-indigo-500/20 ring-4 ring-indigo-500/10">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="bg-indigo-950 text-indigo-400">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                {session?.user?.name || 'Authorized Client'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center md:justify-start">
                <Mail className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                {session?.user?.email}
              </p>
            </div>

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Portal Access Granted
            </div>
          </div>
        </div>

        {/* Credentials & Security details */}
        <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
            <Info className="h-3.5 w-3.5 mr-1.5" />
            Security & Session Context
          </h3>

          <div className="divide-y divide-zinc-800/60 text-xs">
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-500 flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1.5 text-zinc-650" />
                Provider
              </span>
              <span className="text-zinc-300 font-medium capitalize">Google SSO</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-500 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-zinc-650" />
                Account Created
              </span>
              <span className="text-zinc-300 font-medium">
                {session?.user?.createdAt
                  ? new Date(session.user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex flex-col space-y-2 py-3">
              <span className="text-zinc-500">Session Identifier Token</span>
              <span className="font-mono text-[10px] text-zinc-405 truncate select-all cursor-pointer bg-zinc-950/40 p-2 rounded-md hover:bg-zinc-950/60 transition-colors border border-zinc-900">
                {session?.session?.id || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

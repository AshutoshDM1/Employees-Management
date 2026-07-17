import { Navigate } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import Auth from './components/Auth';

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 select-none">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-zinc-400 mt-4 animate-pulse">Please wait...</p>
      </div>
    );
  }

  // Redirect to /chat if authenticated
  if (session) {
    return <Navigate to="/chat" replace />;
  }

  // Render Auth component if not authenticated
  return <Auth />;
}

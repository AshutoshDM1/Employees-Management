import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authClient } from '@/lib/auth-client';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setSocket(null);
      return;
    }

    const backendUrl =
      import.meta.env['VITE_BACKEND-URL'] ||
      import.meta.env.VITE_BACKEND_URL ||
      'http://localhost:3000';

    const s = io(backendUrl);
    setSocket(s);

    s.emit('register', session.user.id);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [session?.user?.id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

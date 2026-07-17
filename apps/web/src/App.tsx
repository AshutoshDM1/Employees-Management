import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './hooks/useSocket';
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import Dasboard from './pages/Dashboard/Dasboard';
import Profile from './pages/Profile/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Protected Portal Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Dasboard layout wraps /chat and /profile */}
              <Route element={<Dasboard />}>
                <Route path="chat" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Fallback Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home/Home';
import Dasboard from './pages/Dashboard/Dasboard';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
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
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Protected Portal Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dasboard />}>
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback Catch-All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

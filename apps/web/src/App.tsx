import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Dasboard from './pages/Dashboard/Dasboard';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import EmployeesList from './pages/Dashboard/EmployeesList';
import OrgHierarchy from './pages/Dashboard/OrgHierarchy';
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Portal Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dasboard />}>
                <Route index element={<DashboardOverview />} />
                <Route path="employees" element={<EmployeesList />} />
                <Route path="hierarchy" element={<OrgHierarchy />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Fallback Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

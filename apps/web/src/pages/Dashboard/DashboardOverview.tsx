import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeApi } from '../../services/api';
import type { DashboardStats } from '../../types';
import {
  Users,
  UserCheck,
  UserMinus,
  Building2,
  Loader2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees ?? 0,
      description: 'Active + Inactive workforce',
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: 'All Roles',
    },
    {
      title: 'Active Employees',
      value: stats?.activeEmployees ?? 0,
      description: 'Currently on active status',
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Active',
    },
    {
      title: 'Inactive Employees',
      value: stats?.inactiveEmployees ?? 0,
      description: 'On leave or inactive status',
      icon: UserMinus,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: 'Inactive',
    },
    {
      title: 'Departments',
      value: stats?.departmentCount ?? 0,
      description: 'Active organizational units',
      icon: Building2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'Units',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm overflow-y-auto font-sans">
      {/* Header */}
      <header className="px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-linear-to-b from-white to-zinc-300 bg-clip-text text-transparent">
            Employee Management Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span> (
            {user?.role?.replace('_', ' ')}). Here is your live organization metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/employees"
            className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Manage Employees</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md flex items-center justify-between transition-all duration-300 hover:border-zinc-700/60 shadow-lg"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded-md" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </h3>
                )}
                <p className="text-[11px] text-zinc-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-2xl border ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Department Distribution Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  <span>Department Headcount Distribution</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Distribution of employees across company units
                </p>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium bg-zinc-800/60 px-2.5 py-1 rounded-full border border-zinc-700/40">
                {stats?.departments.length || 0} Units
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center text-zinc-500 gap-2 text-xs">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading statistics...</span>
              </div>
            ) : !stats || stats.departments.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">
                No department stats available
              </p>
            ) : (
              <div className="space-y-4 pt-2">
                {stats.departments.map((dept, idx) => {
                  const percentage =
                    stats.totalEmployees > 0
                      ? Math.round((dept.count / stats.totalEmployees) * 100)
                      : 0;
                  const colors = [
                    'from-indigo-500 to-indigo-600',
                    'from-purple-500 to-purple-600',
                    'from-emerald-500 to-emerald-600',
                    'from-amber-500 to-amber-600',
                    'from-pink-500 to-pink-600',
                    'from-cyan-500 to-cyan-600',
                  ];
                  const colorClass = colors[idx % colors.length];

                  return (
                    <div key={dept.department} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-200">{dept.department}</span>
                        <span className="text-zinc-400 font-mono">
                          {dept.count} {dept.count === 1 ? 'employee' : 'employees'} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-800/80 p-0.5">
                        <div
                          className={`h-full rounded-full bg-linear-to-r ${colorClass} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RBAC Rules Quick Summary */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">RBAC Controls</h3>
                  <p className="text-xs text-zinc-400">Current Role Access</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 space-y-1">
                  <p className="font-semibold text-indigo-400">Super Admin Access</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Full system access. Create, edit, assign roles/managers, and soft-delete
                    employees.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 space-y-1">
                  <p className="font-semibold text-purple-400">HR Manager Access</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Create/Edit/View staff. Restricted from deleting employees or assigning Super
                    Admin role.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 space-y-1">
                  <p className="font-semibold text-emerald-400">Employee Access</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    View employee roster & view/edit own profile (phone & profile photo).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Sparkles className="h-3.5 w-3.5" /> Dynamic RBAC Enforced
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

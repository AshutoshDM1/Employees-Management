import { authClient } from '@/lib/auth-client';
import { Users, UserCheck, UserMinus, FolderGit2 } from 'lucide-react';

export default function DashboardOverview() {
  const { data: session } = authClient.useSession();

  // Temporary mocked stats for the dashboard as per REQUIRMENT.md
  const stats = [
    {
      title: 'Total Employees',
      value: '124',
      description: 'Active + Inactive staff',
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Active Employees',
      value: '118',
      description: 'Currently on duty',
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Inactive Employees',
      value: '6',
      description: 'On leave or exited',
      icon: UserMinus,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Departments',
      value: '8',
      description: 'Business units active',
      icon: FolderGit2,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm overflow-y-auto">
      {/* Header */}
      <header className="px-6 py-5 border-b border-zinc-800 bg-zinc-950/40">
        <h1 className="text-xl font-bold tracking-tight bg-linear-to-b from-white to-zinc-300 bg-clip-text text-transparent">
          Employee Management Dashboard
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Welcome back, {session?.user?.name || 'Administrator'}. Here is your organization
          overview.
        </p>
      </header>

      {/* Stats Cards Section */}
      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md flex items-center justify-between transition-all duration-300 hover:border-zinc-700/60"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-550 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                <p className="text-[10px] text-zinc-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for the upcoming features */}
        <div className="p-8 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 flex flex-col items-center justify-center text-center py-16 space-y-3">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-sm font-semibold text-zinc-200">EMS Console Ready</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Database schema is synced. Next phase will implement full CRUD controls, role
              assignment, and reporting structures.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

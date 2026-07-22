import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Employee, Role } from '../../types';
import { EmployeeModal } from '../../components/EmployeeModal';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  ArrowUpDown,
  Trash2,
  Edit,
  ShieldCheck,
  UserCheck,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  X,
} from 'lucide-react';

export default function EmployeesList() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployeesForManager, setAllEmployeesForManager] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'joiningDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState<{ message?: string; errors?: string[] } | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, [search, department, role, status, sortBy, sortOrder, page]);

  useEffect(() => {
    // Fetch all for dropdown manager options
    employeeApi.getEmployees({ limit: 100 }).then((res) => {
      setAllEmployeesForManager(res.data);
    });
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await employeeApi.getEmployees({
        search,
        department,
        role,
        status,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      setEmployees(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load employees list');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: any) => {
    if (selectedEmployee) {
      await employeeApi.updateEmployee(selectedEmployee.id, data);
    } else {
      await employeeApi.createEmployee(data);
    }
    fetchEmployees();
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete employee "${name}"? This soft-deletes the record.`,
      )
    ) {
      return;
    }
    try {
      await employeeApi.deleteEmployee(id);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  const handleExportCsv = () => {
    if (employees.length === 0) return;
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Phone',
      'Department',
      'Designation',
      'Salary',
      'Joining Date',
      'Status',
      'Role',
      'Manager Name',
    ];
    const rows = employees.map((e) => [
      e.employeeId,
      `"${e.name}"`,
      e.email,
      e.phone || '',
      `"${e.department}"`,
      `"${e.designation}"`,
      e.salary,
      e.joiningDate ? e.joiningDate.split('T')[0] : '',
      e.status,
      e.role,
      `"${e.managerName || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setCsvImporting(true);
    setCsvResult(null);

    try {
      const lines = csvText.trim().split('\n');
      const items: any[] = [];
      const hasHeader =
        lines[0]?.toLowerCase().includes('name') || lines[0]?.toLowerCase().includes('email');
      const startIndex = hasHeader ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i]?.split(',').map((p) => p.trim().replace(/^"|"$/g, '')) || [];
        if (parts.length >= 3) {
          items.push({
            name: parts[0] || parts[1],
            email: parts[1] || parts[2],
            department: parts[2] || parts[4] || 'Engineering',
            designation: parts[3] || parts[5] || 'Software Engineer',
            salary: parts[4] || '85000',
            phone: parts[5] || '',
            role: 'EMPLOYEE',
          });
        }
      }

      const res = await employeeApi.importCsv(items);
      setCsvResult(res);
      fetchEmployees();
    } catch (err: any) {
      setCsvResult({ errors: [err.response?.data?.error || 'CSV import failed'] });
    } finally {
      setCsvImporting(false);
    }
  };

  const getRoleBadge = (r: Role) => {
    if (r === 'SUPER_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
          <ShieldCheck className="h-3 w-3" /> Admin
        </span>
      );
    }
    if (r === 'HR_MANAGER') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold">
          <UserCheck className="h-3 w-3" /> HR Mgr
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
        <User className="h-3 w-3" /> Employee
      </span>
    );
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isHr = user?.role === 'HR_MANAGER';
  const canAddOrEdit = isSuperAdmin || isHr;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm overflow-y-auto font-sans">
      {/* Header */}
      <header className="px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-linear-to-b from-white to-zinc-300 bg-clip-text text-transparent">
            Employee Directory & Controls
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search, filter, manage records & role permissions ({totalCount} total records)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700/60 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          {canAddOrEdit && (
            <>
              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 space-y-4 max-w-7xl w-full mx-auto">
        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email or EMP-001..."
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-hidden"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-hidden cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="Executive Management">Executive Management</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-hidden cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>

            {/* Status & Sort */}
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl py-2 px-2 text-xs text-white outline-hidden cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={() => {
                  if (sortBy === 'name') {
                    setSortBy('joiningDate');
                  } else {
                    setSortBy('name');
                  }
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
                title="Toggle Sort (Name / Date)"
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-all cursor-pointer flex items-center justify-center"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-xs">Fetching records from server...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 text-xs">{error}</div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs space-y-1">
              <p className="font-semibold text-zinc-300">No employees match criteria</p>
              <p className="text-[11px]">Try adjusting your search query or department filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Department & Designation</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reporting Manager</th>
                    <th className="py-3.5 px-4">Salary</th>
                    <th className="py-3.5 px-4">Joining Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {employees.map((emp) => {
                    const isOwnProfile = user?.id === emp.id;
                    const canEditThisEmp =
                      isSuperAdmin || (isHr && emp.role !== 'SUPER_ADMIN') || isOwnProfile;
                    const canDeleteThisEmp = isSuperAdmin && !isOwnProfile;

                    return (
                      <tr key={emp.id} className="hover:bg-zinc-800/30 transition-colors">
                        {/* Employee Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                emp.image ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                              }
                              alt={emp.name}
                              className="h-9 w-9 rounded-full object-cover border border-zinc-700"
                            />
                            <div>
                              <p className="font-semibold text-white flex items-center gap-1.5">
                                <span>{emp.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  {emp.employeeId}
                                </span>
                              </p>
                              <p className="text-[11px] text-zinc-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Department & Designation */}
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-zinc-200">{emp.designation}</p>
                          <p className="text-[11px] text-zinc-500">{emp.department}</p>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">{getRoleBadge(emp.role)}</td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {emp.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                              ● Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                              ● Inactive
                            </span>
                          )}
                        </td>

                        {/* Manager */}
                        <td className="py-3.5 px-4 text-zinc-400">
                          {emp.managerName ? (
                            <span className="font-medium text-zinc-300">{emp.managerName}</span>
                          ) : (
                            <span className="text-zinc-600 italic">-- Root --</span>
                          )}
                        </td>

                        {/* Salary */}
                        <td className="py-3.5 px-4 font-mono text-zinc-300 font-medium">
                          ${Number(emp.salary).toLocaleString()}
                        </td>

                        {/* Joining Date */}
                        <td className="py-3.5 px-4 text-zinc-400">
                          {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right space-x-1">
                          {canEditThisEmp && (
                            <button
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setIsModalOpen(true);
                              }}
                              title="Edit Employee"
                              className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          {canDeleteThisEmp && (
                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              title="Soft Delete Employee"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        employee={selectedEmployee}
        managerOptions={allEmployeesForManager}
      />

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-purple-400" />
                <span>Bulk CSV Employee Import</span>
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCsvImport} className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste comma-separated rows in format: <br />
                <code className="text-purple-300 font-mono">
                  Name, Email, Department, Designation, Salary, Phone
                </code>
              </p>

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Name, Email, Department, Designation, Salary, Phone\nJane Smith, jane.smith@ems.com, Engineering, Frontend Lead, 120000, +1 (555) 012-9988\nTom Holland, tom.h@ems.com, Product, Product Manager, 115000, +1 (555) 018-2233`}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-xs font-mono text-white placeholder-zinc-600 outline-hidden"
              />

              {csvResult && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                  {csvResult.message && (
                    <p className="text-emerald-400 font-medium">✓ {csvResult.message}</p>
                  )}
                  {csvResult.errors && csvResult.errors.length > 0 && (
                    <div className="text-rose-400 space-y-0.5">
                      {csvResult.errors.map((err, i) => (
                        <p key={i}>⚠ {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={csvImporting || !csvText.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {csvImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  <span>Import Records</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

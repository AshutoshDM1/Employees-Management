import React, { useState, useEffect } from 'react';
import type { Employee, Role, Status } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, Loader2, Save, UserPlus, UserCheck } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  employee?: Employee | null;
  managerOptions: Employee[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  managerOptions,
}) => {
  const { user } = useAuth();
  const isEditing = Boolean(employee);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [managerId, setManagerId] = useState('');
  const [image, setImage] = useState('');
  const [password, setPassword] = useState('password123');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setDepartment(employee.department || 'Engineering');
      setDesignation(employee.designation || '');
      setSalary(employee.salary || '');
      setJoiningDate(employee.joiningDate ? employee.joiningDate.split('T')[0] : '');
      setStatus(employee.status || 'active');
      setRole(employee.role || 'EMPLOYEE');
      setManagerId(employee.managerId || '');
      setImage(employee.image || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setDepartment('Engineering');
      setDesignation('');
      setSalary('90000');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setStatus('active');
      setRole('EMPLOYEE');
      setManagerId('');
      setImage(
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      );
      setPassword('password123');
    }
    setError('');
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const isHr = user?.role === 'HR_MANAGER';
  const isEmployeeRole = user?.role === 'EMPLOYEE';
  const isEditingSelf = isEmployeeRole && user?.id === employee?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (
      !name.trim() ||
      !email.trim() ||
      !department.trim() ||
      !designation.trim() ||
      !salary ||
      !joiningDate
    ) {
      setError('Please fill in all required fields');
      return;
    }

    const salaryNum = Number(salary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      setError('Salary must be a positive number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (isHr && role === 'SUPER_ADMIN') {
      setError('HR Managers are not allowed to assign Super Admin role');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
        status,
        role,
        managerId: managerId || null,
        image,
        password,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save employee details');
    } finally {
      setSaving(false);
    }
  };

  const departmentsList = [
    'Executive Management',
    'Engineering',
    'Human Resources',
    'Product',
    'Design',
    'Sales',
    'Marketing',
    'Finance',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {isEditing ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isEditing ? `Edit Employee: ${employee?.name}` : 'Add New Employee'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isEditing
                  ? 'Update profile information and access permissions'
                  : 'Create a new employee record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {isEditingSelf && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              ℹ️ As an Employee, you are permitted to edit your contact phone and profile picture.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEditingSelf}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEditing || isEditingSelf}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isEditingSelf}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Designation *</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                disabled={isEditingSelf}
                placeholder="Senior Software Engineer"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                required
              />
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Annual Salary ($) *</label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                disabled={isEditingSelf}
                placeholder="100000"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                required
              />
            </div>

            {/* Joining Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Joining Date *</label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                disabled={isEditingSelf}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                disabled={isEditingSelf}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={isEditingSelf || (isHr && role === 'SUPER_ADMIN')}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_MANAGER">HR Manager</option>
                {!isHr && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
            </div>

            {/* Reporting Manager */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Reporting Manager</label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                disabled={isEditingSelf}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
              >
                <option value="">-- No Manager (Root) --</option>
                {managerOptions
                  .filter((m) => m.id !== employee?.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.designation})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Profile Image URL */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-zinc-300">Profile Image Avatar URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          {!isEditing && (
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-zinc-300">Account Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isEditing ? 'Update Employee' : 'Create Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

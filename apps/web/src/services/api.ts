import axios from 'axios';
import type { Employee, OrgTreeNode, DashboardStats, UserSession } from '../types';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: UserSession }>('/auth/login', {
      email,
      password,
    });
    if (res.data.token) {
      localStorage.setItem('ems_token', res.data.token);
      localStorage.setItem('ems_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
    }
  },

  getMe: async () => {
    const res = await api.get<{ user: UserSession }>('/auth/me');
    if (res.data.user) {
      localStorage.setItem('ems_user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  getStoredUser: (): UserSession | null => {
    const raw = localStorage.getItem('ems_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};

export const employeeApi = {
  getEmployees: async (params?: {
    search?: string;
    department?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<{
      data: Employee[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>('/employees', { params });
    return res.data;
  },

  getEmployeeById: async (id: string) => {
    const res = await api.get<Employee & { manager: any; reportees: any[] }>(`/employees/${id}`);
    return res.data;
  },

  createEmployee: async (data: Partial<Employee> & { password?: string }) => {
    const res = await api.post('/employees', data);
    return res.data;
  },

  updateEmployee: async (id: string, data: Partial<Employee>) => {
    const res = await api.put(`/employees/${id}`, data);
    return res.data;
  },

  deleteEmployee: async (id: string) => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },

  getOrgTree: async () => {
    const res = await api.get<{ tree: OrgTreeNode[] }>('/organization/tree');
    return res.data.tree;
  },

  getReportees: async (id: string) => {
    const res = await api.get<{ reportees: Employee[] }>(`/employees/${id}/reportees`);
    return res.data.reportees;
  },

  updateManager: async (id: string, managerId: string | null) => {
    const res = await api.patch(`/employees/${id}/manager`, { managerId });
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  importCsv: async (items: any[]) => {
    const res = await api.post<{ message: string; importedCount: number; errors: string[] }>(
      '/employees/csv-import',
      { items },
    );
    return res.data;
  },
};

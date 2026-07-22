export type Role = 'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';
export type Status = 'active' | 'inactive';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string | null;
  department: string;
  designation: string;
  salary: string;
  joiningDate: string;
  status: Status;
  role: Role;
  managerId?: string | null;
  managerName?: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgTreeNode {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: Role;
  status: Status;
  image?: string | null;
  managerId?: string | null;
  children: OrgTreeNode[];
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  departments: { department: string; count: number }[];
}

export interface UserSession {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string | null;
  department: string;
  designation: string;
  role: Role;
  status: Status;
  image?: string | null;
}

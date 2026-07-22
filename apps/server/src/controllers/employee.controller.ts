import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';
import { employees } from '../db/schema.js';
import { eq, and, ilike, or, asc, desc, count, inArray } from 'drizzle-orm';
import type { AuthRequest } from '../utils/auth-middleware.js';

// Helper function to detect hierarchy cycles
async function checkCircularReporting(
  employeeId: string,
  proposedManagerId: string,
): Promise<boolean> {
  if (employeeId === proposedManagerId) {
    return true; // Self manager is a cycle
  }

  let currentManagerId: string | null = proposedManagerId;
  const visited = new Set<string>();

  while (currentManagerId) {
    if (currentManagerId === employeeId) {
      return true; // Cycle found!
    }

    if (visited.has(currentManagerId)) {
      break;
    }
    visited.add(currentManagerId);

    const mgr = await db
      .select({ managerId: employees.managerId })
      .from(employees)
      .where(and(eq(employees.id, currentManagerId), eq(employees.isDeleted, false)));

    if (!mgr[0] || !mgr[0].managerId) {
      break;
    }

    currentManagerId = mgr[0].managerId;
  }

  return false;
}

export async function getEmployees(req: AuthRequest, res: Response) {
  try {
    const search = req.query.search as string | undefined;
    const department = req.query.department as string | undefined;
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;
    const sortBy = (req.query.sortBy as string) || 'name';
    const sortOrder = (req.query.sortOrder as string) || 'asc';
    const page = (req.query.page as string) || '1';
    const limit = (req.query.limit as string) || '10';

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(employees.isDeleted, false)];

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      const searchOr = or(
        ilike(employees.name, q),
        ilike(employees.email, q),
        ilike(employees.employeeId, q),
      );
      if (searchOr) conditions.push(searchOr);
    }

    if (department && department !== 'ALL') {
      conditions.push(eq(employees.department, department));
    }

    if (role && role !== 'ALL') {
      conditions.push(eq(employees.role, role as any));
    }

    if (status && status !== 'ALL') {
      conditions.push(eq(employees.status, status as any));
    }

    const combinedWhere = and(...conditions);

    const countResult = await db.select({ total: count() }).from(employees).where(combinedWhere);

    const totalCount = Number(countResult[0]?.total || 0);

    const isDesc = sortOrder.toLowerCase() === 'desc';
    const orderByClause =
      sortBy === 'joiningDate'
        ? isDesc
          ? desc(employees.joiningDate)
          : asc(employees.joiningDate)
        : isDesc
          ? desc(employees.name)
          : asc(employees.name);

    const records = await db
      .select()
      .from(employees)
      .where(combinedWhere)
      .orderBy(orderByClause)
      .limit(limitNum)
      .offset(offset);

    const managerIds = Array.from(
      new Set(records.map((r) => r.managerId).filter((id): id is string => Boolean(id))),
    );
    const managerMap: Record<string, { name: string; email: string }> = {};

    if (managerIds.length > 0) {
      const managers = await db
        .select({ id: employees.id, name: employees.name, email: employees.email })
        .from(employees)
        .where(inArray(employees.id, managerIds));

      managers.forEach((m) => {
        managerMap[m.id] = { name: m.name, email: m.email };
      });
    }

    const formattedRecords = records.map((r) => ({
      ...r,
      managerName: r.managerId ? managerMap[r.managerId]?.name || null : null,
    }));

    return res.json({
      data: formattedRecords,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('getEmployees error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
}

export async function getEmployeeById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const result = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.isDeleted, false)));

    const employee = result[0];

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let manager = null;
    if (employee.managerId) {
      const mgrResult = await db
        .select({
          id: employees.id,
          name: employees.name,
          email: employees.email,
          designation: employees.designation,
        })
        .from(employees)
        .where(eq(employees.id, employee.managerId));
      manager = mgrResult[0] || null;
    }

    const reportees = await db
      .select({
        id: employees.id,
        name: employees.name,
        email: employees.email,
        designation: employees.designation,
        role: employees.role,
      })
      .from(employees)
      .where(and(eq(employees.managerId, id), eq(employees.isDeleted, false)));

    return res.json({
      ...employee,
      manager,
      reportees,
    });
  } catch (error) {
    console.error('getEmployeeById error:', error);
    return res.status(500).json({ error: 'Failed to fetch employee details' });
  }
}

export async function createEmployee(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    if (currentUser.role === 'EMPLOYEE') {
      return res
        .status(403)
        .json({ error: 'Forbidden: Regular employees cannot create employees' });
    }

    const {
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status = 'active',
      role = 'EMPLOYEE',
      managerId,
      image,
      password,
    } = req.body;

    if (!name || !email || !department || !designation || salary === undefined || !joiningDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isNaN(Number(salary)) || Number(salary) < 0) {
      return res.status(400).json({ error: 'Salary must be a positive number' });
    }

    if (currentUser.role === 'HR_MANAGER' && role === 'SUPER_ADMIN') {
      return res
        .status(403)
        .json({ error: 'Forbidden: HR Managers cannot create Super Admin accounts' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    const existingEmail = await db
      .select()
      .from(employees)
      .where(and(eq(employees.email, email.toLowerCase().trim()), eq(employees.isDeleted, false)));

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'An employee with this email already exists' });
    }

    const countResult = await db.select({ total: count() }).from(employees);
    const nextSeq = (Number(countResult[0]?.total || 0) + 1).toString().padStart(3, '0');
    const generatedEmployeeId = `EMP-${nextSeq}`;

    const id = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await bcrypt.hash(password || 'password123', 10);

    const newEmp = {
      id,
      employeeId: generatedEmployeeId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || null,
      department: department.trim(),
      designation: designation.trim(),
      salary: String(salary),
      joiningDate: new Date(joiningDate),
      status: status as 'active' | 'inactive',
      role: role as 'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE',
      managerId: managerId || null,
      image:
        image ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    };

    await db.insert(employees).values(newEmp);

    return res.status(201).json({
      message: 'Employee created successfully',
      employee: newEmp,
    });
  } catch (error) {
    console.error('createEmployee error:', error);
    return res.status(500).json({ error: 'Failed to create employee' });
  }
}

export async function updateEmployee(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const currentUser = req.user!;

    const existing = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.isDeleted, false)));

    const targetEmp = existing[0];
    if (!targetEmp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const {
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status,
      role,
      managerId,
      image,
    } = req.body;

    if (currentUser.role === 'EMPLOYEE') {
      if (currentUser.id !== id) {
        return res
          .status(403)
          .json({ error: 'Forbidden: Regular employees can only update their own profile' });
      }
      const updateData: any = { updatedAt: new Date() };
      if (phone !== undefined) updateData.phone = phone;
      if (image !== undefined) updateData.image = image;

      await db.update(employees).set(updateData).where(eq(employees.id, id));
      return res.json({ message: 'Profile updated successfully' });
    }

    if (currentUser.role === 'HR_MANAGER') {
      if (targetEmp.role === 'SUPER_ADMIN') {
        return res
          .status(403)
          .json({ error: 'Forbidden: HR Managers cannot modify Super Admin profiles' });
      }
      if (role === 'SUPER_ADMIN') {
        return res
          .status(403)
          .json({ error: 'Forbidden: HR Managers cannot assign Super Admin role' });
      }
    }

    if (managerId && managerId !== targetEmp.managerId) {
      const isCycle = await checkCircularReporting(id, managerId);
      if (isCycle) {
        return res
          .status(400)
          .json({
            error:
              'Invalid operation: Assigning this manager creates a circular reporting hierarchy',
          });
      }
    }

    const updateFields: any = { updatedAt: new Date() };

    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.toLowerCase().trim();
    if (phone !== undefined) updateFields.phone = phone;
    if (department) updateFields.department = department.trim();
    if (designation) updateFields.designation = designation.trim();
    if (salary !== undefined) updateFields.salary = String(salary);
    if (joiningDate) updateFields.joiningDate = new Date(joiningDate);
    if (status) updateFields.status = status;
    if (role) updateFields.role = role;
    if (managerId !== undefined) updateFields.managerId = managerId || null;
    if (image !== undefined) updateFields.image = image;

    await db.update(employees).set(updateFields).where(eq(employees.id, id));

    return res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('updateEmployee error:', error);
    return res.status(500).json({ error: 'Failed to update employee' });
  }
}

export async function deleteEmployee(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const currentUser = req.user!;

    if (currentUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only Super Admins can delete employees' });
    }

    const targetEmp = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.isDeleted, false)));

    if (!targetEmp[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await db
      .update(employees)
      .set({ isDeleted: true, deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(employees.id, id));

    await db.update(employees).set({ managerId: null }).where(eq(employees.managerId, id));

    return res.json({ message: 'Employee deleted (soft-delete) successfully' });
  } catch (error) {
    console.error('deleteEmployee error:', error);
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
}

export async function getOrgTree(req: AuthRequest, res: Response) {
  try {
    const allEmps = await db
      .select({
        id: employees.id,
        employeeId: employees.employeeId,
        name: employees.name,
        email: employees.email,
        department: employees.department,
        designation: employees.designation,
        role: employees.role,
        status: employees.status,
        image: employees.image,
        managerId: employees.managerId,
      })
      .from(employees)
      .where(eq(employees.isDeleted, false));

    const empMap = new Map<string, any>();
    allEmps.forEach((e) => {
      empMap.set(e.id, { ...e, children: [] });
    });

    const rootNodes: any[] = [];

    allEmps.forEach((e) => {
      const node = empMap.get(e.id);
      if (e.managerId && empMap.has(e.managerId)) {
        empMap.get(e.managerId).children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return res.json({ tree: rootNodes });
  } catch (error) {
    console.error('getOrgTree error:', error);
    return res.status(500).json({ error: 'Failed to build organizational hierarchy' });
  }
}

export async function getReportees(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const reportees = await db
      .select({
        id: employees.id,
        employeeId: employees.employeeId,
        name: employees.name,
        email: employees.email,
        department: employees.department,
        designation: employees.designation,
        status: employees.status,
        role: employees.role,
        image: employees.image,
      })
      .from(employees)
      .where(and(eq(employees.managerId, id), eq(employees.isDeleted, false)));

    return res.json({ reportees });
  } catch (error) {
    console.error('getReportees error:', error);
    return res.status(500).json({ error: 'Failed to fetch reportees' });
  }
}

export async function updateManager(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { managerId } = req.body;
    const currentUser = req.user!;

    if (currentUser.role === 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden: Regular employees cannot assign managers' });
    }

    const targetEmp = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.isDeleted, false)));

    if (!targetEmp[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (managerId) {
      const managerExists = await db
        .select()
        .from(employees)
        .where(and(eq(employees.id, managerId), eq(employees.isDeleted, false)));

      if (!managerExists[0]) {
        return res.status(400).json({ error: 'Selected manager does not exist' });
      }

      const isCycle = await checkCircularReporting(id, managerId);
      if (isCycle) {
        return res
          .status(400)
          .json({
            error:
              'Circular reporting detected! An employee cannot report to their own sub-ordinate.',
          });
      }
    }

    await db
      .update(employees)
      .set({ managerId: managerId || null, updatedAt: new Date() })
      .where(eq(employees.id, id));

    return res.json({ message: 'Reporting manager updated successfully' });
  } catch (error) {
    console.error('updateManager error:', error);
    return res.status(500).json({ error: 'Failed to update manager' });
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const allEmps = await db
      .select({
        id: employees.id,
        status: employees.status,
        department: employees.department,
        role: employees.role,
      })
      .from(employees)
      .where(eq(employees.isDeleted, false));

    const total = allEmps.length;
    const active = allEmps.filter((e) => e.status === 'active').length;
    const inactive = total - active;

    const deptCounts: Record<string, number> = {};
    allEmps.forEach((e) => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });

    const departmentList = Object.entries(deptCounts).map(([department, count]) => ({
      department,
      count,
    }));

    return res.json({
      totalEmployees: total,
      activeEmployees: active,
      inactiveEmployees: inactive,
      departmentCount: Object.keys(deptCounts).length,
      departments: departmentList,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

export async function importCsv(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    if (currentUser.role === 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden: Regular employees cannot import CSV' });
    }

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty CSV items array' });
    }

    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    let importedCount = 0;
    const errors: string[] = [];

    const existingCountResult = await db.select({ total: count() }).from(employees);
    let currentTotal = Number(existingCountResult[0]?.total || 0);

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (!row.name || !row.email || !row.department || !row.designation) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      const existing = await db
        .select()
        .from(employees)
        .where(
          and(eq(employees.email, row.email.toLowerCase().trim()), eq(employees.isDeleted, false)),
        );

      if (existing.length > 0) {
        errors.push(`Row ${i + 1}: Email ${row.email} already exists`);
        continue;
      }

      currentTotal++;
      const generatedEmployeeId = `EMP-${currentTotal.toString().padStart(3, '0')}`;
      const id = `emp_csv_${Date.now()}_${i}`;

      await db.insert(employees).values({
        id,
        employeeId: generatedEmployeeId,
        name: String(row.name).trim(),
        email: String(row.email).toLowerCase().trim(),
        phone: row.phone || null,
        department: String(row.department).trim(),
        designation: String(row.designation).trim(),
        salary: String(row.salary || '80000'),
        joiningDate: row.joiningDate ? new Date(row.joiningDate) : new Date(),
        status: row.status === 'inactive' ? 'inactive' : 'active',
        role:
          row.role === 'SUPER_ADMIN'
            ? 'SUPER_ADMIN'
            : row.role === 'HR_MANAGER'
              ? 'HR_MANAGER'
              : 'EMPLOYEE',
        image:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        passwordHash: defaultPasswordHash,
        isDeleted: false,
      });

      importedCount++;
    }

    return res.json({
      message: `Imported ${importedCount} employees successfully`,
      importedCount,
      errors,
    });
  } catch (error) {
    console.error('importCsv error:', error);
    return res.status(500).json({ error: 'CSV Import failed' });
  }
}

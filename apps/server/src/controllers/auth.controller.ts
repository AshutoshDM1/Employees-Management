import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';
import { employees } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { generateToken } from '../utils/auth-middleware.js';
import type { AuthRequest } from '../utils/auth-middleware.js';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db
      .select()
      .from(employees)
      .where(and(eq(employees.email, email.toLowerCase().trim()), eq(employees.isDeleted, false)));

    const employee = result[0];

    if (!employee) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (employee.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive. Please contact HR.' });
    }

    let isValid = false;
    if (employee.passwordHash) {
      isValid = await bcrypt.compare(password, employee.passwordHash);
    } else {
      // Default fallback for initial seed
      isValid = password === 'password123';
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      employeeId: employee.employeeId,
    };

    const token = generateToken(payload);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
        status: employee.status,
        image: employee.image,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response) {
  return res.json({ message: 'Logout successful' });
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, req.user.id), eq(employees.isDeleted, false)));

    const employee = result[0];

    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    return res.json({
      user: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        salary: employee.salary,
        joiningDate: employee.joiningDate,
        status: employee.status,
        role: employee.role,
        managerId: employee.managerId,
        image: employee.image,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

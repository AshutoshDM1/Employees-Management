import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';
import { employees } from './schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting Employee Management Database Seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const sampleEmployees = [
    {
      id: 'emp_super_admin',
      employeeId: 'EMP-001',
      name: 'Alex Vance',
      email: 'admin@ems.com',
      phone: '+1 (555) 019-2834',
      department: 'Executive Management',
      designation: 'Chief Executive Officer & Super Admin',
      salary: '250000',
      joiningDate: new Date('2021-01-15'),
      status: 'active' as const,
      role: 'SUPER_ADMIN' as const,
      managerId: null,
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_hr_manager',
      employeeId: 'EMP-002',
      name: 'Sarah Connor',
      email: 'hr@ems.com',
      phone: '+1 (555) 018-9921',
      department: 'Human Resources',
      designation: 'HR Director',
      salary: '140000',
      joiningDate: new Date('2022-03-01'),
      status: 'active' as const,
      role: 'HR_MANAGER' as const,
      managerId: 'emp_super_admin',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_eng_lead',
      employeeId: 'EMP-003',
      name: 'Marcus Brody',
      email: 'marcus.brody@ems.com',
      phone: '+1 (555) 017-4432',
      department: 'Engineering',
      designation: 'VP of Engineering',
      salary: '180000',
      joiningDate: new Date('2021-06-10'),
      status: 'active' as const,
      role: 'SUPER_ADMIN' as const,
      managerId: 'emp_super_admin',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_sr_dev_1',
      employeeId: 'EMP-004',
      name: 'Elena Rostova',
      email: 'elena.rostova@ems.com',
      phone: '+1 (555) 016-8871',
      department: 'Engineering',
      designation: 'Staff Software Engineer',
      salary: '135000',
      joiningDate: new Date('2022-08-15'),
      status: 'active' as const,
      role: 'EMPLOYEE' as const,
      managerId: 'emp_eng_lead',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_employee_user',
      employeeId: 'EMP-005',
      name: 'John Doe',
      email: 'employee@ems.com',
      phone: '+1 (555) 012-3456',
      department: 'Engineering',
      designation: 'Full Stack Engineer',
      salary: '95000',
      joiningDate: new Date('2023-02-01'),
      status: 'active' as const,
      role: 'EMPLOYEE' as const,
      managerId: 'emp_sr_dev_1',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_product_mgr',
      employeeId: 'EMP-006',
      name: 'Sophia Patel',
      email: 'sophia.patel@ems.com',
      phone: '+1 (555) 015-1122',
      department: 'Product',
      designation: 'Lead Product Manager',
      salary: '130000',
      joiningDate: new Date('2022-11-12'),
      status: 'active' as const,
      role: 'HR_MANAGER' as const,
      managerId: 'emp_super_admin',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_designer',
      employeeId: 'EMP-007',
      name: 'Liam Chen',
      email: 'liam.chen@ems.com',
      phone: '+1 (555) 014-9988',
      department: 'Design',
      designation: 'Senior Product Designer',
      salary: '110000',
      joiningDate: new Date('2023-05-20'),
      status: 'active' as const,
      role: 'EMPLOYEE' as const,
      managerId: 'emp_product_mgr',
      image:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_hr_specialist',
      employeeId: 'EMP-008',
      name: 'Rachel Green',
      email: 'rachel.green@ems.com',
      phone: '+1 (555) 013-6655',
      department: 'Human Resources',
      designation: 'Talent Acquisition Specialist',
      salary: '85000',
      joiningDate: new Date('2023-09-01'),
      status: 'active' as const,
      role: 'EMPLOYEE' as const,
      managerId: 'emp_hr_manager',
      image:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
    {
      id: 'emp_inactive_1',
      employeeId: 'EMP-009',
      name: 'David Miller',
      email: 'david.miller@ems.com',
      phone: '+1 (555) 011-7744',
      department: 'Sales',
      designation: 'Sales Executive',
      salary: '75000',
      joiningDate: new Date('2022-04-18'),
      status: 'inactive' as const,
      role: 'EMPLOYEE' as const,
      managerId: 'emp_hr_manager',
      image:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      isDeleted: false,
    },
  ];

  for (const emp of sampleEmployees) {
    const existing = await db.select().from(employees).where(eq(employees.email, emp.email));

    if (existing.length === 0) {
      await db.insert(employees).values(emp);
      console.log(`✅ Seeded employee: ${emp.name} (${emp.email}) - ${emp.role}`);
    } else {
      console.log(`ℹ️ Employee already exists: ${emp.email}`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

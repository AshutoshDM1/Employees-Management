import { pgTable, text, timestamp, boolean, numeric, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

export const message = pgTable(
  'message',
  {
    id: text('id').primaryKey(),
    senderId: text('sender_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    receiverId: text('receiver_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    status: text('status').$type<'sent' | 'delivered' | 'read'>().default('sent').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('message_senderId_idx').on(table.senderId),
    index('message_receiverId_idx').on(table.receiverId),
  ],
);

export const employees = pgTable(
  'employees',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    employeeId: text('employee_id').notNull().unique(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    phone: text('phone'),
    department: text('department').notNull(),
    designation: text('designation').notNull(),
    salary: numeric('salary').notNull(),
    joiningDate: timestamp('joining_date').notNull(),
    status: text('status').$type<'active' | 'inactive'>().default('active').notNull(),
    role: text('role')
      .$type<'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE'>()
      .default('EMPLOYEE')
      .notNull(),
    managerId: text('manager_id'),
    image: text('image'),
    passwordHash: text('password_hash'),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('employees_department_idx').on(table.department),
    index('employees_role_idx').on(table.role),
    index('employees_status_idx').on(table.status),
    index('employees_manager_idx').on(table.managerId),
    index('employees_user_idx').on(table.userId),
  ],
);

import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getOrgTree,
  getReportees,
  updateManager,
  getDashboardStats,
  importCsv,
} from '../controllers/employee.controller.js';
import { authMiddleware, requireRole } from '../utils/auth-middleware.js';

const router = Router();

// Apply auth middleware to all employee routes
router.use(authMiddleware);

// Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

// Organization Hierarchy & Reportees
router.get('/organization/tree', getOrgTree);
router.get('/employees/:id/reportees', getReportees);
router.patch('/employees/:id/manager', updateManager);

// Employee CRUD & CSV
router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.post('/employees/csv-import', importCsv);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

export default router;

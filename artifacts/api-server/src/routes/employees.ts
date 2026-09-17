import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { z } from "zod";

import { users } from "../data/users.js";
import {
  attendanceRecords,
  employees,
  paymentRecords,
  salaryRecords,
  type AttendanceRecord,
  type Employee,
  type PaymentRecord,
  type SalaryRecord,
} from "../data/employees.js";

const router = Router();

const roles = [
  "Owner",
  "Manager",
  "Baker",
  "Cashier",
  "Delivery",
  "Staff",
] as const;

const attendanceStatuses = [
  "present",
  "absent",
  "late",
  "leave",
] as const;

function getUserId(req: Request): string | null {
  const userId = req.session?.userId;

  return typeof userId === "string"
    ? userId
    : null;
}

function getParam(
  req: Request,
  name: string,
): string | null {
  const value = req.params[name];

  return typeof value === "string"
    ? value
    : null;
}

function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      error: "Not authenticated",
    });
    return;
  }

  const user = users.get(userId);

  if (!user || user.role !== "admin") {
    res.status(403).json({
      error: "Forbidden",
    });
    return;
  }

  next();
}

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Use YYYY-MM-DD",
  );

const monthSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}$/,
    "Use YYYY-MM",
  );

const EmployeeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).default(""),
  role: z.enum(roles),
  department: z.string().trim().max(80).default(""),
  joinDate: dateSchema,
  salary: z.coerce
    .number()
    .min(0)
    .max(1_000_000),
  status: z
    .enum(["active", "inactive"])
    .default("active"),
});

const AttendanceSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1),
  date: dateSchema,
  status: z.enum(attendanceStatuses),
  note: z.string().max(500).default(""),
});

const PaymentSchema = z.object({
  employeeId: z.string().min(1),
  salaryId: z.string().min(1),
  method: z.string().trim().min(1).max(40),
  paidAt: z.string().datetime().optional(),
  note: z.string().max(500).default(""),
});

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

// --------------------------------------------------
// Employees
// --------------------------------------------------

router.get(
  "/admin/employees",
  requireAdmin,
  (_req, res) => {
    res.json({
      employees: employees
        .slice()
        .reverse(),
    });
  },
);

router.post(
  "/admin/employees",
  requireAdmin,
  (req, res) => {
    const parsed =
      EmployeeSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid employee data",
        details: parsed.error.issues,
      });
      return;
    }

    const email =
      parsed.data.email.toLowerCase();

    if (
      employees.some(
        (employee) =>
          employee.email.toLowerCase() ===
          email,
      )
    ) {
      res.status(409).json({
        error:
          "An employee with this email already exists.",
      });
      return;
    }

    const employee: Employee = {
      id: `employee-${Date.now()}`,
      ...parsed.data,
      email,
      createdAt:
        new Date().toISOString(),
    };

    employees.push(employee);

    res.status(201).json({
      employee,
    });
  },
);

router.patch(
  "/admin/employees/:id",
  requireAdmin,
  (req, res) => {
    const employeeId = getParam(
      req,
      "id",
    );

    if (!employeeId) {
      res.status(400).json({
        error: "Invalid employee ID.",
      });
      return;
    }

    const employee = employees.find(
      (item) => item.id === employeeId,
    );

    if (!employee) {
      res.status(404).json({
        error: "Employee not found.",
      });
      return;
    }

    const parsed =
      EmployeeSchema.partial().safeParse(
        req.body,
      );

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid employee data",
        details: parsed.error.issues,
      });
      return;
    }

    const email = parsed.data.email
      ? parsed.data.email.toLowerCase()
      : undefined;

    if (
      email &&
      employees.some(
        (item) =>
          item.id !== employee.id &&
          item.email.toLowerCase() === email,
      )
    ) {
      res.status(409).json({
        error:
          "An employee with this email already exists.",
      });
      return;
    }

    Object.assign(employee, parsed.data);

    if (email) {
      employee.email = email;
    }

    res.json({
      employee,
    });
  },
);

// --------------------------------------------------
// Attendance
// --------------------------------------------------

router.get(
  "/admin/attendance",
  requireAdmin,
  (req, res) => {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    if (
      date &&
      !dateSchema.safeParse(date).success
    ) {
      res.status(400).json({
        error:
          "Invalid date. Use YYYY-MM-DD.",
      });
      return;
    }

    const records = date
      ? attendanceRecords.filter(
          (record) =>
            record.date === date,
        )
      : attendanceRecords;

    res.json({
      attendance: records
        .slice()
        .reverse(),
    });
  },
);

router.post(
  "/admin/attendance",
  requireAdmin,
  (req, res) => {
    const parsed =
      AttendanceSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid attendance data",
        details: parsed.error.issues,
      });
      return;
    }

    const employeeExists =
      employees.some(
        (employee) =>
          employee.id ===
          parsed.data.employeeId,
      );

    if (!employeeExists) {
      res.status(404).json({
        error: "Employee not found.",
      });
      return;
    }

    const existing =
      attendanceRecords.find(
        (record) =>
          record.employeeId ===
            parsed.data.employeeId &&
          record.date ===
            parsed.data.date,
      );

    const record: AttendanceRecord =
      existing ?? {
        id: `attendance-${Date.now()}`,
        employeeId:
          parsed.data.employeeId,
        date: parsed.data.date,
        status: parsed.data.status,
        note: parsed.data.note,
        createdAt:
          new Date().toISOString(),
      };

    record.status =
      parsed.data.status;
    record.note =
      parsed.data.note;

    if (!existing) {
      attendanceRecords.push(record);
    }

    res
      .status(
        existing ? 200 : 201,
      )
      .json({
        attendance: record,
      });
  },
);

// --------------------------------------------------
// Salaries
// --------------------------------------------------

router.get(
  "/admin/salaries",
  requireAdmin,
  (req, res) => {
    const month =
      typeof req.query.month === "string"
        ? req.query.month
        : currentMonth();

    if (
      !monthSchema.safeParse(month)
        .success
    ) {
      res.status(400).json({
        error:
          "Invalid month. Use YYYY-MM.",
      });
      return;
    }

    res.json({
      salaries: salaryRecords
        .filter(
          (salary) =>
            salary.month === month,
        )
        .slice()
        .reverse(),
    });
  },
);

router.post(
  "/admin/salaries",
  requireAdmin,
  (req, res) => {
    const parsed =
      monthSchema.safeParse(
        req.body?.month,
      );

    if (!parsed.success) {
      res.status(400).json({
        error:
          "Invalid month. Use YYYY-MM.",
      });
      return;
    }

    const month = parsed.data;
    const generated: SalaryRecord[] =
      [];

    employees
      .filter(
        (employee) =>
          employee.status ===
          "active",
      )
      .forEach((employee) => {
        const existing =
          salaryRecords.find(
            (salary) =>
              salary.employeeId ===
                employee.id &&
              salary.month === month,
          );

        if (existing) {
          generated.push(existing);
          return;
        }

        const salary: SalaryRecord = {
          id: `salary-${Date.now()}-${employee.id}`,
          employeeId: employee.id,
          month,
          baseSalary: roundMoney(
            employee.salary,
          ),
          deductions: 0,
          bonus: 0,
          netSalary: roundMoney(
            employee.salary,
          ),
          status: "pending",
          paidAt: null,
          createdAt:
            new Date().toISOString(),
        };

        salaryRecords.push(salary);
        generated.push(salary);
      });

    res.status(201).json({
      salaries: generated,
    });
  },
);

// --------------------------------------------------
// Payments
// --------------------------------------------------

router.get(
  "/admin/payments",
  requireAdmin,
  (req, res) => {
    const month =
      typeof req.query.month === "string"
        ? req.query.month
        : currentMonth();

    if (
      !monthSchema.safeParse(month)
        .success
    ) {
      res.status(400).json({
        error:
          "Invalid month. Use YYYY-MM.",
      });
      return;
    }

    const salaryIds = new Set(
      salaryRecords
        .filter(
          (salary) =>
            salary.month === month,
        )
        .map(
          (salary) => salary.id,
        ),
    );

    res.json({
      payments: paymentRecords
        .filter((payment) =>
          salaryIds.has(
            payment.salaryId,
          ),
        )
        .slice()
        .reverse(),
    });
  },
);

router.post(
  "/admin/payments",
  requireAdmin,
  (req, res) => {
    const parsed =
      PaymentSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid payment data",
        details: parsed.error.issues,
      });
      return;
    }

    const salary =
      salaryRecords.find(
        (record) =>
          record.id ===
            parsed.data.salaryId &&
          record.employeeId ===
            parsed.data.employeeId,
      );

    if (!salary) {
      res.status(404).json({
        error:
          "Salary record not found.",
      });
      return;
    }

    if (
      salary.status === "paid" ||
      paymentRecords.some(
        (payment) =>
          payment.salaryId === salary.id,
      )
    ) {
      res.status(409).json({
        error:
          "This salary has already been paid.",
      });
      return;
    }

    const payment: PaymentRecord = {
      id: `payment-${Date.now()}`,
      employeeId:
        salary.employeeId,
      salaryId: salary.id,
      amount: roundMoney(
        salary.netSalary,
      ),
      method:
        parsed.data.method,
      paidAt:
        parsed.data.paidAt ??
        new Date().toISOString(),
      note: parsed.data.note,
    };

    paymentRecords.push(payment);

    salary.status = "paid";
    salary.paidAt = payment.paidAt;

    res.status(201).json({
      payment,
      salary,
    });
  },
);

export default router;
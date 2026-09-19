
import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { db } from "@workspace/db";
import {
  users as usersTable,
  employees as employeesTable,
  attendanceRecords as attendanceTable,
  salaryRecords as salaryTable,
  paymentRecords as paymentTable,
} from "@workspace/db";

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

async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      error: "Not authenticated",
    });
    return;
  }

  try {
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const user = existingUsers[0];

    if (!user || user.role !== "admin") {
      res.status(403).json({
        error: "Forbidden",
      });
      return;
    }

    next();
  } catch (error) {
    console.error(
      "Admin authentication failed:",
      error,
    );

    res.status(500).json({
      error: "Authentication check failed",
    });
  }
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
  async (_req: Request, res: Response) => {
    try {
      const allEmployees = await db
        .select()
        .from(employeesTable);

      res.json({
        employees: allEmployees.reverse(),
      });
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error,
      );

      res.status(500).json({
        error: "Failed to load employees",
      });
    }
  },
);

router.post(
  "/admin/employees",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
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

      const existingEmployees = await db
        .select()
        .from(employeesTable)
        .where(
          eq(
            employeesTable.email,
            email,
          ),
        );

      if (existingEmployees.length > 0) {
        res.status(409).json({
          error:
            "An employee with this email already exists.",
        });
        return;
      }

      const employeeId =
        `employee-${Date.now()}`;

      const inserted =
        await db
          .insert(employeesTable)
          .values({
            id: employeeId,
            name: parsed.data.name,
            email,
            phone: parsed.data.phone,
            role: parsed.data.role,
            department:
              parsed.data.department,
            joinDate:
              parsed.data.joinDate,
            salary:
              String(
                roundMoney(
                  parsed.data.salary,
                ),
              ),
            status:
              parsed.data.status,
            createdAt:
              new Date(),
          })
          .returning();

      const employee = inserted[0];

      if (!employee) {
        res.status(500).json({
          error: "Failed to create employee",
        });
        return;
      }

      res.status(201).json({
        employee,
      });
    } catch (error) {
      console.error(
        "Failed to create employee:",
        error,
      );

      res.status(500).json({
        error: "Failed to create employee",
      });
    }
  },
);

router.patch(
  "/admin/employees/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
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

      const email =
        parsed.data.email
          ?.toLowerCase();

      if (email) {
        const duplicate =
          await db
            .select()
            .from(employeesTable)
            .where(
              eq(
                employeesTable.email,
                email,
              ),
            );

        if (
          duplicate.some(
            (item) =>
              item.id !== employeeId,
          )
        ) {
          res.status(409).json({
            error:
              "An employee with this email already exists.",
          });
          return;
        }
      }

      const values: Partial<
        typeof employeesTable.$inferInsert
      > = {};

      if (parsed.data.name !== undefined) {
        values.name =
          parsed.data.name;
      }

      if (email !== undefined) {
        values.email = email;
      }

      if (parsed.data.phone !== undefined) {
        values.phone =
          parsed.data.phone;
      }

      if (parsed.data.role !== undefined) {
        values.role =
          parsed.data.role;
      }

      if (
        parsed.data.department !==
        undefined
      ) {
        values.department =
          parsed.data.department;
      }

      if (
        parsed.data.joinDate !==
        undefined
      ) {
        values.joinDate =
          parsed.data.joinDate;
      }

      if (
        parsed.data.salary !==
        undefined
      ) {
        values.salary =
          String(
            roundMoney(
              parsed.data.salary,
            ),
          );
      }

      if (
        parsed.data.status !==
        undefined
      ) {
        values.status =
          parsed.data.status;
      }

      const updated =
        await db
          .update(employeesTable)
          .set(values)
          .where(
            eq(
              employeesTable.id,
              employeeId,
            ),
          )
          .returning();

      const employee = updated[0];

      if (!employee) {
        res.status(404).json({
          error: "Employee not found.",
        });
        return;
      }

      res.json({
        employee,
      });
    } catch (error) {
      console.error(
        "Failed to update employee:",
        error,
      );

      res.status(500).json({
        error: "Failed to update employee",
      });
    }
  },
);

// --------------------------------------------------
// Attendance
// --------------------------------------------------

router.get(
  "/admin/attendance",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const date =
        typeof req.query.date ===
        "string"
          ? req.query.date
          : undefined;

      if (
        date &&
        !dateSchema.safeParse(date)
          .success
      ) {
        res.status(400).json({
          error:
            "Invalid date. Use YYYY-MM-DD.",
        });
        return;
      }

      const records = date
        ? await db
            .select()
            .from(attendanceTable)
            .where(
              eq(
                attendanceTable.date,
                date,
              ),
            )
        : await db
            .select()
            .from(attendanceTable);

      res.json({
        attendance:
          records.reverse(),
      });
    } catch (error) {
      console.error(
        "Failed to load attendance:",
        error,
      );

      res.status(500).json({
        error: "Failed to load attendance",
      });
    }
  },
);

router.post(
  "/admin/attendance",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
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

      const employee =
        await db
          .select()
          .from(employeesTable)
          .where(
            eq(
              employeesTable.id,
              parsed.data.employeeId,
            ),
          );

      if (employee.length === 0) {
        res.status(404).json({
          error: "Employee not found.",
        });
        return;
      }

      const existing =
        await db
          .select()
          .from(attendanceTable)
          .where(
            and(
              eq(
                attendanceTable.employeeId,
                parsed.data.employeeId,
              ),
              eq(
                attendanceTable.date,
                parsed.data.date,
              ),
            ),
          );

      if (existing[0]) {
        const updated =
          await db
            .update(attendanceTable)
            .set({
              status:
                parsed.data.status,
              note:
                parsed.data.note,
            })
            .where(
              eq(
                attendanceTable.id,
                existing[0].id,
              ),
            )
            .returning();

        res.json({
          attendance:
            updated[0],
        });
        return;
      }

      const inserted =
        await db
          .insert(attendanceTable)
          .values({
            id:
              parsed.data.id ??
              `attendance-${Date.now()}`,
            employeeId:
              parsed.data.employeeId,
            date:
              parsed.data.date,
            status:
              parsed.data.status,
            note:
              parsed.data.note,
            createdAt:
              new Date(),
          })
          .returning();

      res.status(201).json({
        attendance:
          inserted[0],
      });
    } catch (error) {
      console.error(
        "Failed to save attendance:",
        error,
      );

      res.status(500).json({
        error: "Failed to save attendance",
      });
    }
  },
);

// --------------------------------------------------
// Salaries
// --------------------------------------------------

router.get(
  "/admin/salaries",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const month =
        typeof req.query.month ===
        "string"
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

      const salaries =
        await db
          .select()
          .from(salaryTable)
          .where(
            eq(
              salaryTable.month,
              month,
            ),
          );

      res.json({
        salaries:
          salaries.reverse(),
      });
    } catch (error) {
      console.error(
        "Failed to load salaries:",
        error,
      );

      res.status(500).json({
        error: "Failed to load salaries",
      });
    }
  },
);

router.post(
  "/admin/salaries",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
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

      const activeEmployees =
        await db
          .select()
          .from(employeesTable)
          .where(
            eq(
              employeesTable.status,
              "active",
            ),
          );

      const existingSalaries =
        await db
          .select()
          .from(salaryTable)
          .where(
            eq(
              salaryTable.month,
              month,
            ),
          );

      const generated =
        [];

      for (
        const employee of activeEmployees
      ) {
        const existing =
          existingSalaries.find(
            (salary) =>
              salary.employeeId ===
              employee.id,
          );

        if (existing) {
          generated.push(existing);
          continue;
        }

        const baseSalary =
          roundMoney(
            Number(employee.salary),
          );

        const salary =
          await db
            .insert(salaryTable)
            .values({
              id:
                `salary-${Date.now()}-${employee.id}`,
              employeeId:
                employee.id,
              month,
              baseSalary:
                String(baseSalary),
              deductions: "0",
              bonus: "0",
              netSalary:
                String(baseSalary),
              status: "pending",
              paidAt: null,
              createdAt:
                new Date(),
            })
            .returning();

        if (salary[0]) {
          generated.push(
            salary[0],
          );
        }
      }

      res.status(201).json({
        salaries: generated,
      });
    } catch (error) {
      console.error(
        "Failed to generate salaries:",
        error,
      );

      res.status(500).json({
        error: "Failed to generate salaries",
      });
    }
  },
);

// --------------------------------------------------
// Payments
// --------------------------------------------------

router.get(
  "/admin/payments",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const month =
        typeof req.query.month ===
        "string"
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

      const salaries =
        await db
          .select()
          .from(salaryTable)
          .where(
            eq(
              salaryTable.month,
              month,
            ),
          );

      const salaryIds =
        salaries.map(
          (salary) => salary.id,
        );

      const payments =
        salaryIds.length > 0
          ? await db
              .select()
              .from(paymentTable)
          : [];

      const filteredPayments =
        payments.filter(
          (payment) =>
            salaryIds.includes(
              payment.salaryId,
            ),
        );

      res.json({
        payments:
          filteredPayments.reverse(),
      });
    } catch (error) {
      console.error(
        "Failed to load payments:",
        error,
      );

      res.status(500).json({
        error: "Failed to load payments",
      });
    }
  },
);

router.post(
  "/admin/payments",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
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
        await db
          .select()
          .from(salaryTable)
          .where(
            and(
              eq(
                salaryTable.id,
                parsed.data.salaryId,
              ),
              eq(
                salaryTable.employeeId,
                parsed.data.employeeId,
              ),
            ),
          );

      const salaryRecord =
        salary[0];

      if (!salaryRecord) {
        res.status(404).json({
          error:
            "Salary record not found.",
        });
        return;
      }

      if (
        salaryRecord.status ===
        "paid"
      ) {
        res.status(409).json({
          error:
            "This salary has already been paid.",
        });
        return;
      }

      const existingPayment =
        await db
          .select()
          .from(paymentTable)
          .where(
            eq(
              paymentTable.salaryId,
              salaryRecord.id,
            ),
          );

      if (existingPayment.length > 0) {
        res.status(409).json({
          error:
            "This salary has already been paid.",
        });
        return;
      }

      const paidAt =
        parsed.data.paidAt ??
        new Date().toISOString();

      const payment =
        await db
          .insert(paymentTable)
          .values({
            id:
              `payment-${Date.now()}`,
            employeeId:
              salaryRecord.employeeId,
            salaryId:
              salaryRecord.id,
            amount:
              String(
                roundMoney(
                  Number(
                    salaryRecord.netSalary,
                  ),
                ),
              ),
            method:
              parsed.data.method,
            paidAt:
              new Date(paidAt),
            note:
              parsed.data.note,
          })
          .returning();

      const updatedSalary =
        await db
          .update(salaryTable)
          .set({
            status: "paid",
            paidAt:
              new Date(paidAt),
          })
          .where(
            eq(
              salaryTable.id,
              salaryRecord.id,
            ),
          )
          .returning();

      res.status(201).json({
        payment: payment[0],
        salary:
          updatedSalary[0],
      });
    } catch (error) {
      console.error(
        "Failed to create payment:",
        error,
      );

      res.status(500).json({
        error: "Failed to create payment",
      });
    }
  },
);

export default router;

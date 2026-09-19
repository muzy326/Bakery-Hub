import {
  pgTable,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  joinDate: text("join_date").notNull(),
  salary: numeric("salary", {
    precision: 10,
    scale: 2,
  }).notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull(),
});

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id").notNull(),
    date: text("date").notNull(),
    status: text("status").notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull(),
  },
);

export const salaryRecords = pgTable(
  "salary_records",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id").notNull(),
    month: text("month").notNull(),
    baseSalary: numeric("base_salary", {
      precision: 10,
      scale: 2,
    }).notNull(),
    deductions: numeric("deductions", {
      precision: 10,
      scale: 2,
    }).notNull().default("0"),
    bonus: numeric("bonus", {
      precision: 10,
      scale: 2,
    }).notNull().default("0"),
    netSalary: numeric("net_salary", {
      precision: 10,
      scale: 2,
    }).notNull(),
    status: text("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull(),
  },
);

export const paymentRecords = pgTable(
  "payment_records",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id").notNull(),
    salaryId: text("salary_id").notNull(),
    amount: numeric("amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    method: text("method").notNull(),
    paidAt: timestamp("paid_at", {
      withTimezone: true,
    }).notNull(),
    note: text("note").notNull().default(""),
  },
);
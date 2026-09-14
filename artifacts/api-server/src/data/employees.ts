export type EmployeeRole = "Owner" | "Manager" | "Baker" | "Cashier" | "Delivery" | "Staff";
export type EmployeeStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";
export type SalaryStatus = "pending" | "paid";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  joinDate: string;
  salary: number;
  status: EmployeeStatus;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  note: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: SalaryStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  employeeId: string;
  salaryId: string;
  amount: number;
  method: string;
  paidAt: string;
  note: string;
}

export const employees: Employee[] = [];
export const attendanceRecords: AttendanceRecord[] = [];
export const salaryRecords: SalaryRecord[] = [];
export const paymentRecords: PaymentRecord[] = [];
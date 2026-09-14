import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Mail,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type Role = "Owner" | "Manager" | "Baker" | "Cashier" | "Delivery" | "Staff";
type EmployeeStatus = "active" | "inactive";
type AttendanceStatus = "present" | "absent" | "late" | "leave";
type SalaryStatus = "pending" | "paid";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  joinDate: string;
  salary: number;
  status: EmployeeStatus | string;
}

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
}

interface Salary {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: SalaryStatus;
  paidAt?: string | null;
}

interface Payment {
  id: string;
  employeeId: string;
  salaryId: string;
  amount: number;
  method: string;
  paidAt: string;
  note?: string | null;
}

type EmployeeForm = Omit<Employee, "id">;

const roles: Role[] = ["Owner", "Manager", "Baker", "Cashier", "Delivery", "Staff"];
const attendanceStatuses: AttendanceStatus[] = ["present", "late", "absent", "leave"];
const emptyEmployee: EmployeeForm = {
  name: "",
  email: "",
  phone: "",
  role: "Staff",
  department: "",
  joinDate: new Date().toISOString().slice(0, 10),
  salary: 0,
  status: "active",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

const dateLabel = (value: string) =>
  value
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`))
    : "—";

const monthLabel = (value: string) =>
  value
    ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(`${value}-01T12:00:00`))
    : "Selected month";

const unwrapList = <T,>(payload: unknown, key: string): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const candidate = (payload as Record<string, unknown>)[key];
    if (Array.isArray(candidate)) return candidate as T[];
    const data = (payload as Record<string, unknown>).data;
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object") {
      const nested = (data as Record<string, unknown>)[key];
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
};

const unwrapOne = <T,>(payload: unknown, key: string): T | null => {
  if (payload && typeof payload === "object") {
    const object = payload as Record<string, unknown>;
    if (object[key] && typeof object[key] === "object") return object[key] as T;
    if (object.data && typeof object.data === "object" && !Array.isArray(object.data)) return object.data as T;
  }
  return payload && typeof payload === "object" ? (payload as T) : null;
};

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, credentials: "include" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload ? String(payload.error) : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatusPill({ status, testId }: { status: string; testId?: string }) {
  const styles: Record<string, string> = {
    active: "bg-[#e4f0e8] text-[#2c6a4c]",
    inactive: "bg-[#f0e9e1] text-[#78695e]",
    present: "bg-[#e4f0e8] text-[#2c6a4c]",
    late: "bg-[#fff0d5] text-[#9a5d17]",
    absent: "bg-[#fae1de] text-[#a64a42]",
    leave: "bg-[#e7e8f3] text-[#565b83]",
    paid: "bg-[#e4f0e8] text-[#2c6a4c]",
    pending: "bg-[#fff0d5] text-[#9a5d17]",
  };
  return (
    <span data-testid={testId ?? `status-${status}`} className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize tracking-[0.01em] ${styles[status] ?? "bg-[#eee9e2] text-[#655a52]"}`}>
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone }: { icon: typeof UsersRound; label: string; value: string; detail: string; tone: "gold" | "green" | "rose" | "slate" }) {
  const tones = {
    gold: "bg-[#fbefd7] text-[#9a5d17]",
    green: "bg-[#e4f0e8] text-[#2c6a4c]",
    rose: "bg-[#fae1de] text-[#a64a42]",
    slate: "bg-[#e7e8f3] text-[#565b83]",
  };
  return (
    <div className="rounded-2xl border border-[#e2d9cf] bg-[#fffdf9] p-4 shadow-[0_8px_22px_rgba(81,55,35,0.04)]" data-testid={`stat-card-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#81766d]">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#2f2119]">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-2 text-xs text-[#81766d]">{detail}</p>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingSalaries, setLoadingSalaries] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"team" | "attendance" | "payroll">("team");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employeeModal, setEmployeeModal] = useState<"create" | "edit" | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>(emptyEmployee);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState<string | null>(null);
  const [generatingSalary, setGeneratingSalary] = useState(false);
  const [payingSalary, setPayingSalary] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<Record<string, string>>({});
  const [payNote, setPayNote] = useState<Record<string, string>>({});

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const payload = await requestJson("/api/admin/employees");
      setEmployees(unwrapList<Employee>(payload, "employees"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load employee records.");
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      const payload = await requestJson(`/api/admin/attendance?date=${encodeURIComponent(selectedDate)}`);
      const records = unwrapList<Attendance>(payload, "attendance");
      setAttendance(records.filter((record) => !record.date || record.date.slice(0, 10) === selectedDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load attendance.");
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedDate]);

  const loadPayroll = useCallback(async () => {
    setLoadingSalaries(true);
    try {
      const [salaryPayload, paymentPayload] = await Promise.all([
        requestJson(`/api/admin/salaries?month=${encodeURIComponent(selectedMonth)}`),
        requestJson(`/api/admin/payments?month=${encodeURIComponent(selectedMonth)}`).catch(() => []),
      ]);
      const salaryRecords = unwrapList<Salary>(salaryPayload, "salaries");
      setSalaries(salaryRecords.filter((record) => !record.month || record.month.slice(0, 7) === selectedMonth));
      setPayments(unwrapList<Payment>(paymentPayload, "payments"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load salary records.");
    } finally {
      setLoadingSalaries(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    void loadPayroll();
  }, [loadPayroll]);

  const employeeById = useMemo(() => new Map(employees.map((employee) => [String(employee.id), employee])), [employees]);
  const attendanceByEmployee = useMemo(() => new Map(attendance.map((record) => [String(record.employeeId), record])), [attendance]);
  const filteredEmployees = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch = !needle || [employee.name, employee.email, employee.department, employee.role].join(" ").toLowerCase().includes(needle);
      return matchesSearch && (roleFilter === "all" || employee.role === roleFilter);
    });
  }, [employees, roleFilter, search]);

  const activeEmployees = employees.filter((employee) => employee.status !== "inactive");
  const presentCount = attendance.filter((record) => record.status === "present" || record.status === "late").length;
  const pendingSalaries = salaries.filter((salary) => salary.status !== "paid").length;
  const payrollTotal = salaries.reduce((sum, salary) => sum + Number(salary.netSalary || 0), 0);

  const openCreate = () => {
    setEditingEmployee(null);
    setEmployeeForm({ ...emptyEmployee });
    setError("");
    setEmployeeModal("create");
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      joinDate: employee.joinDate?.slice(0, 10) ?? "",
      salary: Number(employee.salary || 0),
      status: employee.status === "inactive" ? "inactive" : "active",
    });
    setError("");
    setEmployeeModal("edit");
  };

  const saveEmployee = async () => {
    if (!employeeForm.name.trim() || !employeeForm.email.trim() || !employeeForm.joinDate) {
      setError("Name, email, and join date are required.");
      return;
    }
    setSavingEmployee(true);
    setError("");
    try {
      const payload = {
        ...employeeForm,
        name: employeeForm.name.trim(),
        email: employeeForm.email.trim(),
        phone: employeeForm.phone.trim(),
        department: employeeForm.department.trim(),
        salary: Number(employeeForm.salary),
      };
      const result = await requestJson(editingEmployee ? `/api/admin/employees/${editingEmployee.id}` : "/api/admin/employees", {
        method: editingEmployee ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = unwrapOne<Employee>(result, "employee");
      if (saved) {
        setEmployees((current) =>
          editingEmployee ? current.map((employee) => (employee.id === editingEmployee.id ? { ...employee, ...saved } : employee)) : [saved, ...current],
        );
      } else {
        await loadEmployees();
      }
      setEmployeeModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save employee.");
    } finally {
      setSavingEmployee(false);
    }
  };

  const saveAttendance = async (employee: Employee, status: AttendanceStatus) => {
    const current = attendanceByEmployee.get(String(employee.id));
    setSavingAttendance(String(employee.id));
    setError("");
    try {
      const result = await requestJson("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(current?.id ? { id: current.id } : {}),
          employeeId: employee.id,
          date: selectedDate,
          status,
          note: current?.note ?? "",
        }),
      });
      const saved = unwrapOne<Attendance>(result, "attendance");
      if (saved) {
        setAttendance((records) => {
          const withoutCurrent = records.filter((record) => record.employeeId !== employee.id);
          return [...withoutCurrent, saved];
        });
      } else {
        await loadAttendance();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update attendance.");
    } finally {
      setSavingAttendance(null);
    }
  };

  const generateSalaries = async () => {
    setGeneratingSalary(true);
    setError("");
    try {
      await requestJson("/api/admin/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth }),
      });
      await loadPayroll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate salary records.");
    } finally {
      setGeneratingSalary(false);
    }
  };

  const markPaid = async (salary: Salary) => {
    const employee = employeeById.get(String(salary.employeeId));
    if (!employee) return;
    setPayingSalary(String(salary.id));
    setError("");
    const paidAt = new Date().toISOString();
    try {
      const result = await requestJson("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: salary.employeeId,
          salaryId: salary.id,
          amount: Number(salary.netSalary),
          method: payMethod[salary.id] || "Bank transfer",
          paidAt,
          note: payNote[salary.id] || "",
        }),
      });
      const payment = unwrapOne<Payment>(result, "payment");
      setPayments((current) => (payment ? [payment, ...current] : current));
      setSalaries((current) => current.map((record) => (record.id === salary.id ? { ...record, status: "paid", paidAt } : record)));
      await loadPayroll();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not mark ${employee.name}'s salary paid.`);
    } finally {
      setPayingSalary(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] pb-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a36a35]">
            <ShieldCheck size={14} /> Owner workspace
          </div>
          <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.045em] text-[#302119] sm:text-[2.35rem]" style={{ fontFamily: "var(--app-font-serif)" }}>
            People at Kanz
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#756a61]">
            One clear view of the people who keep the ovens warm, the counters moving, and every order on its way.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button data-testid="button-refresh-people" onClick={() => { void loadEmployees(); void loadAttendance(); void loadPayroll(); }} className="flex h-10 items-center gap-2 rounded-xl border border-[#d9cec2] bg-[#fffdf9] px-3 text-xs font-semibold text-[#685c52] transition hover:border-[#bb9c7e] hover:text-[#302119]">
            <RefreshCw size={14} /> Refresh
          </button>
          <button data-testid="button-add-employee" onClick={openCreate} className="flex h-10 items-center gap-2 rounded-xl bg-[#a96832] px-4 text-xs font-bold text-[#fffaf3] shadow-[0_8px_18px_rgba(153,91,43,0.2)] transition hover:bg-[#8f5528]">
            <Plus size={15} /> Add employee
          </button>
        </div>
      </div>

      {error && (
        <div data-testid="status-employee-error" className="mb-5 flex items-start gap-3 rounded-xl border border-[#e6bdb6] bg-[#fff1ef] px-4 py-3 text-sm text-[#97463e]">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button data-testid="button-dismiss-error" onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={UsersRound} label="Team" value={String(employees.length)} detail={`${activeEmployees.length} currently active`} tone="gold" />
        <StatCard icon={CalendarDays} label="On the floor" value={`${presentCount}/${activeEmployees.length || 0}`} detail={`${dateLabel(selectedDate)} attendance`} tone="green" />
        <StatCard icon={CircleDollarSign} label="Payroll" value={money(payrollTotal)} detail={`${monthLabel(selectedMonth)} net total`} tone="slate" />
        <StatCard icon={Clock3} label="To review" value={String(pendingSalaries)} detail="salary records pending" tone="rose" />
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-[#e1d8ce] bg-[#f1ebe3] p-1.5">
        {[
          { id: "team" as const, label: "Team directory", icon: UsersRound },
          { id: "attendance" as const, label: "Attendance", icon: CalendarDays },
          { id: "payroll" as const, label: "Monthly payroll", icon: CircleDollarSign },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            data-testid={`tab-${id}`}
            onClick={() => setActiveSection(id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${activeSection === id ? "bg-[#fffdf9] text-[#302119] shadow-sm" : "text-[#81766d] hover:text-[#4a3b30]"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeSection === "team" && (
        <section data-testid="section-team-directory">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#3b2a20]">Team directory</h2>
              <p className="mt-1 text-xs text-[#81766d]">Contact details, responsibilities, and current status.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a19387]" />
                <input data-testid="input-search-employees" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the team" className="h-10 w-full rounded-xl border border-[#d9cec2] bg-[#fffdf9] pl-9 pr-3 text-sm text-[#302119] outline-none transition placeholder:text-[#aa9d90] focus:border-[#b77e4d] focus:ring-2 focus:ring-[#c79465]/20 sm:w-56" />
              </label>
              <label className="relative">
                <SlidersHorizontal size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a19387]" />
                <select data-testid="select-role-filter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#d9cec2] bg-[#fffdf9] pl-9 pr-8 text-xs font-semibold text-[#62554b] outline-none focus:border-[#b77e4d] sm:w-40">
                  <option value="all">All roles</option>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a19387]" />
              </label>
            </div>
          </div>

          {loadingEmployees ? (
            <div data-testid="loading-employees" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-[#e5ddd4] bg-[#f3eee8]" />)}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div data-testid="empty-employees" className="rounded-2xl border border-dashed border-[#d9cec2] bg-[#fffdf9] px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e5d4] text-[#a96832]"><UserRound size={21} /></div>
              <h3 className="text-sm font-bold text-[#3b2a20]">{employees.length ? "No team members match" : "Your team directory is ready"}</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#81766d]">{employees.length ? "Try a different name or role filter." : "Add the first employee to start keeping people operations in one place."}</p>
              {!employees.length && <button data-testid="button-empty-add-employee" onClick={openCreate} className="mt-4 rounded-xl bg-[#a96832] px-4 py-2 text-xs font-bold text-[#fffaf3]">Add first employee</button>}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <article key={employee.id} data-testid={`card-employee-${employee.id}`} className="group rounded-2xl border border-[#e2d9cf] bg-[#fffdf9] p-4 shadow-[0_8px_22px_rgba(81,55,35,0.04)] transition hover:-translate-y-0.5 hover:border-[#cbb39b]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div data-testid={`avatar-employee-${employee.id}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e7d8c7] text-sm font-bold text-[#85512e]">{initials(employee.name)}</div>
                      <div className="min-w-0">
                        <h3 data-testid={`text-employee-name-${employee.id}`} className="truncate text-sm font-bold text-[#34251d]">{employee.name}</h3>
                        <p data-testid={`text-employee-role-${employee.id}`} className="mt-0.5 text-xs text-[#81766d]">{employee.role} · {employee.department || "Unassigned"}</p>
                      </div>
                    </div>
                    <StatusPill status={employee.status || "active"} testId={`status-employee-${employee.id}`} />
                  </div>
                  <div className="mt-4 space-y-2 border-t border-[#eee7df] pt-3">
                    <div className="flex items-center gap-2 text-xs text-[#706359]"><Mail size={13} className="text-[#a96832]" /><span data-testid={`text-employee-email-${employee.id}`} className="truncate">{employee.email}</span></div>
                    <div className="flex items-center gap-2 text-xs text-[#706359]"><MapPin size={13} className="text-[#a96832]" /><span data-testid={`text-employee-joined-${employee.id}`}>Joined {dateLabel(employee.joinDate)}</span><span className="ml-auto font-semibold text-[#4b3d33]">{money(Number(employee.salary))}<span className="font-normal text-[#95877b]"> / mo</span></span></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-[#998b80]">{employee.phone || "No phone on file"}</span>
                    <button data-testid={`button-edit-employee-${employee.id}`} onClick={() => openEdit(employee)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#89603f] transition hover:bg-[#f5ecdf]"><Pencil size={12} /> Edit</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === "attendance" && (
        <section data-testid="section-attendance">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#3b2a20]">Daily attendance</h2>
              <p className="mt-1 text-xs text-[#81766d]">Set a status for each person on the selected date.</p>
            </div>
            <label className="text-xs font-bold text-[#756a61]">Date<input data-testid="input-attendance-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 block h-10 rounded-xl border border-[#d9cec2] bg-[#fffdf9] px-3 text-sm font-medium text-[#302119] outline-none focus:border-[#b77e4d]" /></label>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#e2d9cf] bg-[#fffdf9]">
            <div className="hidden grid-cols-[minmax(220px,1.3fr)_150px_minmax(240px,1fr)] gap-4 border-b border-[#eee7df] bg-[#fbf6ef] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#95877b] md:grid">
              <span>Employee</span><span>Today</span><span>Note</span>
            </div>
            {loadingAttendance || loadingEmployees ? (
              <div data-testid="loading-attendance" className="space-y-2 p-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-[#f3eee8]" />)}</div>
            ) : activeEmployees.length === 0 ? (
              <div data-testid="empty-attendance" className="px-6 py-14 text-center text-sm text-[#81766d]">Add an active employee to start recording attendance.</div>
            ) : (
              activeEmployees.map((employee) => {
                const record = attendanceByEmployee.get(String(employee.id));
                return (
                  <div key={employee.id} data-testid={`row-attendance-${employee.id}`} className="grid gap-3 border-b border-[#eee7df] px-4 py-4 last:border-0 md:grid-cols-[minmax(220px,1.3fr)_150px_minmax(240px,1fr)] md:items-center md:gap-4 md:px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eee3d6] text-xs font-bold text-[#85512e]">{initials(employee.name)}</div>
                      <div><p data-testid={`text-attendance-employee-${employee.id}`} className="text-sm font-bold text-[#3b2a20]">{employee.name}</p><p className="text-xs text-[#95877b]">{employee.role}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {attendanceStatuses.map((status) => (
                        <button key={status} data-testid={`button-attendance-${status}-${employee.id}`} disabled={savingAttendance === String(employee.id)} onClick={() => void saveAttendance(employee, status)} className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold capitalize transition ${record?.status === status ? "border-[#a96832] bg-[#a96832] text-[#fffaf3]" : "border-[#e1d8ce] bg-[#fffdf9] text-[#82766c] hover:border-[#bda184] hover:text-[#5c4636]"} disabled:cursor-wait disabled:opacity-50`}>{status}</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input key={`${employee.id}-${record?.id ?? "empty"}-${record?.note ?? ""}`} data-testid={`input-attendance-note-${employee.id}`} defaultValue={record?.note ?? ""} onBlur={(event) => { if (record && event.target.value !== (record.note ?? "")) void requestJson("/api/admin/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id, employeeId: employee.id, date: selectedDate, status: record.status, note: event.target.value }) }).then(() => loadAttendance()).catch((err: Error) => setError(err.message)); }} placeholder="Add a note" className="h-9 min-w-0 flex-1 rounded-lg border border-[#e1d8ce] bg-[#fffdf9] px-3 text-xs text-[#4f4035] outline-none placeholder:text-[#b0a297] focus:border-[#b77e4d]" />
                      {record && <StatusPill status={record.status} testId={`status-attendance-${employee.id}`} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {activeSection === "payroll" && (
        <section data-testid="section-payroll">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#3b2a20]">Monthly payroll</h2>
              <p className="mt-1 text-xs text-[#81766d]">Generate, review, and mark salary records paid.</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs font-bold text-[#756a61]">Month<input data-testid="input-payroll-month" type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="mt-1 block h-10 rounded-xl border border-[#d9cec2] bg-[#fffdf9] px-3 text-sm font-medium text-[#302119] outline-none focus:border-[#b77e4d]" /></label>
              <button data-testid="button-generate-salaries" onClick={() => void generateSalaries()} disabled={generatingSalary} className="flex h-10 items-center gap-2 rounded-xl bg-[#365d50] px-3 text-xs font-bold text-[#fffdf9] transition hover:bg-[#2c4d42] disabled:opacity-50"><Download size={14} />{generatingSalary ? "Generating…" : "Generate records"}</button>
            </div>
          </div>
          <div className="mb-4 rounded-2xl border border-[#d8e2da] bg-[#eef4ef] px-4 py-3 text-xs text-[#446252]">
            <div className="flex items-start gap-2"><BriefcaseBusiness size={15} className="mt-0.5 shrink-0" /><p><strong>{monthLabel(selectedMonth)}</strong> · Generated records use each employee’s monthly base salary. Review adjustments before marking a salary paid.</p></div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#e2d9cf] bg-[#fffdf9]">
            <div className="hidden grid-cols-[minmax(180px,1.2fr)_110px_110px_110px_120px_minmax(210px,1.2fr)] gap-3 border-b border-[#eee7df] bg-[#fbf6ef] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#95877b] lg:grid">
              <span>Employee</span><span>Base</span><span>Adjustments</span><span>Net pay</span><span>Status</span><span>Payment</span>
            </div>
            {loadingSalaries || loadingEmployees ? (
              <div data-testid="loading-payroll" className="space-y-2 p-4">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-[#f3eee8]" />)}</div>
            ) : salaries.length === 0 ? (
              <div data-testid="empty-payroll" className="px-6 py-14 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7e8f3] text-[#565b83]"><CircleDollarSign size={21} /></div><p className="text-sm font-bold text-[#3b2a20]">No salary records for {monthLabel(selectedMonth)}</p><p className="mt-1 text-xs text-[#81766d]">Generate this month’s records when the team details are up to date.</p></div>
            ) : (
              salaries.map((salary) => {
                const employee = employeeById.get(String(salary.employeeId));
                if (!employee) return null;
                const adjustment = Number(salary.bonus || 0) - Number(salary.deductions || 0);
                return (
                  <div key={salary.id} data-testid={`row-salary-${salary.id}`} className="grid gap-3 border-b border-[#eee7df] px-4 py-4 last:border-0 lg:grid-cols-[minmax(180px,1.2fr)_110px_110px_110px_120px_minmax(210px,1.2fr)] lg:items-center lg:gap-3 lg:px-5">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eee3d6] text-xs font-bold text-[#85512e]">{initials(employee.name)}</div><div><p data-testid={`text-salary-employee-${salary.id}`} className="text-sm font-bold text-[#3b2a20]">{employee.name}</p><p className="text-xs text-[#95877b]">{employee.role}</p></div></div>
                    <div><span className="text-[10px] uppercase text-[#95877b] lg:hidden">Base · </span><span data-testid={`text-salary-base-${salary.id}`} className="text-sm font-semibold text-[#4d3d32]">{money(Number(salary.baseSalary))}</span></div>
                    <div><span className="text-[10px] uppercase text-[#95877b] lg:hidden">Adjustments · </span><span className={`text-sm font-semibold ${adjustment >= 0 ? "text-[#2c6a4c]" : "text-[#a64a42]"}`}>{adjustment >= 0 ? "+" : ""}{money(adjustment)}</span></div>
                    <div><span className="text-[10px] uppercase text-[#95877b] lg:hidden">Net pay · </span><span data-testid={`text-salary-net-${salary.id}`} className="text-sm font-bold text-[#302119]">{money(Number(salary.netSalary))}</span></div>
                    <div><StatusPill status={salary.status} testId={`status-salary-${salary.id}`} />{salary.paidAt && <p data-testid={`text-salary-paid-at-${salary.id}`} className="mt-1 text-[10px] text-[#95877b]">{dateLabel(salary.paidAt.slice(0, 10))}</p>}</div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {salary.status === "paid" ? <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2c6a4c]"><Check size={14} /> Payment recorded</span> : <><select data-testid={`select-payment-method-${salary.id}`} value={payMethod[salary.id] || "Bank transfer"} onChange={(event) => setPayMethod((current) => ({ ...current, [salary.id]: event.target.value }))} className="h-8 rounded-lg border border-[#e1d8ce] bg-[#fffdf9] px-2 text-[11px] text-[#67594f] outline-none"><option>Bank transfer</option><option>Cash</option><option>Card</option></select><input data-testid={`input-payment-note-${salary.id}`} value={payNote[salary.id] || ""} onChange={(event) => setPayNote((current) => ({ ...current, [salary.id]: event.target.value }))} placeholder="Note" className="h-8 min-w-0 flex-1 rounded-lg border border-[#e1d8ce] bg-[#fffdf9] px-2 text-[11px] text-[#67594f] outline-none placeholder:text-[#b0a297]" /><button data-testid={`button-mark-paid-${salary.id}`} onClick={() => void markPaid(salary)} disabled={payingSalary === String(salary.id)} className="flex h-8 items-center justify-center gap-1 rounded-lg bg-[#365d50] px-2.5 text-[11px] font-bold text-white transition hover:bg-[#2c4d42] disabled:opacity-50">{payingSalary === String(salary.id) ? "Saving…" : "Mark paid"}</button></>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {payments.length > 0 && <p data-testid="text-payment-count" className="mt-3 flex items-center gap-1.5 text-xs text-[#81766d]"><ArrowUpRight size={13} /> {payments.length} payment record{payments.length === 1 ? "" : "s"} returned for this period.</p>}
        </section>
      )}

      {employeeModal && (
        <div data-testid="dialog-employee" className="fixed inset-0 z-[70] flex items-end justify-center bg-[#2d2118]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setEmployeeModal(null); }}>
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[#e2d9cf] bg-[#fffdf9] p-5 shadow-2xl sm:rounded-3xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#a96832]">{employeeModal === "edit" ? "Team record" : "New record"}</p><h2 data-testid="text-employee-dialog-title" className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#302119]" style={{ fontFamily: "var(--app-font-serif)" }}>{employeeModal === "edit" ? "Edit employee" : "Add employee"}</h2><p className="mt-1 text-xs text-[#81766d]">Keep this record current so attendance and payroll stay useful.</p></div>
              <button data-testid="button-close-employee-dialog" onClick={() => setEmployeeModal(null)} className="rounded-xl p-2 text-[#94867a] transition hover:bg-[#f3ebe3] hover:text-[#302119]" aria-label="Close employee form"><X size={18} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="field-label">Full name *</span><input data-testid="input-employee-name" value={employeeForm.name} onChange={(event) => setEmployeeForm((form) => ({ ...form, name: event.target.value }))} placeholder="e.g. Amina Rahman" className="field-input" /></label>
              <label><span className="field-label">Email *</span><input data-testid="input-employee-email" type="email" value={employeeForm.email} onChange={(event) => setEmployeeForm((form) => ({ ...form, email: event.target.value }))} placeholder="amina@kanzbakery.com" className="field-input" /></label>
              <label><span className="field-label">Phone</span><input data-testid="input-employee-phone" value={employeeForm.phone} onChange={(event) => setEmployeeForm((form) => ({ ...form, phone: event.target.value }))} placeholder="+1 (555) 014-0188" className="field-input" /></label>
              <label><span className="field-label">Role *</span><select data-testid="select-employee-role" value={employeeForm.role} onChange={(event) => setEmployeeForm((form) => ({ ...form, role: event.target.value as Role }))} className="field-input"><option value="" disabled>Select role</option>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
              <label><span className="field-label">Department</span><input data-testid="input-employee-department" value={employeeForm.department} onChange={(event) => setEmployeeForm((form) => ({ ...form, department: event.target.value }))} placeholder="Production, Front of house…" className="field-input" /></label>
              <label><span className="field-label">Join date *</span><input data-testid="input-employee-join-date" type="date" value={employeeForm.joinDate} onChange={(event) => setEmployeeForm((form) => ({ ...form, joinDate: event.target.value }))} className="field-input" /></label>
              <label><span className="field-label">Monthly salary</span><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#a19387]">$</span><input data-testid="input-employee-salary" type="number" min="0" step="1" value={employeeForm.salary} onChange={(event) => setEmployeeForm((form) => ({ ...form, salary: Number(event.target.value) }))} className="field-input pl-7" /></div></label>
              <label><span className="field-label">Status</span><select data-testid="select-employee-status" value={employeeForm.status} onChange={(event) => setEmployeeForm((form) => ({ ...form, status: event.target.value }))} className="field-input"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#eee7df] pt-5 sm:flex-row sm:justify-end">
              <button data-testid="button-cancel-employee" onClick={() => setEmployeeModal(null)} className="h-10 rounded-xl border border-[#d9cec2] px-4 text-xs font-bold text-[#71645a] transition hover:bg-[#f5eee6]">Cancel</button>
              <button data-testid="button-save-employee" onClick={() => void saveEmployee()} disabled={savingEmployee} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#a96832] px-5 text-xs font-bold text-[#fffaf3] transition hover:bg-[#8f5528] disabled:opacity-50"><Save size={14} />{savingEmployee ? "Saving…" : employeeModal === "edit" ? "Save changes" : "Create employee"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
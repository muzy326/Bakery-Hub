import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Boxes, CircleDollarSign, PackageCheck, PieChart as PieChartIcon, RefreshCw, ShoppingBag, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardProduct {
  id: string;
  name: string;
  category: string;
  value: number;
  color: string;
}

interface DashboardCategory {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DashboardResponse {
  summary: {
    totalRevenue: number;
    totalUnits: number;
    totalOrders: number;
    activeProducts: number;
    categoryCount: number;
  };
  productDistribution: DashboardProduct[];
  categorySplit: DashboardCategory[];
  categoryRevenue: DashboardCategory[];
  productRevenue: DashboardProduct[];
}

const currency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const compactCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function ChartCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof BarChart3;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#e4d9ce] bg-[#fffdf9] p-4 shadow-[0_8px_25px_rgba(78,48,27,0.04)] sm:p-5 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b77e4d]">
            <Icon size={13} /> {eyebrow}
          </div>
          <h2 className="text-base font-bold tracking-[-0.02em] text-[#302119]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[#8b7c70]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[270px] items-center justify-center rounded-xl border border-dashed border-[#dfd1c4] bg-[#fffaf4] text-center">
      <div>
        <BarChart3 size={24} className="mx-auto mb-2 text-[#c7b5a4]" />
        <p className="text-sm font-semibold text-[#685c52]">No sales data yet</p>
        <p className="mt-1 text-xs text-[#9a8c81]">Charts will populate after completed orders.</p>
      </div>
    </div>
  );
}

function shortenLabel(value: string, max = 18) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (!response.ok) throw new Error("Could not load dashboard data.");
      setData(await response.json() as DashboardResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const topProducts = useMemo(() => data?.productDistribution.slice(0, 8) ?? [], [data]);
  const revenueProducts = useMemo(() => data?.productRevenue.slice(0, 8) ?? [], [data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/70" />)}</div>
        <div className="grid gap-5 xl:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-[360px] animate-pulse rounded-2xl bg-white/70" />)}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] pb-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a36a35]">
            <TrendingUp size={14} /> Business overview
          </div>
          <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.045em] text-[#302119] sm:text-[2.35rem]" style={{ fontFamily: "var(--app-font-serif)" }}>
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#756a61]">
            Track what is selling, which categories lead revenue, and where your bakery is growing.
          </p>
        </div>
        <button
          data-testid="button-refresh-dashboard"
          onClick={() => void fetchDashboard(true)}
          disabled={refreshing}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d9cec2] bg-[#fffdf9] px-3 text-xs font-semibold text-[#685c52] transition hover:border-[#bb9c7e] hover:text-[#302119] disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh analytics
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#e6bdb6] bg-[#fff1ef] px-4 py-3 text-sm text-[#97463e]">
          <span>{error}</span>
          <button onClick={() => void fetchDashboard()} className="font-semibold underline">Try again</button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Net revenue", value: currency(data?.summary.totalRevenue ?? 0), detail: "Confirmed and completed", icon: CircleDollarSign, tone: "text-[#a96832]", bg: "bg-[#f8eee4]" },
          { label: "Items sold", value: (data?.summary.totalUnits ?? 0).toLocaleString(), detail: "Across tracked orders", icon: Boxes, tone: "text-[#6f8c70]", bg: "bg-[#edf4ed]" },
          { label: "Sales orders", value: (data?.summary.totalOrders ?? 0).toLocaleString(), detail: "Revenue-generating orders", icon: ShoppingBag, tone: "text-[#7d6b91]", bg: "bg-[#f1edf6]" },
          { label: "Active products", value: (data?.summary.activeProducts ?? 0).toLocaleString(), detail: `${data?.summary.categoryCount ?? 0} categories represented`, icon: PackageCheck, tone: "text-[#b56b59]", bg: "bg-[#f8ece8]" },
        ].map(({ label, value, detail, icon: Icon, tone, bg }) => (
          <div key={label} className="rounded-2xl border border-[#e4d9ce] bg-[#fffdf9] p-4 shadow-[0_8px_25px_rgba(78,48,27,0.04)] sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[#85776c]">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#302119] sm:text-3xl">{value}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${bg} ${tone}`}><Icon size={18} /></div>
            </div>
            <p className="mt-3 text-[11px] text-[#9a8c81]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard eyebrow="Product distribution" title="Units sold by product" description="The products moving the most volume." icon={BarChart3}>
          {topProducts.length === 0 ? <EmptyChart /> : (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 14, left: 6, bottom: 8 }}>
                  <CartesianGrid horizontal={false} stroke="#eee4da" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#9a8c81", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={108} axisLine={false} tickLine={false} tick={{ fill: "#685c52", fontSize: 10 }} tickFormatter={(value) => shortenLabel(String(value), 16)} />
                  <Tooltip cursor={{ fill: "#faf2e9" }} formatter={(value: number) => [`${value.toLocaleString()} units`, "Sales"]} contentStyle={{ borderRadius: 12, border: "1px solid #e4d9ce", boxShadow: "0 8px 20px rgba(78,48,27,.08)", fontSize: 12 }} />
                  <Bar dataKey="value" name="Units sold" radius={[0, 7, 7, 0]} maxBarSize={23}>
                    {topProducts.map((product) => <Cell key={product.id} fill={product.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard eyebrow="Category split" title="Sales mix by category" description="The share of all units sold by category." icon={PieChartIcon}>
          {(data?.categorySplit.length ?? 0) === 0 ? <EmptyChart /> : (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.categorySplit} dataKey="value" nameKey="label" cx="50%" cy="46%" outerRadius={92} paddingAngle={3} stroke="#fffdf9" strokeWidth={3}>
                    {data?.categorySplit.map((category) => <Cell key={category.id} fill={category.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()} units`, "Sales"]} contentStyle={{ borderRadius: 12, border: "1px solid #e4d9ce", boxShadow: "0 8px 20px rgba(78,48,27,.08)", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#685c52" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard eyebrow="Revenue by category" title="Which category earns the most?" description="Net revenue after order-level discounts." icon={CircleDollarSign}>
          {(data?.categoryRevenue.length ?? 0) === 0 ? <EmptyChart /> : (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.categoryRevenue} dataKey="value" nameKey="label" cx="50%" cy="46%" innerRadius={62} outerRadius={96} paddingAngle={4} stroke="#fffdf9" strokeWidth={3}>
                    {data?.categoryRevenue.map((category) => <Cell key={category.id} fill={category.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [currency(value), "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #e4d9ce", boxShadow: "0 8px 20px rgba(78,48,27,.08)", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#685c52" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard eyebrow="Sales value" title="Revenue per product" description="Top products ranked by net sales value." icon={BarChart3}>
          {revenueProducts.length === 0 ? <EmptyChart /> : (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueProducts} margin={{ top: 8, right: 10, left: -12, bottom: 42 }}>
                  <CartesianGrid vertical={false} stroke="#eee4da" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-28} textAnchor="end" height={58} tick={{ fill: "#685c52", fontSize: 10 }} tickFormatter={(value) => shortenLabel(String(value), 14)} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9a8c81", fontSize: 11 }} tickFormatter={(value) => compactCurrency(Number(value))} />
                  <Tooltip cursor={{ fill: "#faf2e9" }} formatter={(value: number) => [currency(value), "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #e4d9ce", boxShadow: "0 8px 20px rgba(78,48,27,.08)", fontSize: 12 }} />
                  <Bar dataKey="value" name="Revenue" radius={[7, 7, 0, 0]} maxBarSize={36}>
                    {revenueProducts.map((product) => <Cell key={product.id} fill={product.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface WaterfallChartProps {
  totalRevenue: number;
  materialsCost: number;
  fixedExpenses: number;
  salaryProvisions: number;
}

export function WaterfallChart({
  totalRevenue,
  materialsCost,
  fixedExpenses,
  salaryProvisions,
}: WaterfallChartProps) {
  const profit = totalRevenue - materialsCost - fixedExpenses - salaryProvisions;

  const data = [
    {
      name: "Ingresos",
      value: totalRevenue,
      start: 0,
      fill: "hsl(var(--primary))",
    },
    {
      name: "Materiales",
      value: -materialsCost,
      start: totalRevenue,
      fill: "hsl(var(--accent))",
    },
    {
      name: "Gastos Fijos",
      value: -fixedExpenses,
      start: totalRevenue - materialsCost,
      fill: "hsl(var(--entaltek-raspberry))",
    },
    {
      name: "Sueldo",
      value: -salaryProvisions,
      start: totalRevenue - materialsCost - fixedExpenses,
      fill: "hsl(var(--muted-foreground))",
    },
    {
      name: "Utilidad",
      value: profit,
      start: 0,
      fill: profit >= 0 ? "hsl(142 76% 36%)" : "hsl(var(--destructive))",
    },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(Math.abs(value));

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in">
      <h3 className="font-semibold text-foreground mb-6">
        Cascada Financiera del Mes
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Monto"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "var(--shadow-card)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Utilidad Real:</span>
        <span
          className={`text-xl font-bold ${
            profit >= 0 ? "text-green-600" : "text-destructive"
          }`}
        >
          {formatCurrency(profit)}
        </span>
      </div>
    </div>
  );
}

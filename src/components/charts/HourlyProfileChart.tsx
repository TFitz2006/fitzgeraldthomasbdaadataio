import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HourlyProfileChartProps {
  data: Array<{
    hour: number;
    avg_kwh: number;
  }>;
  title: string;
}

export function HourlyProfileChart({ data, title }: HourlyProfileChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    hourLabel: `${d.hour.toString().padStart(2, "0")}:00`,
  }));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-energy))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-energy))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="hourLabel"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            interval={2}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString()} kWh`, "Avg Energy"]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="avg_kwh"
            stroke="hsl(var(--chart-energy))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorKwh)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface TimeseriesChartProps {
  data: Array<{
    timestamp_hour: string;
    energy_kwh: number;
  }>;
  title: string;
}

export function TimeseriesChart({ data, title }: TimeseriesChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: parseISO(d.timestamp_hour),
    displayDate: format(parseISO(d.timestamp_hour), "MMM d, HH:mm"),
  }));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="displayDate"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            interval="preserveStartEnd"
            tickFormatter={(value) => {
              const parts = value.split(", ");
              return parts[0];
            }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString()} kWh`, "Energy"]}
            labelFormatter={(label) => label}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="energy_kwh"
            stroke="hsl(var(--chart-energy))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--chart-energy))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

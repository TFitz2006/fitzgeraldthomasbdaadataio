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

interface WeatherChartProps {
  data: Array<{
    timestamp_hour: string;
    temp?: number;
  }>;
  title: string;
}

export function WeatherChart({ data, title }: WeatherChartProps) {
  const formattedData = data
    .filter((d) => d.temp !== undefined)
    .map((d) => ({
      ...d,
      displayDate: format(parseISO(d.timestamp_hour), "MMM d, HH:mm"),
    }));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
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
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}°F`, "Temperature"]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="hsl(var(--chart-weather))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--chart-weather))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

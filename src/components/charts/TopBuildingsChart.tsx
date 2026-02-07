import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopBuildingsChartProps {
  data: Array<{
    building_id: string;
    building_name: string;
    total_kwh?: number;
    avg_intensity?: number;
  }>;
  dataKey: "total_kwh" | "avg_intensity";
  title: string;
  color: string;
  yAxisLabel: string;
}

export function TopBuildingsChart({
  data,
  dataKey,
  title,
  color,
  yAxisLabel,
}: TopBuildingsChartProps) {
  const navigate = useNavigate();

  const handleBarClick = (entry: { building_id: string }) => {
    navigate(`/deep-dive?building=${entry.building_id}`);
  };

  const formatValue = (value: number) => {
    if (dataKey === "total_kwh") {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toFixed(1);
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tickFormatter={formatValue}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            type="category"
            dataKey="building_name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            width={95}
          />
          <Tooltip
            formatter={(value: number) => [
              dataKey === "total_kwh"
                ? `${value.toLocaleString()} kWh`
                : `${value.toFixed(2)} kWh/sqft`,
              yAxisLabel,
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(data) => handleBarClick(data)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                className="bar-clickable"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Click a bar to view building details
      </p>
    </div>
  );
}

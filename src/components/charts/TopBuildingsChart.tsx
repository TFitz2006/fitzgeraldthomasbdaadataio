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
import { AlertTriangle } from "lucide-react";

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

  const handleOutlierClick = (buildingId: string) => {
    navigate(`/deep-dive?building=${buildingId}`);
  };

  // Detect outlier: if first item is > 2x the second, treat as outlier
  const hasOutlier = data.length >= 2 && dataKey === "total_kwh" && 
    (data[0]?.total_kwh || 0) > 2 * (data[1]?.total_kwh || 0);

  const outlier = hasOutlier ? data[0] : null;
  const chartData = hasOutlier ? data.slice(1) : data;

  const formatValue = (value: number) => {
    if (dataKey === "total_kwh") {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toFixed(1);
  };

  const formatFullValue = (value: number) => {
    if (dataKey === "total_kwh") {
      return `${value.toLocaleString()} kWh`;
    }
    return `${value.toFixed(2)} kWh/sqft`;
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      
      {/* Outlier Callout */}
      {outlier && (
        <div 
          className="mb-4 p-3 rounded-lg border-2 border-chart-anomaly/30 bg-chart-anomaly/5 cursor-pointer hover:bg-chart-anomaly/10 transition-colors"
          onClick={() => handleOutlierClick(outlier.building_id)}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-chart-anomaly" />
            <span className="text-xs font-medium text-chart-anomaly uppercase tracking-wide">Outlier</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{outlier.building_name}</span>
            <span className="text-lg font-bold text-chart-anomaly">
              {formatFullValue(outlier.total_kwh || 0)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {((outlier.total_kwh || 0) / (chartData[0]?.total_kwh || 1)).toFixed(1)}x higher than next building
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={hasOutlier ? 270 : 300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tickFormatter={formatValue}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            type="category"
            dataKey="building_name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            width={120}
            tickFormatter={(value: string) => value.length > 18 ? `${value.slice(0, 16)}...` : value}
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
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                className="bar-clickable"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Click {hasOutlier ? "the outlier or " : ""}a bar to view building details
      </p>
    </div>
  );
}

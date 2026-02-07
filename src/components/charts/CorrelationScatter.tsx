import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
} from "recharts";
import {
  calculateTempEnergyCorrelation,
  interpretCorrelation,
  getScatterData,
} from "@/lib/analytics";
import type { HourlyTimeseries } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CorrelationScatterProps {
  data: HourlyTimeseries[];
  title: string;
  buildingName?: string;
}

export function CorrelationScatter({
  data,
  title,
  buildingName,
}: CorrelationScatterProps) {
  const correlation = calculateTempEnergyCorrelation(data);
  const scatterData = getScatterData(data);
  const interpretation = correlation
    ? interpretCorrelation(correlation.r)
    : null;

  // Generate regression line data
  const regressionData =
    correlation && scatterData.length > 0
      ? (() => {
          const temps = scatterData.map((d) => d.temp);
          const minTemp = Math.min(...temps);
          const maxTemp = Math.max(...temps);
          const step = (maxTemp - minTemp) / 20;
          return Array.from({ length: 21 }, (_, i) => {
            const temp = minTemp + step * i;
            return {
              temp,
              predicted: correlation.slope * temp + correlation.intercept,
            };
          });
        })()
      : [];

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "text-chart-anomaly";
      case "moderate":
        return "text-chart-weather";
      case "weak":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getStrengthIcon = () => {
    if (!correlation) return <Minus className="w-4 h-4" />;
    if (correlation.r > 0.3) return <TrendingUp className="w-4 h-4" />;
    if (correlation.r < -0.3) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  if (scatterData.length < 10) {
    return (
      <div className="chart-container flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">
          Insufficient data for correlation analysis
        </p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {buildingName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {buildingName}
            </p>
          )}
        </div>
        {correlation && interpretation && (
          <div className="text-right">
            <div
              className={`flex items-center gap-1.5 ${getStrengthColor(
                interpretation.strength
              )}`}
            >
              {getStrengthIcon()}
              <span className="text-sm font-semibold">
                r = {correlation.r.toFixed(3)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              R² = {(correlation.rSquared * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="temp"
            type="number"
            domain={["dataMin - 5", "dataMax + 5"]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{
              value: "Temperature (°F)",
              position: "bottom",
              offset: 5,
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
            }}
          />
          <YAxis
            dataKey="energy_kwh"
            type="number"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{
              value: "Energy (kWh)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === "predicted"
                ? `${value.toFixed(1)} kWh (trend)`
                : `${value.toFixed(1)} kWh`,
              name === "predicted" ? "Trend" : "Energy",
            ]}
            labelFormatter={(label) => `${label}°F`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Scatter
            data={scatterData}
            fill="hsl(var(--chart-energy))"
            fillOpacity={0.6}
          />
          {regressionData.length > 0 && (
            <Line
              data={regressionData}
              dataKey="predicted"
              stroke="hsl(var(--chart-anomaly))"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {interpretation && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-foreground">
            {interpretation.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {interpretation.description}
          </p>
        </div>
      )}
    </div>
  );
}

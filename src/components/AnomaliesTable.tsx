import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Anomaly } from "@/lib/mockData";
import { AlertTriangle, Snowflake, Sun, CloudRain } from "lucide-react";
import { interpretAnomalyWeather } from "@/lib/analytics";

interface AnomaliesTableProps {
  data: Anomaly[];
}

export function AnomaliesTable({ data }: AnomaliesTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (buildingId: string) => {
    navigate(`/deep-dive?building=${buildingId}`);
  };

  const getAnomalySeverity = (pctOver: number | null) => {
    if (pctOver === null || pctOver === undefined) return "low";
    if (pctOver >= 150) return "high";
    if (pctOver >= 100) return "medium";
    return "low";
  };

  const formatNumber = (value: number | null | undefined, decimals?: number): string => {
    if (value === null || value === undefined) return "—";
    if (decimals !== undefined) return value.toFixed(decimals);
    return value.toLocaleString();
  };

  const getWeatherIcon = (anomaly: Anomaly) => {
    const weather = interpretAnomalyWeather(anomaly);
    switch (weather.cause) {
      case "cold_snap":
        return <Snowflake className="w-4 h-4 text-primary" />;
      case "heat_wave":
        return <Sun className="w-4 h-4 text-chart-weather" />;
      case "precipitation":
        return <CloudRain className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  const getWeatherBadge = (anomaly: Anomaly) => {
    const weather = interpretAnomalyWeather(anomaly);
    if (weather.cause === "unknown") return null;

    const badgeStyles = {
      cold_snap: "bg-primary/10 text-primary border-primary/20",
      heat_wave: "bg-chart-weather/10 text-chart-weather border-chart-weather/20",
      precipitation: "bg-primary/10 text-primary border-primary/20",
      unknown: "",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyles[weather.cause]}`}
        title={weather.label}
      >
        {getWeatherIcon(anomaly)}
        {weather.cause === "cold_snap" && "Cold"}
        {weather.cause === "heat_wave" && "Heat"}
        {weather.cause === "precipitation" && "Rain"}
      </span>
    );
  };

  return (
    <div className="card-dashboard overflow-hidden p-0">
      <div className="p-6 pb-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-chart-anomaly" />
          Energy Consumption Anomalies
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Buildings with unusually high energy usage. Click a row to view details.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium">Building</TableHead>
              <TableHead className="font-medium">Campus</TableHead>
              <TableHead className="font-medium text-right">% Over Median</TableHead>
              <TableHead className="font-medium">Weather Context</TableHead>
              <TableHead className="font-medium text-right">Daily kWh</TableHead>
              <TableHead className="font-medium text-right">Baseline kWh</TableHead>
              <TableHead className="font-medium text-right">Avg Temp (°F)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const severity = getAnomalySeverity(row.pct_over_median);
              
              return (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(row.building_id)}
                >
                  <TableCell className="text-muted-foreground">{row.day || "—"}</TableCell>
                  <TableCell className="font-medium">{row.building_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{row.campusname || "—"}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        severity === "high"
                          ? "bg-destructive/10 text-destructive"
                          : severity === "medium"
                          ? "bg-chart-weather/10 text-chart-weather"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {row.pct_over_median !== null ? `+${row.pct_over_median.toFixed(3)}%` : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getWeatherBadge(row) || (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(row.daily_kwh)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(row.baseline_median_daily_kwh)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.avg_temp !== null && row.avg_temp !== undefined ? `${row.avg_temp}°` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

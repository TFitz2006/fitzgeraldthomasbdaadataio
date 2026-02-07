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
import { AlertTriangle } from "lucide-react";

interface AnomaliesTableProps {
  data: Anomaly[];
}

export function AnomaliesTable({ data }: AnomaliesTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (buildingId: string) => {
    navigate(`/deep-dive?building=${buildingId}`);
  };

  const getAnomalySeverity = (pctOver: number) => {
    if (pctOver >= 150) return "high";
    if (pctOver >= 100) return "medium";
    return "low";
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
              <TableHead className="font-medium text-right">Daily kWh</TableHead>
              <TableHead className="font-medium text-right">Baseline kWh</TableHead>
              <TableHead className="font-medium text-right">Avg Temp (°F)</TableHead>
              <TableHead className="font-medium text-right">Precip (in)</TableHead>
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
                  <TableCell className="text-muted-foreground">{row.day}</TableCell>
                  <TableCell className="font-medium">{row.building_name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.campusname}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        severity === "high"
                          ? "bg-red-100 text-red-700"
                          : severity === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      +{row.pct_over_median}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.daily_kwh.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.baseline_median_daily_kwh.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.avg_temp}°
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.total_precip.toFixed(1)}
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

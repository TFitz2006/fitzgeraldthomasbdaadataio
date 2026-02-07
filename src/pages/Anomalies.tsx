import { useMemo } from "react";
import { AnomaliesTable } from "@/components/AnomaliesTable";
import { mockAnomalies } from "@/lib/mockData";

export default function Anomalies() {
  // Sort by pct_over_median descending
  const sortedAnomalies = useMemo(
    () => [...mockAnomalies].sort((a, b) => b.pct_over_median - a.pct_over_median),
    []
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Anomalies</h1>
        <p className="page-subtitle mt-1">
          Buildings with energy consumption significantly above baseline
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-dashboard">
          <p className="text-sm text-muted-foreground">Total Anomalies</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {sortedAnomalies.length}
          </p>
        </div>
        <div className="card-dashboard">
          <p className="text-sm text-muted-foreground">Highest Deviation</p>
          <p className="text-2xl font-bold text-chart-anomaly mt-1">
            +{sortedAnomalies[0]?.pct_over_median || 0}%
          </p>
        </div>
        <div className="card-dashboard">
          <p className="text-sm text-muted-foreground">Avg Deviation</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            +
            {Math.round(
              sortedAnomalies.reduce((acc, a) => acc + a.pct_over_median, 0) /
                sortedAnomalies.length
            )}
            %
          </p>
        </div>
      </div>

      {/* Anomalies Table */}
      <AnomaliesTable data={sortedAnomalies} />
    </div>
  );
}

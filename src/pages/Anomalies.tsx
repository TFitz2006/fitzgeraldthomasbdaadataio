import { Loader2 } from "lucide-react";
import { AnomaliesTable } from "@/components/AnomaliesTable";
import { useAnomalies } from "@/hooks/useDatabricks";

export default function Anomalies() {
  const { data: anomalies, isLoading, error } = useAnomalies();

  const sortedAnomalies = anomalies
    ? [...anomalies].sort((a, b) => b.pct_over_median - a.pct_over_median)
    : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Anomalies</h1>
        <p className="page-subtitle mt-1">
          Buildings with energy consumption significantly above baseline
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading anomalies...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            Failed to load anomalies: {error.message}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && sortedAnomalies.length > 0 && (
        <>
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
                +{(sortedAnomalies[0]?.pct_over_median || 0).toFixed(3)}%
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
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && sortedAnomalies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No anomalies detected.</p>
        </div>
      )}
    </div>
  );
}

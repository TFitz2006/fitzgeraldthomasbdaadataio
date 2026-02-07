import { useSearchParams } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { AnomaliesTable } from "@/components/AnomaliesTable";
import { useAnomalies } from "@/hooks/useDatabricks";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "cold" | "heat" | "rain";

const filterLabels: Record<FilterType, string> = {
  all: "All Anomalies",
  cold: "Cold Snap Events (≤32°F)",
  heat: "Heat Wave Events (≥85°F)",
  rain: "Heavy Precipitation Events",
};

export default function Anomalies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") as FilterType | null;
  const activeFilter: FilterType = filterParam && ["cold", "heat", "rain"].includes(filterParam) ? filterParam : "all";

  const { data: anomalies, isLoading, error } = useAnomalies();

  // Apply filter based on URL param
  const filteredAnomalies = anomalies
    ? anomalies.filter((a) => {
        if (activeFilter === "cold") return a.avg_temp !== null && a.avg_temp <= 32;
        if (activeFilter === "heat") return a.avg_temp !== null && a.avg_temp >= 85;
        if (activeFilter === "rain") return a.total_precip !== null && a.total_precip >= 1;
        return true;
      })
    : [];

  const sortedAnomalies = [...filteredAnomalies].sort(
    (a, b) => (b.pct_over_median || 0) - (a.pct_over_median || 0)
  );

  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Anomalies</h1>
        <p className="page-subtitle mt-1">
          Buildings with energy consumption significantly above baseline
        </p>
      </div>

      {/* Active Filter Badge */}
      {activeFilter !== "all" && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {filterLabels[activeFilter]}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-primary/20 rounded-full"
              onClick={clearFilter}
            >
              <X className="h-3 w-3" />
            </Button>
          </span>
        </div>
      )}

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
              <p className="text-sm text-muted-foreground">
                {activeFilter === "all" ? "Total Anomalies" : "Matching Anomalies"}
              </p>
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
                  sortedAnomalies.reduce((acc, a) => acc + (a.pct_over_median || 0), 0) /
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
          <p className="text-muted-foreground">
            {activeFilter !== "all"
              ? `No anomalies match the "${filterLabels[activeFilter]}" filter.`
              : "No anomalies detected."}
          </p>
          {activeFilter !== "all" && (
            <Button variant="link" onClick={clearFilter} className="mt-2">
              Clear filter to see all anomalies
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

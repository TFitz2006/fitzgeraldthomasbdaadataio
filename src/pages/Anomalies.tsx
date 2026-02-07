import { useSearchParams } from "react-router-dom";
import { Loader2, X, AlertTriangle, Thermometer, HelpCircle, Flame, Snowflake } from "lucide-react";
import { AnomaliesTable } from "@/components/AnomaliesTable";
import { useAnomalies } from "@/hooks/useDatabricks";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "cold" | "heat" | "rain" | "unexplained" | "high" | "medium" | "low";

const filterConfig: Record<FilterType, { label: string; icon: React.ReactNode; group: "weather" | "severity" }> = {
  all: { label: "All", icon: null, group: "weather" },
  cold: { label: "Cold Snap (≤32°F)", icon: <Snowflake className="w-3.5 h-3.5" />, group: "weather" },
  heat: { label: "Heat Wave (≥85°F)", icon: <Flame className="w-3.5 h-3.5" />, group: "weather" },
  rain: { label: "Heavy Rain", icon: <Thermometer className="w-3.5 h-3.5" />, group: "weather" },
  unexplained: { label: "Unexplained", icon: <HelpCircle className="w-3.5 h-3.5" />, group: "weather" },
  high: { label: "High (≥150%)", icon: <AlertTriangle className="w-3.5 h-3.5" />, group: "severity" },
  medium: { label: "Medium (100-150%)", icon: null, group: "severity" },
  low: { label: "Low (<100%)", icon: null, group: "severity" },
};

export default function Anomalies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") as FilterType | null;
  const validFilters: FilterType[] = ["cold", "heat", "rain", "unexplained", "high", "medium", "low"];
  const activeFilter: FilterType = filterParam && validFilters.includes(filterParam) ? filterParam : "all";

  const { data: anomalies, isLoading, error } = useAnomalies();

  // Apply filter based on URL param
  const filteredAnomalies = anomalies
    ? anomalies.filter((a) => {
        const temp = a.avg_temp;
        const precip = a.total_precip;
        const pct = a.pct_over_median || 0;

        switch (activeFilter) {
          case "cold":
            return temp !== null && temp <= 32;
          case "heat":
            return temp !== null && temp >= 85;
          case "rain":
            return precip !== null && precip >= 1;
          case "unexplained":
            // Normal weather: temp between 32-85°F AND precip < 1 inch
            return (
              (temp === null || (temp > 32 && temp < 85)) &&
              (precip === null || precip < 1)
            );
          case "high":
            return pct >= 150;
          case "medium":
            return pct >= 100 && pct < 150;
          case "low":
            return pct < 100;
          default:
            return true;
        }
      })
    : [];

  const sortedAnomalies = [...filteredAnomalies].sort(
    (a, b) => (b.pct_over_median || 0) - (a.pct_over_median || 0)
  );

  const setFilter = (filter: FilterType) => {
    if (filter === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ filter });
    }
  };

  const clearFilter = () => {
    setSearchParams({});
  };

  // Calculate counts for filter badges
  const filterCounts = anomalies
    ? {
        all: anomalies.length,
        cold: anomalies.filter((a) => a.avg_temp !== null && a.avg_temp <= 32).length,
        heat: anomalies.filter((a) => a.avg_temp !== null && a.avg_temp >= 85).length,
        rain: anomalies.filter((a) => a.total_precip !== null && a.total_precip >= 1).length,
        unexplained: anomalies.filter(
          (a) =>
            (a.avg_temp === null || (a.avg_temp > 32 && a.avg_temp < 85)) &&
            (a.total_precip === null || a.total_precip < 1)
        ).length,
        high: anomalies.filter((a) => (a.pct_over_median || 0) >= 150).length,
        medium: anomalies.filter((a) => {
          const pct = a.pct_over_median || 0;
          return pct >= 100 && pct < 150;
        }).length,
        low: anomalies.filter((a) => (a.pct_over_median || 0) < 100).length,
      }
    : null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Anomalies</h1>
        <p className="page-subtitle mt-1">
          Buildings with energy consumption significantly above baseline
        </p>
      </div>

      {/* Filter Bar */}
      {!isLoading && anomalies && anomalies.length > 0 && (
        <div className="mb-6 space-y-3">
          {/* Weather Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">
              Weather:
            </span>
            {(["all", "cold", "heat", "unexplained"] as FilterType[]).map((filter) => {
              const config = filterConfig[filter];
              const count = filterCounts?.[filter] || 0;
              const isActive = activeFilter === filter;

              // Special color for cold filter - keep it blue
              const coldColors = filter === "cold" 
                ? isActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600" 
                  : "border-blue-400 text-blue-600 hover:bg-blue-50"
                : "";

              return (
                <Button
                  key={filter}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs gap-1.5 ${coldColors} ${
                    isActive && filter !== "cold" ? "" : filter !== "cold" ? "hover:bg-muted" : ""
                  }`}
                  onClick={() => setFilter(filter)}
                >
                  {config.icon}
                  {config.label}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive
                        ? filter === "cold" ? "bg-white/20 text-white" : "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Severity Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">
              Severity:
            </span>
            {(["high", "medium", "low"] as FilterType[]).map((filter) => {
              const config = filterConfig[filter];
              const count = filterCounts?.[filter] || 0;
              const isActive = activeFilter === filter;

              const severityColors = {
                high: isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "border-destructive/50 text-destructive hover:bg-destructive/10",
                medium: isActive ? "bg-chart-weather text-white hover:bg-chart-weather/90" : "border-chart-weather/50 text-chart-weather hover:bg-chart-weather/10",
                low: isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "",
              };

              return (
                <Button
                  key={filter}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs gap-1.5 ${severityColors[filter] || ""}`}
                  onClick={() => setFilter(filter)}
                >
                  {config.icon}
                  {config.label}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive
                        ? "bg-white/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filter Description */}
      {activeFilter === "unexplained" && (
        <div className="mb-6 p-3 bg-chart-weather/10 border border-chart-weather/20 rounded-lg">
          <p className="text-sm text-foreground flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-chart-weather" />
            <span>
              <strong>Unexplained anomalies</strong> occurred during normal weather (32-85°F, no heavy rain). 
              These likely indicate equipment issues, scheduling problems, or unusual occupancy.
            </span>
          </p>
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
              ? `No anomalies match the "${filterConfig[activeFilter].label}" filter.`
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

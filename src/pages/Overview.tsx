import { Zap, Building2, CloudSun, Gauge, Loader2 } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { TopBuildingsChart } from "@/components/charts/TopBuildingsChart";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { useKPIs, useTop10Kwh, useTop10Intensity, useAnomalies } from "@/hooks/useDatabricks";

export default function Overview() {
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useKPIs();
  const { data: top10Kwh, isLoading: kwhLoading } = useTop10Kwh();
  const { data: top10Intensity, isLoading: intensityLoading } = useTop10Intensity();
  const { data: anomalies, isLoading: anomaliesLoading } = useAnomalies();

  const isLoading = kpisLoading || kwhLoading || intensityLoading || anomaliesLoading;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle mt-1">
          Campus-wide energy consumption metrics and top buildings
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading data from Databricks...</span>
        </div>
      )}

      {/* Error State */}
      {kpisError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            Failed to load data: {kpisError.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Check your Databricks connection and ensure the views exist.
          </p>
        </div>
      )}

      {/* Executive Summary - Key Findings */}
      {!isLoading && kpis && (
        <ExecutiveSummary kpis={kpis} top10Kwh={top10Kwh} anomalies={anomalies} />
      )}
      {!isLoading && kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Energy Consumption"
            value={kpis.total_kwh}
            icon={Zap}
            suffix="kWh"
          />
          <KPICard
            title="Buildings Monitored"
            value={kpis.n_buildings}
            icon={Building2}
          />
          <KPICard
            title="Weather Data Coverage"
            value={kpis.pct_with_weather}
            icon={CloudSun}
            suffix="%"
          />
          <KPICard
            title="Avg Energy Intensity"
            value={typeof kpis.avg_intensity === 'number' ? kpis.avg_intensity.toFixed(1) : kpis.avg_intensity}
            icon={Gauge}
            suffix="kWh/sqft"
          />
        </div>
      )}

      {/* Charts */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {top10Kwh && top10Kwh.length > 0 && (
            <TopBuildingsChart
              data={top10Kwh}
              dataKey="total_kwh"
              title="Top 10 Buildings by Total Energy (kWh)"
              color="hsl(var(--chart-energy))"
              yAxisLabel="Total Energy"
            />
          )}
          {top10Intensity && top10Intensity.length > 0 && (
            <TopBuildingsChart
              data={top10Intensity}
              dataKey="avg_intensity"
              title="Top 10 Buildings by Energy Intensity (kWh/sqft)"
              color="hsl(var(--chart-intensity))"
              yAxisLabel="Avg Intensity"
            />
          )}
        </div>
      )}
    </div>
  );
}

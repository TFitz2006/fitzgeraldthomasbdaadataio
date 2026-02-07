import { Zap, Building2, CloudSun, Loader2, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { TopBuildingsChart } from "@/components/charts/TopBuildingsChart";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { useKPIs, useTop10Kwh, useAnomalies } from "@/hooks/useDatabricks";
import { Button } from "@/components/ui/button";

export default function Overview() {
  const navigate = useNavigate();
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useKPIs();
  const { data: top10Kwh, isLoading: kwhLoading } = useTop10Kwh();
  const { data: anomalies, isLoading: anomaliesLoading } = useAnomalies();

  const isLoading = kpisLoading || kwhLoading || anomaliesLoading;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Campus Electricity Dashboard
            </h1>
            <p className="text-muted-foreground mt-0.5">
              Real-time energy consumption analysis across all monitored buildings
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading data from Databricks...</p>
          </div>
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

      {!isLoading && kpis && (
        <>
          {/* Section 1: At a Glance - KPIs */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                At a Glance
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                title="Total Consumption"
                value={kpis.total_kwh}
                icon={Zap}
                suffix="kWh"
                description="All buildings combined"
              />
              <KPICard
                title="Buildings Monitored"
                value={kpis.n_buildings}
                icon={Building2}
                description="Active meters"
              />
              <KPICard
                title="Weather Coverage"
                value={kpis.pct_with_weather}
                icon={CloudSun}
                suffix="%"
                description="Readings with weather data"
              />
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* Section 2: Key Findings */}
          <section className="mb-10">
            <ExecutiveSummary kpis={kpis} top10Kwh={top10Kwh} anomalies={anomalies} />
          </section>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* Section 3: Top Consumers */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Top Energy Consumers
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-1"
                onClick={() => navigate("/deep-dive")}
              >
                Explore all buildings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div>
              {top10Kwh && top10Kwh.length > 0 && (
                <TopBuildingsChart
                  data={top10Kwh}
                  dataKey="total_kwh"
                  title="By Total Energy (kWh)"
                  color="hsl(var(--chart-energy))"
                  yAxisLabel="Total Energy"
                />
              )}
            </div>
          </section>

          {/* Quick Actions Footer */}
          <section className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/insights")}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                View Analytics Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/anomalies")}
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                View Anomalies ({anomalies?.length || 0})
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

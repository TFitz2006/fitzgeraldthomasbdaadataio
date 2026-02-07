import { useNavigate } from "react-router-dom";
import {
  Thermometer,
  TrendingUp,
  AlertTriangle,
  Zap,
  Building2,
} from "lucide-react";
import { InsightCard } from "./InsightCard";
import type { KPIs, BuildingKwh, Anomaly } from "@/lib/mockData";

interface ExecutiveSummaryProps {
  kpis: KPIs | undefined;
  top10Kwh: BuildingKwh[] | undefined;
  anomalies: Anomaly[] | undefined;
}

export function ExecutiveSummary({
  kpis,
  top10Kwh,
  anomalies,
}: ExecutiveSummaryProps) {
  const navigate = useNavigate();

  // Derive insights from available data
  const topConsumer = top10Kwh?.[0];
  const topAnomaly = anomalies?.[0];
  const coldSnapAnomalies = anomalies?.filter(
    (a) => a.avg_temp !== null && a.avg_temp <= 32
  );
  const hasOutlier =
    top10Kwh &&
    top10Kwh.length >= 2 &&
    top10Kwh[0].total_kwh > 2 * top10Kwh[1].total_kwh;

  if (!kpis) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Key Findings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top Consumer Insight */}
        {topConsumer && hasOutlier && (
          <InsightCard
            title="Consumption Outlier"
            insight={`${topConsumer.building_name} uses ${(
              (topConsumer.total_kwh / (top10Kwh[1]?.total_kwh || 1)) 
            ).toFixed(1)}x more electricity than the next highest building. Consider an energy audit.`}
            value={`${(topConsumer.total_kwh / 1000).toFixed(0)}k kWh`}
            icon={Building2}
            variant="warning"
            action={{
              label: "View building",
              onClick: () =>
                navigate(`/deep-dive?building=${topConsumer.building_id}`),
            }}
          />
        )}

        {/* Weather Correlation Insight */}
        {kpis.pct_with_weather >= 80 && (
          <InsightCard
            title="Weather Data Coverage"
            insight={`${kpis.pct_with_weather.toFixed(0)}% of readings have weather data. This enables temperature-energy correlation analysis for most buildings.`}
            value={`${kpis.pct_with_weather.toFixed(0)}%`}
            icon={Thermometer}
            variant="success"
            action={{
              label: "Explore insights",
              onClick: () => navigate("/insights"),
            }}
          />
        )}

        {/* Cold Snap Alert */}
        {coldSnapAnomalies && coldSnapAnomalies.length > 0 && (
          <InsightCard
            title="Cold Weather Spikes"
            insight={`${coldSnapAnomalies.length} anomaly events occurred during cold snaps (≤32°F). Heating systems are driving excess consumption.`}
            value={`${coldSnapAnomalies.length} events`}
            icon={AlertTriangle}
            variant="warning"
            action={{
              label: "View anomalies",
              onClick: () => navigate("/anomalies"),
            }}
          />
        )}

        {/* Top Anomaly */}
        {topAnomaly && (
          <InsightCard
            title="Highest Deviation"
            insight={`${topAnomaly.building_name} showed +${topAnomaly.pct_over_median?.toFixed(
              0
            )}% above baseline on ${topAnomaly.day}. Investigate equipment or occupancy changes.`}
            value={`+${topAnomaly.pct_over_median?.toFixed(0)}%`}
            icon={TrendingUp}
            variant="info"
            action={{
              label: "View details",
              onClick: () =>
                navigate(`/deep-dive?building=${topAnomaly.building_id}`),
            }}
          />
        )}

        {/* Efficiency Opportunity */}
        {kpis.avg_intensity > 15 && (
          <InsightCard
            title="Efficiency Opportunity"
            insight={`Average campus intensity is ${kpis.avg_intensity.toFixed(
              1
            )} kWh/sqft. Buildings above this threshold are candidates for efficiency improvements.`}
            value={`${kpis.avg_intensity.toFixed(1)} kWh/sqft`}
            icon={Zap}
            variant="default"
          />
        )}
      </div>
    </div>
  );
}

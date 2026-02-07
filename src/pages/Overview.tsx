import { Zap, Building2, CloudSun, Gauge } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { TopBuildingsChart } from "@/components/charts/TopBuildingsChart";
import { mockKPIs, mockTop10Kwh, mockTop10Intensity } from "@/lib/mockData";

export default function Overview() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle mt-1">
          Campus-wide energy consumption metrics and top buildings
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Total Energy Consumption"
          value={mockKPIs.total_kwh}
          icon={Zap}
          suffix="kWh"
        />
        <KPICard
          title="Buildings Monitored"
          value={mockKPIs.n_buildings}
          icon={Building2}
        />
        <KPICard
          title="Weather Data Coverage"
          value={mockKPIs.pct_with_weather}
          icon={CloudSun}
          suffix="%"
        />
        <KPICard
          title="Avg Energy Intensity"
          value={mockKPIs.avg_intensity.toFixed(1)}
          icon={Gauge}
          suffix="kWh/sqft"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopBuildingsChart
          data={mockTop10Kwh}
          dataKey="total_kwh"
          title="Top 10 Buildings by Total Energy (kWh)"
          color="hsl(var(--chart-energy))"
          yAxisLabel="Total Energy"
        />
        <TopBuildingsChart
          data={mockTop10Intensity}
          dataKey="avg_intensity"
          title="Top 10 Buildings by Energy Intensity (kWh/sqft)"
          color="hsl(var(--chart-intensity))"
          yAxisLabel="Avg Intensity"
        />
      </div>
    </div>
  );
}

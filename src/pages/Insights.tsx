import { useState } from "react";
import { Loader2, Brain, Thermometer, Clock, Building2 } from "lucide-react";
import { CorrelationScatter } from "@/components/charts/CorrelationScatter";
import { InsightCard } from "@/components/InsightCard";
import { BuildingSelector } from "@/components/BuildingSelector";
import {
  useBuildings,
  useHourlyTimeseries,
  useHourlyProfile,
  useAnomalies,
} from "@/hooks/useDatabricks";
import {
  calculateTempEnergyCorrelation,
  interpretCorrelation,
  calculateBaseload,
} from "@/lib/analytics";

export default function Insights() {
  const { data: buildings, isLoading: buildingsLoading } = useBuildings();
  const { data: anomalies } = useAnomalies();

  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  // Set default building when loaded
  const firstBuilding = buildings?.[0];
  const activeBuildingId = selectedBuildingId || String(firstBuilding?.building_id || "");

  const { data: timeseriesData, isLoading: timeseriesLoading } =
    useHourlyTimeseries(activeBuildingId);
  const { data: hourlyProfile, isLoading: profileLoading } =
    useHourlyProfile(activeBuildingId);

  const selectedBuilding = buildings?.find(
    (b) => String(b.building_id) === activeBuildingId
  );

  const correlation = timeseriesData
    ? calculateTempEnergyCorrelation(timeseriesData)
    : null;
  const correlationInterpretation = correlation
    ? interpretCorrelation(correlation.r)
    : null;
  const baseload = hourlyProfile ? calculateBaseload(hourlyProfile) : null;

  // Aggregate insights across all anomalies
  const coldSnapCount =
    anomalies?.filter((a) => a.avg_temp !== null && a.avg_temp <= 32).length || 0;
  const heatWaveCount =
    anomalies?.filter((a) => a.avg_temp !== null && a.avg_temp >= 85).length || 0;

  const isLoading = buildingsLoading || timeseriesLoading || profileLoading;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Analytics Insights
        </h1>
        <p className="page-subtitle mt-1">
          Temperature-energy correlation, baseload analysis, and actionable recommendations
        </p>
      </div>

      {/* Building Selector */}
      {!buildingsLoading && buildings && buildings.length > 0 && (
        <div className="mb-6">
          <BuildingSelector
            buildings={buildings}
            selectedBuildingId={activeBuildingId}
            onSelect={setSelectedBuildingId}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Analyzing building data...
          </span>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && selectedBuilding && (
        <>
          {/* Campus-Wide Insights */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Campus-Wide Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InsightCard
                title="Cold Snap Events"
                insight={`${coldSnapCount} anomalies occurred during freezing temperatures (≤32°F), indicating heating-driven consumption spikes.`}
                value={`${coldSnapCount}`}
                icon={Thermometer}
                variant={coldSnapCount > 3 ? "warning" : "default"}
              />
              <InsightCard
                title="Heat Wave Events"
                insight={`${heatWaveCount} anomalies during extreme heat (≥85°F), showing cooling system demand spikes.`}
                value={`${heatWaveCount}`}
                icon={Thermometer}
                variant={heatWaveCount > 3 ? "warning" : "default"}
              />
              <InsightCard
                title="Buildings Analyzed"
                insight="All buildings with weather data can be analyzed for temperature sensitivity."
                value={`${buildings?.length || 0}`}
                icon={Building2}
                variant="info"
              />
            </div>
          </div>

          {/* Building-Specific Analysis */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Building Analysis: {selectedBuilding.building_name}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Correlation Scatter */}
              {timeseriesData && timeseriesData.length > 0 ? (
                <CorrelationScatter
                  data={timeseriesData}
                  title="Temperature vs Energy Consumption"
                  buildingName={selectedBuilding.building_name}
                />
              ) : (
                <div className="chart-container flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground">
                    No timeseries data available
                  </p>
                </div>
              )}

              {/* Building Insights */}
              <div className="space-y-4">
                {/* Correlation Insight */}
                {correlationInterpretation && correlation && (
                  <InsightCard
                    title="Weather Sensitivity"
                    insight={correlationInterpretation.description}
                    value={`r = ${correlation.r.toFixed(2)}`}
                    icon={Thermometer}
                    variant={
                      correlationInterpretation.strength === "strong"
                        ? "warning"
                        : correlationInterpretation.strength === "moderate"
                        ? "info"
                        : "default"
                    }
                  />
                )}

                {/* Baseload Insight */}
                {baseload && baseload.peakKwh > 0 && (
                  <InsightCard
                    title="Baseload Analysis"
                    insight={`Minimum consumption is ${baseload.baseloadKwh.toFixed(
                      0
                    )} kWh (${(baseload.ratio * 100).toFixed(
                      0
                    )}% of peak). Peak demand occurs at ${baseload.peakHour}:00.`}
                    value={`${baseload.baseloadKwh.toFixed(0)} kWh`}
                    icon={Clock}
                    variant={baseload.ratio > 0.5 ? "warning" : "success"}
                  />
                )}

                {/* Recommendation */}
                {correlation && baseload && (
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      💡 Recommendation
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {correlationInterpretation?.strength === "strong" ? (
                        <>
                          This building is highly weather-sensitive. Consider
                          upgrading HVAC controls or improving building envelope
                          insulation to reduce temperature-driven consumption.
                        </>
                      ) : baseload && baseload.ratio > 0.4 ? (
                        <>
                          High baseload ({(baseload.ratio * 100).toFixed(0)}% of
                          peak) suggests always-on equipment. Audit overnight
                          and weekend usage to identify unnecessary loads.
                        </>
                      ) : (
                        <>
                          This building has efficient load management. Focus on
                          peak shaving during hour {baseload?.peakHour}:00 for
                          demand charge reduction.
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

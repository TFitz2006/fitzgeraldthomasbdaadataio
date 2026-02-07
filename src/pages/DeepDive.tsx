import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BuildingSelector } from "@/components/BuildingSelector";
import { TimeseriesChart } from "@/components/charts/TimeseriesChart";
import { HourlyProfileChart } from "@/components/charts/HourlyProfileChart";
import { Heatmap } from "@/components/charts/Heatmap";
import { WeatherChart } from "@/components/charts/WeatherChart";
import {
  mockBuildings,
  generateHourlyTimeseries,
  generateHourlyProfile,
  generateHeatmapData,
} from "@/lib/mockData";

export default function DeepDive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const buildingFromUrl = searchParams.get("building");
  
  const [selectedBuildingId, setSelectedBuildingId] = useState(
    buildingFromUrl || mockBuildings[0]?.building_id || ""
  );

  useEffect(() => {
    if (buildingFromUrl && buildingFromUrl !== selectedBuildingId) {
      setSelectedBuildingId(buildingFromUrl);
    }
  }, [buildingFromUrl]);

  const handleBuildingSelect = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSearchParams({ building: buildingId });
  };

  const selectedBuilding = mockBuildings.find(
    (b) => b.building_id === selectedBuildingId
  );

  // Generate data for selected building
  const timeseriesData = useMemo(
    () => generateHourlyTimeseries(selectedBuildingId),
    [selectedBuildingId]
  );

  const hourlyProfile = useMemo(
    () => generateHourlyProfile(selectedBuildingId),
    [selectedBuildingId]
  );

  const heatmapData = useMemo(
    () => generateHeatmapData(selectedBuildingId),
    [selectedBuildingId]
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Building Deep Dive</h1>
        <p className="page-subtitle mt-1">
          Detailed energy analysis for individual buildings
        </p>
      </div>

      {/* Building Selector */}
      <div className="mb-6">
        <BuildingSelector
          buildings={mockBuildings}
          selectedBuildingId={selectedBuildingId}
          onSelect={handleBuildingSelect}
        />
      </div>

      {/* Selected Building Info */}
      {selectedBuilding && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm">
            <span className="font-medium text-foreground">
              {selectedBuilding.building_name}
            </span>
            <span className="text-muted-foreground ml-2">
              • {selectedBuilding.campusname}
            </span>
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TimeseriesChart
          data={timeseriesData}
          title="Energy Consumption Over Time (kWh)"
        />
        <HourlyProfileChart
          data={hourlyProfile}
          title="Average Hourly Energy Profile (kWh)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Heatmap data={heatmapData} title="Energy Heatmap by Day & Hour" />
        <WeatherChart
          data={timeseriesData}
          title="Temperature Over Time (°F)"
        />
      </div>
    </div>
  );
}

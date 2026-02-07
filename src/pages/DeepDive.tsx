import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { BuildingSelector } from "@/components/BuildingSelector";
import { TimeseriesChart } from "@/components/charts/TimeseriesChart";
import { HourlyProfileChart } from "@/components/charts/HourlyProfileChart";
import { Heatmap } from "@/components/charts/Heatmap";
import { WeatherChart } from "@/components/charts/WeatherChart";
import {
  useBuildings,
  useHourlyTimeseries,
  useHourlyProfile,
  useHeatmapData,
} from "@/hooks/useDatabricks";

export default function DeepDive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const buildingFromUrl = searchParams.get("building");
  
  const { data: buildings, isLoading: buildingsLoading } = useBuildings();
  
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildingFromUrl || "");

  // Set default building when buildings load
  useEffect(() => {
    if (buildings && buildings.length > 0 && !selectedBuildingId) {
      const defaultId = buildingFromUrl || buildings[0].building_id;
      setSelectedBuildingId(defaultId);
    }
  }, [buildings, buildingFromUrl, selectedBuildingId]);

  // Update from URL changes
  useEffect(() => {
    if (buildingFromUrl && buildingFromUrl !== selectedBuildingId) {
      setSelectedBuildingId(buildingFromUrl);
    }
  }, [buildingFromUrl]);

  const handleBuildingSelect = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSearchParams({ building: buildingId });
  };

  const selectedBuilding = buildings?.find(
    (b) => b.building_id === selectedBuildingId
  );

  // Fetch building-specific data
  const { data: timeseriesData, isLoading: timeseriesLoading } = useHourlyTimeseries(selectedBuildingId);
  const { data: hourlyProfile, isLoading: profileLoading } = useHourlyProfile(selectedBuildingId);
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData(selectedBuildingId);

  const isChartsLoading = timeseriesLoading || profileLoading || heatmapLoading;

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
      {buildingsLoading ? (
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading buildings...</span>
        </div>
      ) : buildings && buildings.length > 0 ? (
        <div className="mb-6">
          <BuildingSelector
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            onSelect={handleBuildingSelect}
          />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">No buildings found.</p>
        </div>
      )}

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

      {/* Loading State */}
      {isChartsLoading && selectedBuildingId && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading building data...</span>
        </div>
      )}

      {/* Charts Grid */}
      {!isChartsLoading && selectedBuildingId && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {timeseriesData && timeseriesData.length > 0 ? (
              <TimeseriesChart
                data={timeseriesData}
                title="Energy Consumption Over Time (kWh)"
              />
            ) : (
              <div className="chart-container flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No timeseries data available</p>
              </div>
            )}
            
            {hourlyProfile && hourlyProfile.length > 0 ? (
              <HourlyProfileChart
                data={hourlyProfile}
                title="Average Hourly Energy Profile (kWh)"
              />
            ) : (
              <div className="chart-container flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No hourly profile data available</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {heatmapData && heatmapData.length > 0 ? (
              <Heatmap data={heatmapData} title="Energy Heatmap by Day & Hour" />
            ) : (
              <div className="chart-container flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No heatmap data available</p>
              </div>
            )}
            
            {timeseriesData && timeseriesData.some(d => d.temp !== undefined) ? (
              <WeatherChart
                data={timeseriesData}
                title="Temperature Over Time (°F)"
              />
            ) : (
              <div className="chart-container flex items-center justify-center h-[250px]">
                <p className="text-muted-foreground">No weather data available</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

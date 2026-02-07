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
import {
  isExcludedBuilding,
  isExcludedBuildingId,
} from "@/lib/buildingExclusions";

export default function DeepDive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const buildingFromUrl = searchParams.get("building");
  const buildingFromUrlSafe =
    buildingFromUrl && !isExcludedBuildingId(buildingFromUrl)
      ? buildingFromUrl
      : null;

  const { data: buildings, isLoading: buildingsLoading } = useBuildings();

  const [selectedBuildingId, setSelectedBuildingId] = useState(
    buildingFromUrlSafe || ""
  );

  // Set default building when buildings load (skip excluded buildings)
  useEffect(() => {
    if (!buildings || buildings.length === 0) return;

    const firstValid = buildings.find((b) => !isExcludedBuilding(b));
    if (!firstValid) return;

    const selectedIsExcluded =
      !!selectedBuildingId && isExcludedBuildingId(selectedBuildingId);

    if ((!selectedBuildingId && !buildingFromUrlSafe) || selectedIsExcluded) {
      const defaultId = String(firstValid.building_id);
      setSelectedBuildingId(defaultId);
      if (buildingFromUrl !== defaultId) {
        setSearchParams({ building: defaultId });
      }
    }
  }, [buildings, buildingFromUrl, buildingFromUrlSafe, selectedBuildingId, setSearchParams]);

  // Update from URL changes (ignore excluded IDs)
  useEffect(() => {
    if (buildingFromUrlSafe && buildingFromUrlSafe !== selectedBuildingId) {
      setSelectedBuildingId(buildingFromUrlSafe);
    }
  }, [buildingFromUrlSafe, selectedBuildingId]);

  const handleBuildingSelect = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSearchParams({ building: buildingId });
  };

  const selectedBuilding = buildings?.find(
    (b) => String(b.building_id) === String(selectedBuildingId)
  );

  // Fetch building-specific data
  const { data: timeseriesData, isLoading: timeseriesLoading } = useHourlyTimeseries(selectedBuildingId);
  const { data: hourlyProfile, isLoading: profileLoading } = useHourlyProfile(selectedBuildingId);
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData(selectedBuildingId);

  const isChartsLoading = timeseriesLoading || profileLoading || heatmapLoading;

  // Check if timeseries has any weather data (temp not null/undefined)
  const hasWeatherData = timeseriesData && timeseriesData.some(d => d.temp !== undefined && d.temp !== null);

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
            
            {hasWeatherData ? (
              <WeatherChart
                data={timeseriesData!}
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

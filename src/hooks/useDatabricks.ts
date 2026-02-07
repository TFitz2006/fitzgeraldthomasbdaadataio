import { useQuery } from "@tanstack/react-query";
import {
  fetchKPIs,
  fetchTop10Kwh,
  fetchTop10Intensity,
  fetchBuildings,
  fetchHourlyTimeseries,
  fetchHourlyProfile,
  fetchHeatmapData,
  fetchAnomalies,
} from "@/lib/databricks";

export function useKPIs() {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: fetchKPIs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTop10Kwh() {
  return useQuery({
    queryKey: ['top10Kwh'],
    queryFn: fetchTop10Kwh,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTop10Intensity() {
  return useQuery({
    queryKey: ['top10Intensity'],
    queryFn: fetchTop10Intensity,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBuildings() {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
    staleTime: 10 * 60 * 1000, // 10 minutes - buildings don't change often
  });
}

export function useHourlyTimeseries(buildingId: string) {
  return useQuery({
    queryKey: ['hourlyTimeseries', buildingId],
    queryFn: () => fetchHourlyTimeseries(buildingId),
    enabled: !!buildingId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHourlyProfile(buildingId: string) {
  return useQuery({
    queryKey: ['hourlyProfile', buildingId],
    queryFn: () => fetchHourlyProfile(buildingId),
    enabled: !!buildingId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeatmapData(buildingId: string) {
  return useQuery({
    queryKey: ['heatmapData', buildingId],
    queryFn: () => fetchHeatmapData(buildingId),
    enabled: !!buildingId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnomalies() {
  return useQuery({
    queryKey: ['anomalies'],
    queryFn: fetchAnomalies,
    staleTime: 5 * 60 * 1000,
  });
}

import { supabase } from "@/integrations/supabase/client";
import type {
  KPIs,
  BuildingKwh,
  BuildingIntensity,
  Building,
  HourlyTimeseries,
  HourlyProfile,
  HeatmapData,
  Anomaly,
} from "./mockData";

// Databricks catalog.schema prefix
const SCHEMA = "workspace.hackathon";

async function queryDatabricks<T>(query: string, params?: unknown[]): Promise<T[]> {
  const { data, error } = await supabase.functions.invoke('databricks-query', {
    body: { query, params },
  });

  if (error) {
    console.error('Databricks query error:', error);
    throw new Error(error.message || 'Failed to query Databricks');
  }

  if (!data.success) {
    throw new Error(data.error || 'Query failed');
  }

  return data.data as T[];
}

export async function fetchKPIs(): Promise<KPIs> {
  const result = await queryDatabricks<KPIs>(
    `SELECT total_kwh, n_buildings, pct_with_weather, avg_intensity FROM ${SCHEMA}.ui_kpis LIMIT 1`
  );
  return result[0];
}

export async function fetchTop10Kwh(): Promise<BuildingKwh[]> {
  return queryDatabricks<BuildingKwh>(
    `SELECT building_id, building_name, total_kwh FROM ${SCHEMA}.ui_top10_total_kwh ORDER BY total_kwh DESC LIMIT 10`
  );
}

export async function fetchTop10Intensity(): Promise<BuildingIntensity[]> {
  return queryDatabricks<BuildingIntensity>(
    `SELECT building_id, building_name, avg_intensity FROM ${SCHEMA}.ui_top10_intensity ORDER BY avg_intensity DESC LIMIT 10`
  );
}

export async function fetchBuildings(): Promise<Building[]> {
  return queryDatabricks<Building>(
    `SELECT building_id, building_name, campusname FROM ${SCHEMA}.ui_buildings ORDER BY building_name`
  );
}

export async function fetchHourlyTimeseries(buildingId: string): Promise<HourlyTimeseries[]> {
  return queryDatabricks<HourlyTimeseries>(
    `SELECT timestamp_hour, building_id, energy_kwh, temp FROM ${SCHEMA}.ui_hourly_timeseries WHERE building_id = '${buildingId}' ORDER BY timestamp_hour`
  );
}

export async function fetchHourlyProfile(buildingId: string): Promise<HourlyProfile[]> {
  return queryDatabricks<HourlyProfile>(
    `SELECT building_id, hour, avg_kwh FROM ${SCHEMA}.ui_building_hourly_profile WHERE building_id = '${buildingId}' ORDER BY hour`
  );
}

export async function fetchHeatmapData(buildingId: string): Promise<HeatmapData[]> {
  return queryDatabricks<HeatmapData>(
    `SELECT building_id, day_of_week, hour, avg_kwh FROM ${SCHEMA}.ui_building_heatmap WHERE building_id = '${buildingId}'`
  );
}

export async function fetchAnomalies(): Promise<Anomaly[]> {
  return queryDatabricks<Anomaly>(
    `SELECT day, building_id, building_name, campusname, pct_over_median, daily_kwh, baseline_median_daily_kwh, avg_temp, total_precip FROM ${SCHEMA}.ui_top_anomalies ORDER BY pct_over_median DESC`
  );
}

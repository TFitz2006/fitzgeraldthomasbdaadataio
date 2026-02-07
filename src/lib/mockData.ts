// Mock data matching Databricks SQL view schemas
// Replace with actual API calls when connecting to Databricks

export interface KPIs {
  total_kwh: number;
  n_buildings: number;
  pct_with_weather: number;
  avg_intensity: number;
}

export interface BuildingKwh {
  building_id: string;
  building_name: string;
  total_kwh: number;
}

export interface BuildingIntensity {
  building_id: string;
  building_name: string;
  avg_intensity: number;
}

export interface Building {
  building_id: string;
  building_name: string;
  campusname: string;
}

export interface HourlyTimeseries {
  timestamp_hour: string;
  building_id: string;
  energy_kwh: number;
  temp?: number;
}

export interface HourlyProfile {
  building_id: string;
  hour: number;
  avg_kwh: number;
}

export interface HeatmapData {
  building_id: string;
  day_of_week: number;
  hour: number;
  avg_kwh: number;
}

export interface Anomaly {
  day: string;
  building_id: string;
  building_name: string;
  campusname: string;
  pct_over_median: number;
  daily_kwh: number;
  baseline_median_daily_kwh: number;
  avg_temp: number;
  total_precip: number;
}

// Mock data
export const mockKPIs: KPIs = {
  total_kwh: 2847592,
  n_buildings: 156,
  pct_with_weather: 87.3,
  avg_intensity: 18.4,
};

export const mockTop10Kwh: BuildingKwh[] = [
  { building_id: "B001", building_name: "Science Center", total_kwh: 245000 },
  { building_id: "B002", building_name: "Main Library", total_kwh: 198000 },
  { building_id: "B003", building_name: "Engineering Hall", total_kwh: 187000 },
  { building_id: "B004", building_name: "Medical Research", total_kwh: 176000 },
  { building_id: "B005", building_name: "Student Union", total_kwh: 165000 },
  { building_id: "B006", building_name: "Admin Building", total_kwh: 143000 },
  { building_id: "B007", building_name: "Chemistry Lab", total_kwh: 132000 },
  { building_id: "B008", building_name: "Physics Tower", total_kwh: 121000 },
  { building_id: "B009", building_name: "Arts Center", total_kwh: 98000 },
  { building_id: "B010", building_name: "Dorm Complex A", total_kwh: 87000 },
];

export const mockTop10Intensity: BuildingIntensity[] = [
  { building_id: "B007", building_name: "Chemistry Lab", avg_intensity: 42.5 },
  { building_id: "B004", building_name: "Medical Research", avg_intensity: 38.2 },
  { building_id: "B001", building_name: "Science Center", avg_intensity: 35.8 },
  { building_id: "B008", building_name: "Physics Tower", avg_intensity: 31.4 },
  { building_id: "B003", building_name: "Engineering Hall", avg_intensity: 28.9 },
  { building_id: "B002", building_name: "Main Library", avg_intensity: 24.6 },
  { building_id: "B006", building_name: "Admin Building", avg_intensity: 21.3 },
  { building_id: "B005", building_name: "Student Union", avg_intensity: 19.8 },
  { building_id: "B009", building_name: "Arts Center", avg_intensity: 16.2 },
  { building_id: "B010", building_name: "Dorm Complex A", avg_intensity: 12.7 },
];

export const mockBuildings: Building[] = [
  { building_id: "B001", building_name: "Science Center", campusname: "Main Campus" },
  { building_id: "B002", building_name: "Main Library", campusname: "Main Campus" },
  { building_id: "B003", building_name: "Engineering Hall", campusname: "Tech Campus" },
  { building_id: "B004", building_name: "Medical Research", campusname: "Health Campus" },
  { building_id: "B005", building_name: "Student Union", campusname: "Main Campus" },
  { building_id: "B006", building_name: "Admin Building", campusname: "Main Campus" },
  { building_id: "B007", building_name: "Chemistry Lab", campusname: "Tech Campus" },
  { building_id: "B008", building_name: "Physics Tower", campusname: "Tech Campus" },
  { building_id: "B009", building_name: "Arts Center", campusname: "Arts Campus" },
  { building_id: "B010", building_name: "Dorm Complex A", campusname: "Residential" },
];

// Generate hourly timeseries data for the past 7 days
export const generateHourlyTimeseries = (buildingId: string): HourlyTimeseries[] => {
  const data: HourlyTimeseries[] = [];
  const now = new Date();
  
  for (let d = 6; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(h, 0, 0, 0);
      
      const baseKwh = 80 + Math.random() * 40;
      const hourFactor = h >= 8 && h <= 18 ? 1.5 : 0.7;
      const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.6 : 1;
      
      data.push({
        timestamp_hour: date.toISOString(),
        building_id: buildingId,
        energy_kwh: Math.round(baseKwh * hourFactor * weekendFactor),
        temp: 45 + Math.random() * 30 + (h >= 10 && h <= 16 ? 10 : 0),
      });
    }
  }
  
  return data;
};

export const generateHourlyProfile = (buildingId: string): HourlyProfile[] => {
  return Array.from({ length: 24 }, (_, hour) => {
    const baseKwh = 60;
    const peakHours = hour >= 9 && hour <= 17;
    const offHours = hour >= 22 || hour <= 5;
    
    let multiplier = 1;
    if (peakHours) multiplier = 2.2;
    else if (offHours) multiplier = 0.5;
    else multiplier = 1.3;
    
    return {
      building_id: buildingId,
      hour,
      avg_kwh: Math.round(baseKwh * multiplier + Math.random() * 20),
    };
  });
};

export const generateHeatmapData = (buildingId: string): HeatmapData[] => {
  const data: HeatmapData[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekend = day === 0 || day === 6;
      const isPeakHour = hour >= 9 && hour <= 17;
      const isNight = hour >= 22 || hour <= 5;
      
      let baseKwh = 50;
      if (isPeakHour && !isWeekend) baseKwh = 120;
      else if (isNight) baseKwh = 25;
      else if (isWeekend) baseKwh = 35;
      
      data.push({
        building_id: buildingId,
        day_of_week: day,
        hour,
        avg_kwh: Math.round(baseKwh + Math.random() * 30),
      });
    }
  }
  
  return data;
};

export const mockAnomalies: Anomaly[] = [
  { day: "2024-01-15", building_id: "B001", building_name: "Science Center", campusname: "Main Campus", pct_over_median: 245, daily_kwh: 12500, baseline_median_daily_kwh: 3620, avg_temp: 28, total_precip: 0 },
  { day: "2024-01-12", building_id: "B007", building_name: "Chemistry Lab", campusname: "Tech Campus", pct_over_median: 198, daily_kwh: 8900, baseline_median_daily_kwh: 2987, avg_temp: 32, total_precip: 0.2 },
  { day: "2024-01-18", building_id: "B004", building_name: "Medical Research", campusname: "Health Campus", pct_over_median: 167, daily_kwh: 15200, baseline_median_daily_kwh: 5692, avg_temp: 15, total_precip: 1.5 },
  { day: "2024-01-10", building_id: "B003", building_name: "Engineering Hall", campusname: "Tech Campus", pct_over_median: 145, daily_kwh: 9800, baseline_median_daily_kwh: 4000, avg_temp: 42, total_precip: 0 },
  { day: "2024-01-14", building_id: "B002", building_name: "Main Library", campusname: "Main Campus", pct_over_median: 132, daily_kwh: 7400, baseline_median_daily_kwh: 3190, avg_temp: 38, total_precip: 0.1 },
  { day: "2024-01-16", building_id: "B008", building_name: "Physics Tower", campusname: "Tech Campus", pct_over_median: 128, daily_kwh: 6200, baseline_median_daily_kwh: 2719, avg_temp: 25, total_precip: 0 },
  { day: "2024-01-11", building_id: "B005", building_name: "Student Union", campusname: "Main Campus", pct_over_median: 115, daily_kwh: 8100, baseline_median_daily_kwh: 3767, avg_temp: 48, total_precip: 0 },
  { day: "2024-01-17", building_id: "B006", building_name: "Admin Building", campusname: "Main Campus", pct_over_median: 108, daily_kwh: 5600, baseline_median_daily_kwh: 2692, avg_temp: 35, total_precip: 0.5 },
  { day: "2024-01-13", building_id: "B009", building_name: "Arts Center", campusname: "Arts Campus", pct_over_median: 95, daily_kwh: 4200, baseline_median_daily_kwh: 2154, avg_temp: 52, total_precip: 0 },
  { day: "2024-01-19", building_id: "B010", building_name: "Dorm Complex A", campusname: "Residential", pct_over_median: 87, daily_kwh: 3800, baseline_median_daily_kwh: 2032, avg_temp: 20, total_precip: 2.1 },
];

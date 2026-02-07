import type { HourlyTimeseries, Anomaly, HourlyProfile } from "./mockData";

export interface CorrelationResult {
  r: number; // Pearson correlation coefficient
  rSquared: number;
  slope: number;
  intercept: number;
  n: number;
}

/**
 * Calculate Pearson correlation and linear regression between temperature and energy
 */
export function calculateTempEnergyCorrelation(
  data: HourlyTimeseries[]
): CorrelationResult | null {
  // Filter to records with valid temp and energy
  const validData = data.filter(
    (d) => d.temp !== null && d.temp !== undefined && d.energy_kwh !== null
  );

  if (validData.length < 10) return null;

  const n = validData.length;
  const temps = validData.map((d) => d.temp!);
  const energies = validData.map((d) => d.energy_kwh);

  const sumX = temps.reduce((a, b) => a + b, 0);
  const sumY = energies.reduce((a, b) => a + b, 0);
  const sumXY = temps.reduce((acc, x, i) => acc + x * energies[i], 0);
  const sumX2 = temps.reduce((acc, x) => acc + x * x, 0);
  const sumY2 = energies.reduce((acc, y) => acc + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return null;

  const r = numerator / denominator;
  const rSquared = r * r;

  // Linear regression: y = slope * x + intercept
  const slope = numerator / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { r, rSquared, slope, intercept, n };
}

/**
 * Interpret correlation strength
 */
export function interpretCorrelation(r: number): {
  strength: "strong" | "moderate" | "weak" | "none";
  label: string;
  description: string;
} {
  const absR = Math.abs(r);
  const direction = r > 0 ? "positive" : "negative";

  if (absR >= 0.7) {
    return {
      strength: "strong",
      label: `Strong ${direction}`,
      description:
        r > 0
          ? "Energy consumption increases significantly with temperature (cooling load)"
          : "Energy consumption increases significantly as temperature drops (heating load)",
    };
  }
  if (absR >= 0.4) {
    return {
      strength: "moderate",
      label: `Moderate ${direction}`,
      description: "Temperature has a notable but not dominant effect on consumption",
    };
  }
  if (absR >= 0.2) {
    return {
      strength: "weak",
      label: `Weak ${direction}`,
      description: "Temperature has minimal impact on this building's energy use",
    };
  }
  return {
    strength: "none",
    label: "No correlation",
    description: "Energy use is independent of outdoor temperature",
  };
}

/**
 * Calculate baseload (minimum consistent energy usage)
 */
export function calculateBaseload(profile: HourlyProfile[]): {
  baseloadKwh: number;
  peakKwh: number;
  peakHour: number;
  ratio: number;
} {
  if (profile.length === 0) {
    return { baseloadKwh: 0, peakKwh: 0, peakHour: 0, ratio: 0 };
  }

  const sorted = [...profile].sort((a, b) => a.avg_kwh - b.avg_kwh);
  const baseloadKwh = sorted[0].avg_kwh;
  const peakEntry = sorted[sorted.length - 1];
  const peakKwh = peakEntry.avg_kwh;
  const peakHour = peakEntry.hour;
  const ratio = baseloadKwh / peakKwh;

  return { baseloadKwh, peakKwh, peakHour, ratio };
}

/**
 * Interpret weather context for anomalies
 */
export function interpretAnomalyWeather(anomaly: Anomaly): {
  cause: "cold_snap" | "heat_wave" | "precipitation" | "unknown";
  label: string;
  icon: string;
} {
  const temp = anomaly.avg_temp;
  const precip = anomaly.total_precip;

  if (temp !== null && temp <= 32) {
    return {
      cause: "cold_snap",
      label: "Cold snap - likely heating load",
      icon: "❄️",
    };
  }
  if (temp !== null && temp >= 85) {
    return {
      cause: "heat_wave",
      label: "Heat wave - likely cooling load",
      icon: "🔥",
    };
  }
  if (precip !== null && precip >= 1) {
    return {
      cause: "precipitation",
      label: "Heavy precipitation event",
      icon: "🌧️",
    };
  }
  return {
    cause: "unknown",
    label: "Investigate - no clear weather driver",
    icon: "🔍",
  };
}

/**
 * Generate scatter plot data points
 */
export function getScatterData(
  data: HourlyTimeseries[]
): Array<{ temp: number; energy_kwh: number; timestamp: string }> {
  return data
    .filter((d) => d.temp !== null && d.temp !== undefined)
    .map((d) => ({
      temp: d.temp!,
      energy_kwh: d.energy_kwh,
      timestamp: d.timestamp_hour,
    }));
}

/**
 * Get regression line points for chart
 */
export function getRegressionLine(
  data: Array<{ temp: number }>,
  correlation: CorrelationResult
): Array<{ temp: number; predicted: number }> {
  if (data.length === 0) return [];

  const temps = data.map((d) => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  return [
    { temp: minTemp, predicted: correlation.slope * minTemp + correlation.intercept },
    { temp: maxTemp, predicted: correlation.slope * maxTemp + correlation.intercept },
  ];
}

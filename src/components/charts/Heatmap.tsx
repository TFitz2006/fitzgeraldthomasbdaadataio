import { useMemo } from "react";

interface HeatmapProps {
  data: Array<{
    day_of_week: number | null;
    hour: number | null;
    avg_kwh: number | null;
  }>;
  title: string;
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Heatmap({ data, title }: HeatmapProps) {
  const { matrix, minVal, maxVal } = useMemo(() => {
    // Initialize 7x24 matrix with zeros
    const matrix: number[][] = Array.from({ length: 7 }, () => 
      Array.from({ length: 24 }, () => 0)
    );

    let minVal = Infinity;
    let maxVal = -Infinity;

    data.forEach((d) => {
      // Skip invalid data
      if (d.day_of_week === null || d.day_of_week === undefined ||
          d.hour === null || d.hour === undefined ||
          d.avg_kwh === null || d.avg_kwh === undefined) {
        return;
      }

      // Handle different day_of_week conventions:
      // If 1-7 (ISO: Monday=1, Sunday=7), convert to 0-6 (Sunday=0)
      // If already 0-6, use as-is
      let dayIndex = d.day_of_week;
      if (dayIndex >= 1 && dayIndex <= 7) {
        // Assume ISO format: 1=Monday...7=Sunday -> convert to 0=Sunday...6=Saturday
        dayIndex = dayIndex === 7 ? 0 : dayIndex;
      }
      
      const hourIndex = d.hour;

      // Bounds check
      if (dayIndex >= 0 && dayIndex < 7 && hourIndex >= 0 && hourIndex < 24) {
        matrix[dayIndex][hourIndex] = d.avg_kwh;
        minVal = Math.min(minVal, d.avg_kwh);
        maxVal = Math.max(maxVal, d.avg_kwh);
      }
    });

    // Handle case where no valid data was found
    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity) maxVal = 0;

    return { matrix, minVal, maxVal };
  }, [data]);

  const getColor = (value: number) => {
    if (value === 0 || maxVal === minVal) return "hsl(var(--muted))";
    const ratio = (value - minVal) / (maxVal - minVal);
    // Gradient from light teal to dark teal
    const lightness = 85 - ratio * 45;
    return `hsl(199, 89%, ${lightness}%)`;
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-12 mb-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="flex-1 text-center text-xs text-muted-foreground"
              >
                {i % 3 === 0 ? `${i}` : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {matrix.map((row, dayIndex) => (
            <div key={dayIndex} className="flex items-center">
              <div className="w-12 text-xs text-muted-foreground text-right pr-2">
                {dayLabels[dayIndex]}
              </div>
              <div className="flex flex-1 gap-[1px]">
                {row.map((value, hourIndex) => (
                  <div
                    key={hourIndex}
                    className="flex-1 aspect-square rounded-sm transition-colors hover:ring-1 hover:ring-primary cursor-default"
                    style={{ backgroundColor: getColor(value) }}
                    title={`${dayLabels[dayIndex]} ${hourIndex}:00 - ${value.toFixed(0)} kWh`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-muted-foreground">{minVal.toFixed(0)} kWh</span>
        <div
          className="w-32 h-3 rounded"
          style={{
            background: `linear-gradient(to right, hsl(199, 89%, 85%), hsl(199, 89%, 40%))`,
          }}
        />
        <span className="text-xs text-muted-foreground">{maxVal.toFixed(0)} kWh</span>
      </div>
    </div>
  );
}

import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  title: string;
  insight: string;
  value?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "success" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles = {
  default: {
    bg: "bg-card",
    border: "border-border",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  warning: {
    bg: "bg-chart-anomaly/5",
    border: "border-chart-anomaly/20",
    iconBg: "bg-chart-anomaly/10",
    iconColor: "text-chart-anomaly",
  },
  success: {
    bg: "bg-accent/5",
    border: "border-accent/20",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  info: {
    bg: "bg-chart-weather/5",
    border: "border-chart-weather/20",
    iconBg: "bg-chart-weather/10",
    iconColor: "text-chart-weather",
  },
};

export function InsightCard({
  title,
  insight,
  value,
  icon: Icon,
  variant = "default",
  action,
}: InsightCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`p-4 rounded-xl border ${styles.bg} ${styles.border} transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h4>
            {value && (
              <span className={`text-sm font-bold ${styles.iconColor}`}>
                {value}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {insight}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-xs font-medium ${styles.iconColor} hover:underline`}
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  suffix?: string;
  description?: string;
}

export function KPICard({ title, value, icon: Icon, suffix, description }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="kpi-label truncate">{title}</p>
          <p className="kpi-value mt-1 truncate">
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix && <span className="text-sm font-medium text-muted-foreground ml-1">{suffix}</span>}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

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
    <div className="kpi-card p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix && <span className="text-lg font-semibold text-muted-foreground ml-1">{suffix}</span>}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

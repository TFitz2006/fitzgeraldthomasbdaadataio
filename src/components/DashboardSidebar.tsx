import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, AlertTriangle, Zap } from "lucide-react";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/deep-dive", label: "Building Deep Dive", icon: Building2 },
  { to: "/anomalies", label: "Anomalies", icon: AlertTriangle },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground">Campus Energy</h1>
            <p className="text-xs text-sidebar-muted">+ Weather</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to === "/deep-dive" && location.pathname.startsWith("/deep-dive"));
            
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted text-center">
          Data from Databricks SQL
        </p>
      </div>
    </aside>
  );
}

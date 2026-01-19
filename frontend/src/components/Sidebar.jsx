import { Sun, Wind, Atom, Droplets, Zap, BarChart3, Brain, Trophy, Map, ChevronRight } from "lucide-react";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

const energyTypes = [
  { key: "solar", label: "Solar", icon: Sun, color: "#FCD34D" },
  { key: "wind", label: "Wind", icon: Wind, color: "#38BDF8" },
  { key: "nuclear", label: "Nuclear", icon: Atom, color: "#A3E635" },
  { key: "hydro", label: "Hydro", icon: Droplets, color: "#60A5FA" },
];

const navItems = [
  { key: "stats", label: "Statistics", icon: BarChart3 },
  { key: "ai", label: "AI Analyst", icon: Brain },
  { key: "compare", label: "Compare", icon: Map },
  { key: "rankings", label: "Rankings", icon: Trophy },
];

export default function Sidebar({
  activeFilters,
  onFilterChange,
  activePanel,
  onPanelChange,
  statistics,
}) {
  return (
    <aside className="sidebar" data-testid="sidebar">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-amber-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'Barlow Condensed' }}>
              ECOVOLT GEO
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Energy Infrastructure</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4" data-testid="nav-menu">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3 px-2">Navigation</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onPanelChange(item.key)}
              data-testid={`nav-${item.key}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all",
                activePanel === item.key
                  ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {activePanel === item.key && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
      </nav>

      <Separator className="bg-white/10" />

      {/* Energy Filters */}
      <div className="p-4" data-testid="energy-filters">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3 px-2">Energy Layers</p>
        <div className="space-y-2">
          {energyTypes.map((type) => (
            <div
              key={type.key}
              className="flex items-center justify-between px-3 py-2.5 rounded-sm bg-zinc-900/50 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <type.icon className="w-4 h-4" style={{ color: type.color }} />
                <span className="text-sm text-zinc-300">{type.label}</span>
              </div>
              <Switch
                checked={activeFilters[type.key]}
                onCheckedChange={() => onFilterChange(type.key)}
                data-testid={`filter-${type.key}`}
              />
            </div>
          ))}
        </div>

        {/* Distribution Hubs Toggle */}
        <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-sm bg-zinc-900/50 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-zinc-300">Distribution Hubs</span>
          </div>
          <Switch
            checked={activeFilters.showHubs}
            onCheckedChange={() => onFilterChange("showHubs")}
            data-testid="filter-hubs"
          />
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Quick Stats */}
      {statistics && (
        <div className="p-4" data-testid="quick-stats">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3 px-2">Overview</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-sm bg-zinc-900/50 border border-white/5">
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                {statistics.total_plants}
              </p>
              <p className="text-[10px] uppercase text-zinc-500">Plants</p>
            </div>
            <div className="p-3 rounded-sm bg-zinc-900/50 border border-white/5">
              <p className="text-2xl font-bold text-amber-500" style={{ fontFamily: 'Barlow Condensed' }}>
                {(statistics.total_capacity_mw / 1000).toFixed(1)}
              </p>
              <p className="text-[10px] uppercase text-zinc-500">GW Total</p>
            </div>
            <div className="p-3 rounded-sm bg-zinc-900/50 border border-white/5">
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                {statistics.states_covered}
              </p>
              <p className="text-[10px] uppercase text-zinc-500">States</p>
            </div>
            <div className="p-3 rounded-sm bg-zinc-900/50 border border-white/5">
              <p className="text-2xl font-bold text-green-500" style={{ fontFamily: 'Barlow Condensed' }}>
                {statistics.by_status?.operational || 0}
              </p>
              <p className="text-[10px] uppercase text-zinc-500">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-white/10">
        <p className="text-[10px] text-zinc-600 text-center">
          Data sourced from EIA & NREL
        </p>
      </div>
    </aside>
  );
}

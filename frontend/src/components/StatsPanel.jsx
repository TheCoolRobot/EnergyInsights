import { Sun, Wind, Atom, Droplets, X, TrendingUp, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const energyIcons = {
  solar: Sun,
  wind: Wind,
  nuclear: Atom,
  hydro: Droplets,
};

const energyColors = {
  solar: "#FCD34D",
  wind: "#38BDF8",
  nuclear: "#A3E635",
  hydro: "#60A5FA",
};

export default function StatsPanel({ statistics, selectedPlant, onClose, loading }) {
  if (loading) {
    return (
      <div className="overlay-panel top-4 right-4 w-80 p-4" data-testid="stats-panel-loading">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="overlay-panel top-4 right-4 w-80" data-testid="stats-panel">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
              {selectedPlant ? "Plant Details" : "Energy Statistics"}
            </h2>
          </div>
          {selectedPlant && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
              data-testid="close-plant-details"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {selectedPlant ? (
          <PlantDetails plant={selectedPlant} />
        ) : (
          <OverviewStats statistics={statistics} />
        )}
      </div>
    </div>
  );
}

function PlantDetails({ plant }) {
  const Icon = energyIcons[plant.type];
  const color = energyColors[plant.type];

  return (
    <div className="space-y-4" data-testid="plant-details">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <h3 className="font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
            {plant.name}
          </h3>
          <p className="text-sm text-zinc-400 capitalize">{plant.type} Power Plant</p>
        </div>
      </div>

      <div className="space-y-2">
        <DetailRow label="Capacity" value={`${plant.capacity_mw.toLocaleString()} MW`} />
        <DetailRow label="State" value={plant.state} />
        <DetailRow label="Status" value={plant.status.replace('_', ' ')} capitalize />
        {plant.year_built && <DetailRow label="Year Built" value={plant.year_built} />}
        <DetailRow label="Latitude" value={plant.lat.toFixed(4)} />
        <DetailRow label="Longitude" value={plant.lng.toFixed(4)} />
      </div>

      <div className="pt-3 border-t border-white/10">
        <p className="text-xs text-zinc-500">
          Annual Output Estimate: ~{Math.round(plant.capacity_mw * 8760 * 0.3 / 1000).toLocaleString()} GWh
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, capitalize }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className={`text-sm font-medium text-white ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function OverviewStats({ statistics }) {
  if (!statistics) return null;

  return (
    <div className="space-y-4" data-testid="overview-stats">
      {/* Total Capacity Card */}
      <div className="p-4 rounded-sm bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-3xl font-bold text-amber-500" style={{ fontFamily: 'Barlow Condensed' }}>
              {(statistics.total_capacity_mw / 1000).toFixed(1)} GW
            </p>
            <p className="text-xs text-zinc-500 uppercase">Total Capacity</p>
          </div>
        </div>
      </div>

      {/* Energy Type Breakdown */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-zinc-600">By Energy Type</p>
        {Object.entries(statistics.by_type || {}).map(([type, data]) => {
          const Icon = energyIcons[type];
          const color = energyColors[type];
          const percentage = ((data.capacity_mw / statistics.total_capacity_mw) * 100).toFixed(1);

          return (
            <div key={type} className="p-3 rounded-sm bg-zinc-900/50 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-sm font-medium capitalize text-white">{type}</span>
                </div>
                <span className="text-sm text-zinc-400">{data.count} plants</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">
                  {(data.capacity_mw / 1000).toFixed(1)} GW
                </span>
                <span className="text-xs" style={{ color }}>{percentage}%</span>
              </div>
              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-zinc-600">By Status</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-sm bg-zinc-900/50 border border-white/5 text-center">
            <p className="text-lg font-bold text-green-500" style={{ fontFamily: 'Barlow Condensed' }}>
              {statistics.by_status?.operational || 0}
            </p>
            <p className="text-[10px] uppercase text-zinc-500">Active</p>
          </div>
          <div className="p-2 rounded-sm bg-zinc-900/50 border border-white/5 text-center">
            <p className="text-lg font-bold text-yellow-500" style={{ fontFamily: 'Barlow Condensed' }}>
              {statistics.by_status?.under_construction || 0}
            </p>
            <p className="text-[10px] uppercase text-zinc-500">Building</p>
          </div>
          <div className="p-2 rounded-sm bg-zinc-900/50 border border-white/5 text-center">
            <p className="text-lg font-bold text-blue-500" style={{ fontFamily: 'Barlow Condensed' }}>
              {statistics.by_status?.planned || 0}
            </p>
            <p className="text-[10px] uppercase text-zinc-500">Planned</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Sun, Wind, Atom, Droplets, TrendingUp, Users, Leaf, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const energyConfig = {
  solar: { icon: Sun, color: "#FCD34D", bgColor: "rgba(252, 211, 77, 0.1)" },
  wind: { icon: Wind, color: "#38BDF8", bgColor: "rgba(56, 189, 248, 0.1)" },
  nuclear: { icon: Atom, color: "#A3E635", bgColor: "rgba(163, 230, 53, 0.1)" },
  hydro: { icon: Droplets, color: "#60A5FA", bgColor: "rgba(96, 165, 250, 0.1)" },
};

const metricLabels = {
  avg_capacity_factor: { label: "Capacity Factor", unit: "%", icon: TrendingUp },
  avg_lcoe_usd_mwh: { label: "LCOE", unit: "$/MWh", icon: DollarSign },
  total_us_capacity_gw: { label: "US Capacity", unit: "GW", icon: Atom },
  growth_rate_percent: { label: "Growth Rate", unit: "%", icon: TrendingUp },
  jobs_per_gw: { label: "Jobs per GW", unit: "", icon: Users },
  co2_avoided_tons_per_gwh: { label: "CO2 Avoided", unit: "t/GWh", icon: Leaf },
};

export default function ComparisonPanel() {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState("avg_capacity_factor");

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      const response = await axios.get(`${API}/comparison`);
      setComparisonData(response.data);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = (metric) => {
    if (!comparisonData) return 100;
    return Math.max(...Object.values(comparisonData).map(d => d[metric]));
  };

  return (
    <div className="overlay-panel top-4 right-4 w-[420px]" data-testid="comparison-panel">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
          ENERGY COMPARISON
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Compare metrics across energy types</p>
      </div>

      {/* Metric Tabs */}
      <Tabs value={activeMetric} onValueChange={setActiveMetric} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid grid-cols-3 gap-1 bg-zinc-900/50 p-1">
            <TabsTrigger value="avg_capacity_factor" className="text-[10px]" data-testid="tab-capacity">
              Capacity
            </TabsTrigger>
            <TabsTrigger value="avg_lcoe_usd_mwh" className="text-[10px]" data-testid="tab-lcoe">
              LCOE
            </TabsTrigger>
            <TabsTrigger value="growth_rate_percent" className="text-[10px]" data-testid="tab-growth">
              Growth
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          {Object.keys(metricLabels).map((metric) => (
            <TabsContent key={metric} value={metric} className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const IconComponent = metricLabels[metric].icon;
                    return <IconComponent className="w-4 h-4 text-amber-500" />;
                  })()}
                  <span className="text-sm font-medium text-zinc-300">
                    {metricLabels[metric].label}
                  </span>
                </div>

                {comparisonData && Object.entries(comparisonData).map(([type, data]) => {
                  const config = energyConfig[type];
                  const Icon = config.icon;
                  const value = data[metric];
                  const maxValue = getMaxValue(metric);
                  const percentage = (value / maxValue) * 100;

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: config.bgColor }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                          </div>
                          <span className="text-sm font-medium capitalize text-white">{type}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: config.color }}>
                          {value.toLocaleString()}{metricLabels[metric].unit}
                        </span>
                      </div>
                      <div className="h-3 rounded bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Quick Stats Grid */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Additional Metrics</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveMetric("total_us_capacity_gw")}
            className={`p-3 rounded text-left transition-all ${
              activeMetric === "total_us_capacity_gw"
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-zinc-900/50 border border-white/5 hover:border-white/10"
            }`}
            data-testid="metric-capacity"
          >
            <Atom className="w-4 h-4 text-zinc-500 mb-1" />
            <p className="text-[10px] uppercase text-zinc-500">US Capacity</p>
          </button>
          <button
            onClick={() => setActiveMetric("jobs_per_gw")}
            className={`p-3 rounded text-left transition-all ${
              activeMetric === "jobs_per_gw"
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-zinc-900/50 border border-white/5 hover:border-white/10"
            }`}
            data-testid="metric-jobs"
          >
            <Users className="w-4 h-4 text-zinc-500 mb-1" />
            <p className="text-[10px] uppercase text-zinc-500">Jobs/GW</p>
          </button>
          <button
            onClick={() => setActiveMetric("co2_avoided_tons_per_gwh")}
            className={`p-3 rounded text-left transition-all ${
              activeMetric === "co2_avoided_tons_per_gwh"
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-zinc-900/50 border border-white/5 hover:border-white/10"
            }`}
            data-testid="metric-co2"
          >
            <Leaf className="w-4 h-4 text-zinc-500 mb-1" />
            <p className="text-[10px] uppercase text-zinc-500">CO2 Saved</p>
          </button>
          <button
            onClick={() => setActiveMetric("avg_lcoe_usd_mwh")}
            className={`p-3 rounded text-left transition-all ${
              activeMetric === "avg_lcoe_usd_mwh"
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-zinc-900/50 border border-white/5 hover:border-white/10"
            }`}
            data-testid="metric-lcoe"
          >
            <DollarSign className="w-4 h-4 text-zinc-500 mb-1" />
            <p className="text-[10px] uppercase text-zinc-500">Cost/MWh</p>
          </button>
        </div>
      </div>
    </div>
  );
}

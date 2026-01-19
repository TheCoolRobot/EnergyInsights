import { useState } from "react";
import { Brain, Sparkles, MapPin, Zap, DollarSign, Loader2, TrendingUp, Clock, Percent } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

const states = [
  { code: "any", name: "Any State" },
  { code: "CA", name: "California" },
  { code: "TX", name: "Texas" },
  { code: "AZ", name: "Arizona" },
  { code: "NV", name: "Nevada" },
  { code: "NM", name: "New Mexico" },
  { code: "WA", name: "Washington" },
  { code: "OR", name: "Oregon" },
  { code: "WY", name: "Wyoming" },
  { code: "CO", name: "Colorado" },
  { code: "NY", name: "New York" },
  { code: "IL", name: "Illinois" },
  { code: "GA", name: "Georgia" },
  { code: "FL", name: "Florida" },
];

const energyTypes = [
  { value: "best", label: "Best Suited" },
  { value: "solar", label: "Solar" },
  { value: "wind", label: "Wind" },
  { value: "nuclear", label: "Nuclear" },
  { value: "hydro", label: "Hydro" },
];

const energyColors = {
  solar: "#FCD34D",
  wind: "#38BDF8",
  nuclear: "#A3E635",
  hydro: "#60A5FA",
};

export default function AIPanel({ onSuggestionReceived, suggestion }) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState("any");
  const [energyType, setEnergyType] = useState("best");
  const [budget, setBudget] = useState("");

  const handleGetSuggestion = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/suggest`, {
        state: state === "any" ? null : state,
        energy_type: energyType === "best" ? null : energyType,
        budget_millions: budget ? parseFloat(budget) : null,
      });

      onSuggestionReceived(response.data);
      toast.success("AI analysis complete!", {
        description: `Found optimal location in ${response.data.state}`,
      });
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast.error("Failed to get AI suggestion", {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay-panel top-4 right-4 w-96" data-testid="ai-panel">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
              AI ANALYST
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase">Llama 3.3 70B Powered</p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 space-y-4 border-b border-white/10">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500">State Preference</label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="bg-black/50 border-white/10 text-white" data-testid="select-state">
              <SelectValue placeholder="Any State" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white z-[9999]">
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code} className="text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500">Energy Type</label>
          <Select value={energyType} onValueChange={setEnergyType}>
            <SelectTrigger className="bg-black/50 border-white/10 text-white" data-testid="select-energy-type">
              <SelectValue placeholder="Best Suited" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white z-[9999]">
              {energyTypes.map((e) => (
                <SelectItem key={e.value} value={e.value} className="text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500">Budget (Million USD)</label>
          <Input
            type="number"
            placeholder="e.g., 500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="bg-black/50 border-white/10"
            data-testid="input-budget"
          />
        </div>

        <Button
          onClick={handleGetSuggestion}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold"
          data-testid="get-ai-suggestion"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Recommendation
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {suggestion && (
        <div className="p-4 space-y-4" data-testid="ai-suggestion-result">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs uppercase tracking-wider text-pink-400">AI Recommendation</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
              {suggestion.location_name}
            </h3>

            <div className="flex flex-wrap gap-2">
              <span 
                className="px-2 py-1 rounded text-xs font-medium capitalize"
                style={{ 
                  backgroundColor: `${energyColors[suggestion.energy_type]}20`,
                  color: energyColors[suggestion.energy_type],
                  border: `1px solid ${energyColors[suggestion.energy_type]}40`
                }}
              >
                {suggestion.energy_type}
              </span>
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-medium">
                {suggestion.state}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-zinc-900/50 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] uppercase text-zinc-500">Capacity</span>
                </div>
                <p className="text-lg font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                  {suggestion.recommended_capacity_mw} MW
                </p>
              </div>

              <div className="p-3 rounded bg-zinc-900/50 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] uppercase text-zinc-500">Est. Cost</span>
                </div>
                <p className="text-lg font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                  ${suggestion.estimated_cost_millions}M
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="p-3 rounded bg-zinc-900/50 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase text-zinc-500">Suitability Score</span>
                <span className={`text-lg font-bold ${
                  suggestion.score >= 80 ? 'text-green-500' :
                  suggestion.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                }`} style={{ fontFamily: 'Barlow Condensed' }}>
                  {suggestion.score}/100
                </span>
              </div>
              <div className="h-2 rounded bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    suggestion.score >= 80 ? 'bg-green-500' :
                    suggestion.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${suggestion.score}%` }}
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="w-4 h-4" />
              <span>{suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}</span>
            </div>

            {/* Financial Analysis */}
            {suggestion.financial_analysis && (
              <div className="p-3 rounded bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20">
                <p className="text-xs uppercase text-green-400 mb-3 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Financial Analysis
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Annual Revenue</span>
                    <span className="text-sm font-bold text-green-400">${suggestion.financial_analysis.annual_revenue_millions}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Operating Cost</span>
                    <span className="text-sm font-bold text-red-400">${suggestion.financial_analysis.annual_operating_cost_millions}M/yr</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-green-500/10 border border-green-500/30">
                    <span className="text-xs text-green-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Break-Even Point
                    </span>
                    <span className="text-sm font-bold text-green-400">{suggestion.financial_analysis.payback_period_years} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">20-Year ROI</span>
                    <span className="text-sm font-bold text-green-400 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {suggestion.financial_analysis.roi_20_year_percent}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Net Present Value</span>
                    <span className="text-sm font-bold text-white">${suggestion.financial_analysis.net_present_value_millions}M</span>
                  </div>
                </div>
              </div>
            )}

            {/* Energy Demand Analysis */}
            {suggestion.energy_demand && (
              <div className="p-3 rounded bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20">
                <p className="text-xs uppercase text-blue-400 mb-3 font-semibold">Energy Demand Analysis</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Current Demand</span>
                    <span className="text-sm font-bold text-white">{suggestion.energy_demand.current_demand_mw} MW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Growth Rate</span>
                    <span className="text-sm font-bold text-green-400">+{suggestion.energy_demand.projected_growth_percent}%/year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Peak Hours</span>
                    <span className="text-sm font-bold text-amber-400">{suggestion.energy_demand.peak_demand_hours}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs text-zinc-400 mb-1">Demand Drivers</p>
                    <p className="text-xs text-zinc-200">{suggestion.energy_demand.demand_drivers}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div className="p-3 rounded bg-zinc-900/30 border border-white/5">
              <p className="text-xs uppercase text-zinc-500 mb-2">Detailed Analysis</p>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {suggestion.reasoning}
              </p>
            </div>

            {/* Specifications */}
            {suggestion.specifications && Object.keys(suggestion.specifications).length > 0 && (
              <div className="p-3 rounded bg-zinc-900/30 border border-white/5">
                <p className="text-xs uppercase text-zinc-500 mb-2">Specifications</p>
                <div className="space-y-1">
                  {Object.entries(suggestion.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-zinc-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-zinc-300">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

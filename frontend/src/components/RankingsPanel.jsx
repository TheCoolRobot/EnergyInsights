import { useState, useEffect } from "react";
import { Sun, Wind, Atom, Droplets, Trophy, MapPin, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

const energyConfig = {
  solar: { icon: Sun, color: "#FCD34D", bgColor: "rgba(252, 211, 77, 0.1)" },
  wind: { icon: Wind, color: "#38BDF8", bgColor: "rgba(56, 189, 248, 0.1)" },
  nuclear: { icon: Atom, color: "#A3E635", bgColor: "rgba(163, 230, 53, 0.1)" },
  hydro: { icon: Droplets, color: "#60A5FA", bgColor: "rgba(96, 165, 250, 0.1)" },
};

export default function RankingsPanel() {
  const [rankings, setRankings] = useState({});
  const [activeType, setActiveType] = useState("solar");
  const [loading, setLoading] = useState(true);
  const [expandedRank, setExpandedRank] = useState(null);

  useEffect(() => {
    fetchAllRankings();
  }, []);

  const fetchAllRankings = async () => {
    try {
      const types = ["solar", "wind", "nuclear", "hydro"];
      const results = await Promise.all(
        types.map((type) => axios.get(`${API}/rankings/${type}`))
      );

      const rankingsData = {};
      types.forEach((type, index) => {
        rankingsData[type] = results[index].data;
      });

      setRankings(rankingsData);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-600";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="overlay-panel top-4 right-4 w-[400px] max-h-[calc(100vh-100px)]" data-testid="rankings-panel">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
            LOCATION RANKINGS
          </h2>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Top locations ranked 1-100 by suitability</p>
      </div>

      {/* Energy Type Tabs */}
      <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid grid-cols-4 gap-1 bg-zinc-900/50 p-1">
            {Object.entries(energyConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="flex items-center gap-1 text-[10px] uppercase"
                  data-testid={`rankings-tab-${type}`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{type}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="p-4">
            {Object.entries(energyConfig).map(([type, config]) => (
              <TabsContent key={type} value={type} className="mt-0 space-y-3">
                {rankings[type]?.map((location, index) => {
                  const Icon = config.icon;
                  const isExpanded = expandedRank === `${type}-${index}`;

                  return (
                    <div
                      key={index}
                      className={`rounded border transition-all cursor-pointer ${
                        isExpanded
                          ? "bg-zinc-800/50 border-white/20"
                          : "bg-zinc-900/50 border-white/5 hover:border-white/10"
                      }`}
                      onClick={() => setExpandedRank(isExpanded ? null : `${type}-${index}`)}
                      data-testid={`ranking-item-${type}-${index}`}
                    >
                      <div className="p-3 flex items-center gap-3">
                        {/* Rank Badge */}
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: config.bgColor,
                            color: config.color,
                            fontFamily: 'Barlow Condensed'
                          }}
                        >
                          #{location.rank}
                        </div>

                        {/* Location Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{location.state}</span>
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            <span className="text-xs text-zinc-500 truncate">
                              {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getScoreColor(location.score)}`} style={{ fontFamily: 'Barlow Condensed' }}>
                              {location.score}
                            </span>
                            <span className="text-xs text-zinc-500">/100</span>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 text-zinc-500 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="px-3 pb-3">
                        <div className="h-1.5 rounded bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded transition-all duration-500 ${getScoreBgColor(location.score)}`}
                            style={{ width: `${location.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-white/5">
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {location.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="pt-4 border-t border-white/10 mt-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Score Legend</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-green-500" />
                      <span className="text-zinc-500">90+ Excellent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-yellow-500" />
                      <span className="text-zinc-500">70-89 Good</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-orange-500" />
                      <span className="text-zinc-500">&lt;70 Fair</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

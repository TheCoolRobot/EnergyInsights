import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MapView from "../components/MapView";
import StatsPanel from "../components/StatsPanel";
import AIPanel from "../components/AIPanel";
import ComparisonPanel from "../components/ComparisonPanel";
import RankingsPanel from "../components/RankingsPanel";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const [powerPlants, setPowerPlants] = useState([]);
  const [stateScores, setStateScores] = useState([]);
  const [distributionHubs, setDistributionHubs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    solar: true,
    wind: true,
    nuclear: true,
    hydro: true,
    showHubs: true,
  });
  const [activePanel, setActivePanel] = useState("stats");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plantsRes, scoresRes, hubsRes, statsRes] = await Promise.all([
        axios.get(`${API}/power-plants`),
        axios.get(`${API}/state-scores`),
        axios.get(`${API}/distribution-hubs`),
        axios.get(`${API}/statistics`),
      ]);

      setPowerPlants(Array.isArray(plantsRes.data) ? plantsRes.data : []);
      setStateScores(Array.isArray(scoresRes.data) ? scoresRes.data : []);
      setDistributionHubs(Array.isArray(hubsRes.data) ? hubsRes.data : []);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setPowerPlants([]);
      setStateScores([]);
      setDistributionHubs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const filteredPlants = Array.isArray(powerPlants)
    ? powerPlants.filter((plant) => activeFilters[plant.type])
    : [];

  return (
    <div className="flex min-h-screen bg-[#09090B]" data-testid="dashboard">
      <Sidebar
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        statistics={statistics}
      />

      <main className="flex-1 ml-[280px] h-screen relative overflow-hidden" data-testid="main-content">
        <MapView
          powerPlants={filteredPlants}
          distributionHubs={activeFilters.showHubs ? distributionHubs : []}
          stateScores={stateScores}
          aiSuggestion={aiSuggestion}
          onPlantSelect={setSelectedPlant}
        />

        {activePanel === "stats" && (
          <StatsPanel
            statistics={statistics}
            selectedPlant={selectedPlant}
            onClose={() => setSelectedPlant(null)}
            loading={loading}
          />
        )}

        {activePanel === "ai" && (
          <AIPanel
            onSuggestionReceived={setAiSuggestion}
            suggestion={aiSuggestion}
          />
        )}

        {activePanel === "compare" && <ComparisonPanel />}

        {activePanel === "rankings" && <RankingsPanel />}
      </main>
    </div>
  );
}

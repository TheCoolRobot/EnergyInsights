import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const energyColors = {
  solar: "#FCD34D",
  wind: "#38BDF8",
  nuclear: "#A3E635",
  hydro: "#60A5FA",
};

const statusStyles = {
  operational: { fillOpacity: 0.8, weight: 2 },
  planned: { fillOpacity: 0.4, weight: 1, dashArray: "4,4" },
  under_construction: { fillOpacity: 0.6, weight: 2, dashArray: "2,2" },
};

function MapController({ aiSuggestion }) {
  const map = useMap();

  useEffect(() => {
    if (aiSuggestion) {
      map.flyTo([aiSuggestion.lat, aiSuggestion.lng], 8, {
        duration: 1.5,
      });
    }
  }, [aiSuggestion, map]);

  return null;
}

function getMarkerRadius(capacity) {
  if (capacity > 3000) return 12;
  if (capacity > 1000) return 10;
  if (capacity > 500) return 8;
  return 6;
}

export default function MapView({
  powerPlants,
  distributionHubs,
  stateScores,
  aiSuggestion,
  onPlantSelect,
}) {
  const mapRef = useRef(null);

  return (
    <div className="map-container" data-testid="map-container" style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <MapController aiSuggestion={aiSuggestion} />

        {/* Power Plants */}
        {powerPlants.map((plant) => (
          <CircleMarker
            key={plant.id}
            center={[plant.lat, plant.lng]}
            radius={getMarkerRadius(plant.capacity_mw)}
            pathOptions={{
              color: energyColors[plant.type],
              fillColor: energyColors[plant.type],
              ...statusStyles[plant.status],
            }}
            eventHandlers={{
              click: () => onPlantSelect(plant),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
                  {plant.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Type:</span>
                    <span 
                      className="font-medium capitalize"
                      style={{ color: energyColors[plant.type] }}
                    >
                      {plant.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Capacity:</span>
                    <span className="font-medium">{plant.capacity_mw.toLocaleString()} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Status:</span>
                    <span className="font-medium capitalize">{plant.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">State:</span>
                    <span className="font-medium">{plant.state}</span>
                  </div>
                  {plant.year_built && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Year Built:</span>
                      <span className="font-medium">{plant.year_built}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Distribution Hubs */}
        {distributionHubs.map((hub) => (
          <CircleMarker
            key={hub.id}
            center={[hub.lat, hub.lng]}
            radius={8}
            pathOptions={{
              color: "#F59E0B",
              fillColor: "#F59E0B",
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
                  {hub.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Capacity:</span>
                    <span className="font-medium">{hub.capacity_mw.toLocaleString()} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">State:</span>
                    <span className="font-medium">{hub.state}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* AI Suggestion Marker */}
        {aiSuggestion && (
          <CircleMarker
            center={[aiSuggestion.lat, aiSuggestion.lng]}
            radius={14}
            pathOptions={{
              color: "#EC4899",
              fillColor: "#EC4899",
              fillOpacity: 0.5,
              weight: 3,
            }}
            className="marker-pulse"
          >
            <Popup>
              <div className="min-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] uppercase rounded">
                    AI Suggestion
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
                  {aiSuggestion.location_name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Type:</span>
                    <span 
                      className="font-medium capitalize"
                      style={{ color: energyColors[aiSuggestion.energy_type] }}
                    >
                      {aiSuggestion.energy_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Capacity:</span>
                    <span className="font-medium">{aiSuggestion.recommended_capacity_mw} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Score:</span>
                    <span className="font-medium text-green-400">{aiSuggestion.score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Est. Cost:</span>
                    <span className="font-medium">${aiSuggestion.estimated_cost_millions}M</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}

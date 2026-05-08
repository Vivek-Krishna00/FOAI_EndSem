import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SpeedChart from './SpeedChart';
import toast from 'react-hot-toast';

const ISSIcon = L.divIcon({
  html: '<div style="font-size:28px;filter:drop-shadow(0 0 12px #22d3ee)">🛸</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lon], map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function ISSTracker({ issData }) {
  const {
    position,
    speed,
    astronauts,
    positions,
    speedHistory,
    locationName,
    loading,
    error,
    refresh,
  } = issData;

  const handleRefresh = () => {
    refresh();
    toast.success('ISS position refreshed!');
  };

  if (loading && !position) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="skeleton h-[450px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-3xl text-white">ISS Tracker</h2>
          <p className="text-slate-400 text-sm mt-1">Live orbital telemetry, position and crew details.</p>
        </div>
        <button onClick={handleRefresh} className="btn-primary flex items-center gap-2">
          <span>↻</span> Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <div className="space-y-5">
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">Live Position</p>
                <p className="font-mono text-4xl text-white mt-3">
                  {position ? `${position.lat.toFixed(4)}°, ${position.lon.toFixed(4)}°` : 'Waiting...'}
                </p>
              </div>
              <div className="rounded-3xl bg-white/5 py-2 px-4 text-sm text-slate-300">ISS ORBIT</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">Speed</p>
                <p className="font-mono text-3xl text-amber-400 mt-3">{speed?.toLocaleString() ?? '--'}</p>
                <p className="text-slate-500 text-xs mt-2">km/h</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">Tracked Points</p>
                <p className="font-mono text-3xl text-cyan-400 mt-3">{positions.length}</p>
                <p className="text-slate-500 text-xs mt-2">Recent fixes</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">Current Location</p>
              <p className="text-white font-body text-lg mt-3">{locationName}</p>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">People in Space</p>
                <p className="font-display font-semibold text-white text-xl mt-2">{astronauts.number}</p>
              </div>
              <span className="stat-chip">Crew</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {astronauts.people.map((person, index) => (
                <div key={index} className="rounded-3xl bg-white/5 p-3 border border-white/10 flex items-start gap-3">
                  <span className="text-2xl">🧑‍🚀</span>
                  <div>
                    <p className="text-white text-sm font-body">{person.name}</p>
                    <p className="text-slate-500 text-xs">{person.craft}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden min-h-[450px]">
          {position ? (
            <MapContainer
              center={[position.lat, position.lon]}
              zoom={3}
              minZoom={2}
              maxZoom={7}
              style={{ height: '100%', width: '100%' }}
              zoomControl
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="© OpenStreetMap © CartoDB"
                subdomains={['a', 'b', 'c', 'd']}
              />
              <Marker position={[position.lat, position.lon]} icon={ISSIcon}>
                <Popup>
                  <div className="font-mono text-xs">
                    <div>🛸 ISS</div>
                    <div>Lat: {position.lat.toFixed(4)}</div>
                    <div>Lon: {position.lon.toFixed(4)}</div>
                    <div>Speed: {speed.toLocaleString()} km/h</div>
                  </div>
                </Popup>
              </Marker>
              {positions.length > 1 && (
                <Polyline positions={positions.map((point) => [point.lat, point.lon])} pathOptions={{ color: '#22d3ee', weight: 3, dashArray: '6,6', opacity: 0.8 }} />
              )}
              <MapUpdater position={position} />
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">Loading map...</div>
          )}
        </div>
      </div>

      <SpeedChart speedHistory={speedHistory} />
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Info, Zap, Train } from 'lucide-react';
import { STATIONS, RAILWAY_SECTIONS } from '../data/mockData';
import { useStore } from '../store/useStore';
import type { RailwaySection, Station } from '../types';

const SECTION_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

const MAINTENANCE_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  scheduled: '#8b5cf6',
  active: '#ef4444',
};

export function NetworkPage() {
  const { requests, blocks } = useStore();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<RailwaySection | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showLayer, setShowLayer] = useState({
    traffic: true,
    maintenance: true,
    blocks: true,
  });

  const SVG_W = 720;
  const SVG_H = 560;

  // Build section paths between stations
  const sectionPaths = RAILWAY_SECTIONS.map((sec) => {
    const from = STATIONS.find((s) => s.id === sec.fromStationId);
    const to = STATIONS.find((s) => s.id === sec.toStationId);
    if (!from || !to) return null;

    // Check if there are active requests on this section
    const sectionRequests = requests.filter((r) => r.sectionId === sec.id && r.status === 'pending');
    const sectionBlocks = blocks.filter((b) => b.sectionId === sec.id && b.status === 'planned');

    let strokeColor = SECTION_COLORS[sec.trafficIntensity];
    if (showLayer.maintenance && sectionRequests.length > 0) strokeColor = MAINTENANCE_COLOR['pending'];
    if (showLayer.blocks && sectionBlocks.length > 0) strokeColor = MAINTENANCE_COLOR['scheduled'];

    return { sec, from, to, strokeColor, sectionRequests, sectionBlocks };
  }).filter(Boolean) as any[];

  const infoPanel = selectedSection || null;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Railway Network View</h1>
          <p className="page-subtitle">Interactive map — Central Railway Zone (Simulated Demo Data)</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={() => navigate('/optimizer')}>
          <Zap size={13} /> Run Optimizer
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Map */}
        <div style={{ flex: 1 }}>
          <div className="map-container" style={{ height: SVG_H }}>
            {/* Legend / Layer Controls */}
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 5, background: 'rgba(11,20,32,0.9)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Layers</div>
              {Object.entries(showLayer).map(([key, val]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  <input type="checkbox" checked={val} onChange={() => setShowLayer((l) => ({ ...l, [key as keyof typeof l]: !l[key as keyof typeof l] }))} style={{ accentColor: 'var(--color-primary-light)' }} />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { color: '#ef4444', label: 'High traffic' },
                  { color: '#f59e0b', label: 'Med / Pending maint.' },
                  { color: '#10b981', label: 'Low traffic' },
                  { color: '#8b5cf6', label: 'Scheduled block' },
                ].map((l) => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5 }}>
                    <div style={{ width: 20, height: 3, borderRadius: 2, background: l.color }} />
                    <span style={{ color: 'var(--color-text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo watermark */}
            <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 5, fontSize: 10, color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: 4 }}>
              ⚠ Simulated map – Not real GIS data
            </div>

            <svg width="100%" height="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

              {/* Section lines */}
              {sectionPaths.map(({ sec, from, to, strokeColor, sectionRequests, sectionBlocks }) => {
                const isSelected = selectedSection?.id === sec.id;
                const hasMaint = sectionRequests.length > 0;
                return (
                  <g key={sec.id} onClick={() => setSelectedSection(isSelected ? null : sec)} style={{ cursor: 'pointer' }}>
                    {/* Glow effect for sections with maintenance */}
                    {(hasMaint || sectionBlocks.length > 0) && (
                      <line
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={strokeColor} strokeWidth={10} strokeOpacity={0.15}
                        className="animate-pulse-ring"
                      />
                    )}
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isSelected ? 'white' : strokeColor}
                      strokeWidth={isSelected ? 4 : 2.5}
                      strokeLinecap="round"
                      className="map-section"
                    />
                    {/* Section label at midpoint */}
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fill="rgba(255,255,255,0.3)"
                      fontFamily="Inter"
                    >
                      {sec.length}km
                    </text>
                    {/* Maintenance indicator dot */}
                    {hasMaint && showLayer.maintenance && (
                      <circle
                        cx={(from.x + to.x) / 2}
                        cy={(from.y + to.y) / 2}
                        r={5}
                        fill={MAINTENANCE_COLOR['pending']}
                        stroke="var(--color-surface)"
                        strokeWidth={1.5}
                      />
                    )}
                  </g>
                );
              })}

              {/* Stations */}
              {STATIONS.map((station) => {
                const isSelected = selectedStation?.id === station.id;
                const stationRequests = requests.filter((r) => r.sectionId && RAILWAY_SECTIONS.find((s) => s.id === r.sectionId && (s.fromStationId === station.id || s.toStationId === station.id)));

                return (
                  <g key={station.id} className="map-station" onClick={() => setSelectedStation(isSelected ? null : station)}>
                    <circle
                      cx={station.x} cy={station.y}
                      r={isSelected ? 10 : station.isJunction ? 8 : 5}
                      fill={isSelected ? 'var(--color-accent)' : station.isJunction ? 'var(--color-primary-light)' : 'var(--color-surface-3)'}
                      stroke={isSelected ? 'white' : 'rgba(255,255,255,0.3)'}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                    {station.isJunction && (
                      <circle cx={station.x} cy={station.y} r={4} fill="white" opacity={0.8} />
                    )}
                    <text
                      x={station.x + 14}
                      y={station.y + 4}
                      className="map-station-label"
                      style={{ fontSize: station.isJunction ? 11 : 9, fill: station.isJunction ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', fontWeight: station.isJunction ? 600 : 400 }}
                    >
                      {station.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Info Panel */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Section detail */}
          {selectedSection ? (
            <div className="card animate-slide-up">
              <div className="card-header">
                <div className="card-title">{selectedSection.name}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSection(null)}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                {[
                  { k: 'Zone / Division', v: `${selectedSection.zone} / ${selectedSection.division}` },
                  { k: 'Length', v: `${selectedSection.length} km` },
                  { k: 'Electrified', v: selectedSection.electrified ? '✓ Yes (25kV AC)' : '✗ No' },
                  { k: 'Traffic Intensity', v: selectedSection.trafficIntensity.toUpperCase() },
                ].map(({ k, v }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{k}</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Section requests */}
              {requests.filter((r) => r.sectionId === selectedSection.id).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Maintenance Requests ({requests.filter((r) => r.sectionId === selectedSection.id).length})
                  </div>
                  {requests.filter((r) => r.sectionId === selectedSection.id).slice(0, 4).map((req) => (
                    <div key={req.id} style={{ background: 'var(--color-surface-2)', borderRadius: 6, padding: '7px 10px', marginBottom: 6, fontSize: 12 }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{req.maintenanceType}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{req.department.split(' ')[0]}</span>
                        <span className={`badge badge-${req.priority}`} style={{ fontSize: 9 }}>{req.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selectedStation ? (
            <div className="card animate-slide-up">
              <div className="card-header">
                <div>
                  <div className="card-title">{selectedStation.name}</div>
                  <div className="card-subtitle">{selectedStation.code} · {selectedStation.zone}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedStation(null)}>✕</button>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <div style={{ marginBottom: 6 }}>Division: {selectedStation.division}</div>
                <div style={{ marginBottom: 6 }}>Type: {selectedStation.isJunction ? 'Junction Station' : 'Wayside Station'}</div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Info size={15} color="var(--color-text-muted)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Click to explore</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Click on any <strong style={{ color: 'var(--color-text-secondary)' }}>railway section</strong> (line) or <strong style={{ color: 'var(--color-text-secondary)' }}>station</strong> (dot) to view details, active maintenance requests, and scheduled blocks.
              </p>
            </div>
          )}

          {/* Summary cards */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Network Summary</div>
            {[
              { label: 'Total Sections', value: RAILWAY_SECTIONS.length, color: '#3b82f6' },
              { label: 'Stations Mapped', value: STATIONS.length, color: '#8b5cf6' },
              { label: 'Active Requests', value: requests.filter((r) => r.status === 'pending').length, color: '#f59e0b' },
              { label: 'Scheduled Blocks', value: blocks.filter((b) => b.status === 'planned').length, color: '#10b981' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 10, color: 'var(--color-text-muted)', fontSize: 12 }}>SIH DEMO HIGHLIGHT</div>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 6 }}>
              ⚠ 3 requests on Kalyan–Pune Section
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Engineering + S&T + Traction Distribution all need the same section on 28-Aug. AI can combine these into 1 block.
            </div>
            <button className="btn btn-accent btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={() => navigate('/optimizer')}>
              <Zap size={12} /> Run AI Optimizer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, PieChart, Pie, Legend,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { BEFORE_AFTER_DATA, DEPT_REQUEST_DATA, PRIORITY_DATA, TRAFFIC_WINDOWS } from '../data/mockData';
import { useStore } from '../store/useStore';

const TOOLTIP_STYLE = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 8, fontSize: 12,
  color: 'var(--color-text-primary)',
};

export function AnalyticsPage() {
  const { blocks, requests, conflicts } = useStore();

  const before = BEFORE_AFTER_DATA.before;
  const after = BEFORE_AFTER_DATA.after;

  const comparisonData = [
    { metric: 'Total Blocks', before: before.totalBlocks, after: after.totalBlocks, unit: '' },
    { metric: 'Block Hours', before: before.totalBlockHours, after: after.totalBlockHours, unit: 'h' },
    { metric: 'Trains Cancelled', before: before.trainsCancelled, after: after.trainsCancelled, unit: '' },
    { metric: 'Trains Delayed', before: before.trainsDelayed, after: after.trainsDelayed, unit: '' },
    { metric: 'Conflicts', before: before.conflictsOccurred, after: after.conflictsOccurred, unit: '' },
  ];

  const availabilityData = [
    { name: 'Traditional Planning', value: before.assetAvailability, fill: '#ef4444' },
    { name: 'AI-Optimized', value: after.assetAvailability, fill: '#10b981' },
  ];

  const hourlyEfficiencyData = TRAFFIC_WINDOWS.map((w) => ({
    hour: w.label,
    intensity: w.intensity,
    maintenance: w.intensity < 20 ? 80 : w.intensity < 40 ? 40 : 10,
  })).filter((_, i) => i % 2 === 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Performance metrics · Before vs. After AI optimization comparison</p>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 6, padding: '4px 10px' }}>
          📊 Simulated Demo Data — SIH 2026 Prototype
        </div>
      </div>

      {/* ── BEFORE vs AFTER HERO ─────────────────────── */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #0f1e35, #162236)', border: '1px solid var(--color-border-light)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--color-accent)', fontWeight: 700, marginBottom: 8 }}>
            🎯 SIH Demo Scenario – Kalyan–Pune Section (28 Aug 2026)
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>
            Before AI vs After AI Optimization
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            3 separate department requests → 1 combined optimized block
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'start' }}>
          {/* Before */}
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={16} /> Traditional Planning (WITHOUT AI)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {before.departmentBlocks.map((b) => (
                <div key={b.dept} style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f87171', marginBottom: 2 }}>Block: {b.dept}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Separate {b.hours}h block</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(239,68,68,0.3)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Total Blocks', value: `${before.totalBlocks} blocks`, bad: true },
                  { label: 'Total Disruption', value: `${before.totalBlockHours}h`, bad: true },
                  { label: 'Trains Cancelled', value: before.trainsCancelled, bad: true },
                  { label: 'Trains Delayed', value: before.trainsDelayed, bad: true },
                  { label: 'Conflicts', value: before.conflictsOccurred, bad: true },
                  { label: 'Asset Availability', value: `${before.assetAvailability}%`, bad: true },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 60 }}>
            <ArrowRight size={28} color="var(--color-accent)" />
            <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>AI Optimizer</div>
          </div>

          {/* After */}
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} /> AI-Powered Planning (WITH RailAvail)
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 8, padding: '14px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>✓ 1 Combined Optimized Block</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>All 3 departments · 01:00–05:00 IST (lowest traffic)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 8, background: 'rgba(16,185,129,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#34d399' }}>94%</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>AI Optimization Score</div>
            </div>
            <div style={{ borderTop: '1px solid rgba(16,185,129,0.3)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Total Blocks', value: `${after.totalBlocks} block` },
                { label: 'Total Disruption', value: `${after.totalBlockHours}h` },
                { label: 'Trains Cancelled', value: after.trainsCancelled },
                { label: 'Trains Delayed', value: after.trainsDelayed },
                { label: 'Conflicts', value: after.conflictsOccurred },
                { label: 'Asset Availability', value: `${after.assetAvailability}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Improvement metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
          {[
            { metric: '↓ 62%', label: 'Disruption Reduction', color: '#10b981' },
            { metric: '↓ 71%', label: 'Trains Cancelled', color: '#3b82f6' },
            { metric: '↑ 17.4%', label: 'Asset Availability', color: '#f59e0b' },
            { metric: '↓ 100%', label: 'Conflicts Resolved', color: '#8b5cf6' },
          ].map(({ metric, label, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px', textAlign: 'center', border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{metric}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid-2 mb-6">
        {/* Comparison bar chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Before vs After Comparison</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData}>
              <XAxis dataKey="metric" tick={{ fill: '#4a6580', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4a6580', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
              <Bar dataKey="before" name="Before AI" fill="#ef4444" radius={[3, 3, 0, 0]} opacity={0.7} />
              <Bar dataKey="after" name="After AI" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset availability */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Asset Availability Comparison</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '20px 0' }}>
            {availabilityData.map((d) => (
              <div key={d.name} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-surface-3)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={d.fill} strokeWidth="3"
                      strokeDasharray={`${d.value} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: d.fill }}>
                    {d.value}%
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8, maxWidth: 100 }}>{d.name}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
            ↑ {(after.assetAvailability - before.assetAvailability).toFixed(1)}% improvement with AI optimization
          </div>
        </div>

        {/* Hourly efficiency */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Optimal Maintenance Windows</div>
            <div className="card-subtitle">Traffic intensity vs maintenance opportunity</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyEfficiencyData}>
              <defs>
                <linearGradient id="trafficArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="maintArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="hour" tick={{ fill: '#4a6580', fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4a6580', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--color-text-muted)' }} />
              <Area type="monotone" dataKey="intensity" name="Train Traffic %" stroke="#ef4444" fill="url(#trafficArea)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="maintenance" name="Maintenance Opportunity %" stroke="#10b981" fill="url(#maintArea)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department stats */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Department Metrics</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DEPT_REQUEST_DATA.map((d) => (
              <div key={d.dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{d.dept}</span>
                  <span style={{ color: d.color, fontWeight: 700 }}>{d.count} requests</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(d.count / 5) * 100}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}99)` }} />
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Requests this month', value: requests.length },
                { label: 'Blocks generated', value: blocks.length },
                { label: 'Conflicts detected', value: conflicts.length },
                { label: 'Resolved', value: conflicts.filter(c => c.status === 'resolved').length },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

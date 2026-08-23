import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  ClipboardList, Zap, AlertTriangle, CheckCircle2,
  TrendingUp, Activity, Clock, ArrowRight, PlusCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEPT_REQUEST_DATA, PRIORITY_DATA, TRAFFIC_WINDOWS, WEEKLY_REQUESTS } from '../data/mockData';
import { format } from 'date-fns';

function KpiCard({ label, value, unit, color, icon: Icon, change }: {
  label: string; value: string | number; unit?: string;
  color: string; icon: React.ElementType; change?: string;
}) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-icon"><Icon size={52} /></div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {value}
        {unit && <span style={{ fontSize: 16, color: 'var(--color-text-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
      {change && <div className="kpi-change">{change}</div>}
    </div>
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: 'var(--color-text-primary)',
};

export function DashboardPage() {
  const { requests, blocks, conflicts, user } = useStore();
  const navigate = useNavigate();
  const pending = requests.filter((r) => r.status === 'pending').length;
  const openConflicts = conflicts.filter((c) => c.status === 'open').length;
  const resolvedConflicts = conflicts.filter((c) => c.status === 'resolved').length;

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const trafficData = TRAFFIC_WINDOWS.filter((_, i) => i % 3 === 0);

  return (
    <div className="animate-fade-in">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2347 0%, #1a3a6b 60%, #162236 100%)',
        border: '1px solid var(--color-border)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
            {format(new Date(), 'EEEE, dd MMMM yyyy')} · Central Railway Zone · Mumbai Division
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests/new')}>
            <PlusCircle size={13} /> New Request
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => navigate('/optimizer')}>
            <Zap size={13} /> Run AI Optimizer
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid-4 mb-6">
        <KpiCard label="Total Requests" value={requests.length} color="blue" icon={ClipboardList} change={`${pending} pending review`} />
        <KpiCard label="Pending Requests" value={pending} color="orange" icon={Clock} change="Awaiting optimization" />
        <KpiCard label="Optimized Blocks" value={blocks.length} color="green" icon={Zap} change="AI-generated plans" />
        <KpiCard label="Open Conflicts" value={openConflicts} color="red" icon={AlertTriangle} change={`${resolvedConflicts} resolved`} />
        <KpiCard label="Disruption Reduction" value="62" unit="%" color="teal" icon={TrendingUp} change="vs. manual planning" />
        <KpiCard label="Asset Availability" value="87.4" unit="%" color="green" icon={Activity} change="Target: 90%" />
        <KpiCard label="Hours Saved" value="6.5" unit="h" color="purple" icon={CheckCircle2} change="Per optimization cycle" />
        <KpiCard label="Trains Protected" value="22" color="indigo" icon={Activity} change="From disruption this week" />
      </div>

      {/* Charts Row */}
      <div className="grid-3 mb-6" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        {/* Traffic intensity */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Train Traffic Intensity</div>
              <div className="card-subtitle">Hourly traffic pattern – CR Zone (typical weekday)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TRAFFIC_WINDOWS}>
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2557a7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2557a7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#4a6580', fontSize: 9 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill: '#4a6580', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(v: any) => [`${v}%`, 'Intensity']}
              />
              <Area type="monotone" dataKey="intensity" stroke="#3b82f6" fill="url(#trafficGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* By Department */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Requests by Dept</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DEPT_REQUEST_DATA} layout="vertical">
              <XAxis type="number" tick={{ fill: '#4a6580', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="dept" tick={{ fill: '#7a9bb5', fontSize: 11 }} tickLine={false} axisLine={false} width={88} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {DEPT_REQUEST_DATA.map((entry) => (
                  <Cell key={entry.dept} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Donut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Priority Distribution</div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={PRIORITY_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3}>
                {PRIORITY_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {PRIORITY_DATA.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests + Quick actions */}
      <div className="grid-2">
        {/* Recent requests */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Maintenance Requests</div>
              <div className="card-subtitle">Latest submissions across all departments</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>
              View All <ArrowRight size={13} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Type</th>
                <th>Dept</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req) => (
                <tr key={req.id}>
                  <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{req.requestNumber}</td>
                  <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.maintenanceType}</td>
                  <td>
                    <span className={`badge badge-${req.department === 'Engineering' ? 'engineering' : req.department === 'Traction Distribution' ? 'traction' : req.department === 'Signal & Telecommunication' ? 'signaling' : 'operations'}`} style={{ fontSize: 10 }}>
                      {req.department === 'Signal & Telecommunication' ? 'S&T' : req.department === 'Traction Distribution' ? 'TD' : req.department}
                    </span>
                  </td>
                  <td><span className={`badge badge-${req.priority}`}>{req.priority}</span></td>
                  <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIH Demo Highlight */}
        <div className="card" style={{ borderColor: 'rgba(255,107,0,0.3)', background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(255,107,0,0.04) 100%)' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ color: '#ff8c38' }}>🎯 SIH Demo Scenario</div>
              <div className="card-subtitle">AI optimization showcase for judges</div>
            </div>
            <button className="btn btn-accent btn-sm" onClick={() => navigate('/optimizer')}>
              Run Demo <Zap size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {[
              { dept: 'Engineering', req: 'REQ-2026-001', type: 'Track Geometry', km: 'Km 45–52', color: '#3b82f6' },
              { dept: 'S&T', req: 'REQ-2026-002', type: 'Signal Cable Replacement', km: 'Km 47–50', color: '#10b981' },
              { dept: 'Traction', req: 'REQ-2026-003', type: 'OHE Maintenance', km: 'Km 44–51', color: '#f59e0b' },
            ].map((item) => (
              <div key={item.req} style={{
                background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                border: `1px solid ${item.color}30`
              }}>
                <div style={{ width: 3, height: 32, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.dept} · Kalyan–Pune Section · {item.km}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: item.color, background: item.color + '20', padding: '2px 6px', borderRadius: 4 }}>{item.req}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: 12 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>3</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Separate blocks (before)</div>
              <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>10.5 hrs disruption</div>
            </div>
            <ArrowRight size={20} color="var(--color-accent)" />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>1</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Combined block (after AI)</div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>4 hrs disruption</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <div style={{ color: '#10b981', fontWeight: 700 }}>↓ 62% Disruption Reduction</div>
            <div style={{ color: '#3b82f6', fontWeight: 700 }}>↑ 17.4% Asset Availability</div>
          </div>
        </div>
      </div>
    </div>
  );
}

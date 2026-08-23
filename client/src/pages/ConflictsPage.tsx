import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Zap, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
};

const TYPE_LABELS: Record<string, string> = {
  track_overlap: '🛤️ Track Overlap',
  time_overlap: '⏰ Time Conflict',
  resource_conflict: '🔧 Resource Conflict',
  traffic_conflict: '🚆 Traffic Conflict',
  dept_incompatibility: '⚠️ Dept Incompatibility',
};

export function ConflictsPage() {
  const { conflicts, resolveConflict, user, requests } = useStore();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = conflicts.filter((c) => filter === 'all' || c.status === filter);
  const openCount = conflicts.filter((c) => c.status === 'open').length;
  const resolvedCount = conflicts.filter((c) => c.status === 'resolved').length;

  const getRequestsForConflict = (ids: string[]) =>
    requests.filter((r) => ids.includes(r.id));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conflict Management</h1>
          <p className="page-subtitle">AI-detected scheduling conflicts and resolution suggestions</p>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Conflicts', value: conflicts.length, color: '#3b82f6' },
          { label: 'Open', value: openCount, color: '#ef4444' },
          { label: 'Resolved', value: resolvedCount, color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'open', 'resolved'] as const).map((f) => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0 5px', fontSize: 11 }}>
              {f === 'all' ? conflicts.length : f === 'open' ? openCount : resolvedCount}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><CheckCircle size={28} color="#10b981" /></div>
            <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>No conflicts found</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {filter === 'open' ? 'All conflicts have been resolved! ✓' : 'No conflicts match the current filter.'}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((conflict) => {
            const isExpanded = expandedId === conflict.id;
            const conflictReqs = getRequestsForConflict(conflict.requestIds);
            const color = SEVERITY_COLORS[conflict.severity] || '#f59e0b';

            return (
              <div key={conflict.id} className={`conflict-card severity-${conflict.severity} animate-slide-up`}>
                <div style={{ display: 'flex', gap: 12, cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : conflict.id)}>
                  {/* Severity icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: color + '20', border: `1px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <AlertTriangle size={20} color={color} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{conflict.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color, background: color + '20', padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                            {conflict.severity} severity
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '1px 6px', borderRadius: 4 }}>
                            {TYPE_LABELS[conflict.type] || conflict.type}
                          </span>
                          <span className={`badge badge-${conflict.status}`} style={{ fontSize: 9 }}>{conflict.status}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(conflict.detectedAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                      {conflict.description}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ marginTop: 16, animation: 'slide-in-up 0.2s ease' }}>
                    {/* Affected requests */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                        Affected Requests ({conflictReqs.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {conflictReqs.map((req) => (
                          <div key={req.id} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '8px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ width: 3, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{req.requestNumber} – {req.maintenanceType}</div>
                              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{req.department} · {req.sectionName} · Km {req.fromKm}–{req.toKm} · {req.preferredDate}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Suggestion */}
                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <Zap size={14} color="#34d399" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>AI Suggested Resolution</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        {conflict.aiSuggestion}
                      </div>
                    </div>

                    {/* Actions */}
                    {conflict.status === 'open' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-success"
                          onClick={() => resolveConflict(conflict.id, user?.name || 'System')}
                        >
                          <CheckCircle size={14} /> Apply AI Suggestion & Resolve
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => resolveConflict(conflict.id, 'manual')}>
                          Mark Resolved Manually
                        </button>
                      </div>
                    )}
                    {conflict.status === 'resolved' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#34d399' }}>
                        <CheckCircle size={15} />
                        Resolved by {conflict.resolvedBy} · {conflict.resolvedAt ? new Date(conflict.resolvedAt).toLocaleDateString('en-IN') : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

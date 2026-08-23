import React, { useState, useMemo } from 'react';
import { CalendarCheck, Clock, Users, Zap, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import type { MaintenanceBlock } from '../types';

const DEPT_BADGE: Record<string, { short: string; cls: string }> = {
  Engineering: { short: 'ENG', cls: 'engineering' },
  'Traction Distribution': { short: 'TD', cls: 'traction' },
  'Signal & Telecommunication': { short: 'S&T', cls: 'signaling' },
  Operations: { short: 'OPS', cls: 'operations' },
};

const SCORE_COLOR = (score: number) =>
  score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';

const GANTT_HOURS = Array.from({ length: 24 }, (_, i) => i);
const GANTT_BAR_COLORS = ['#2557a7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

function GanttBar({ block, color }: { block: MaintenanceBlock; color: string }) {
  const startH = parseInt(block.startTime.split(':')[0]);
  const startM = parseInt(block.startTime.split(':')[1]);
  const endH = parseInt(block.endTime.split(':')[0]);
  const endM = parseInt(block.endTime.split(':')[1]);

  const startFrac = (startH + startM / 60) / 24;
  const endFrac = (endH + endM / 60) / 24;
  const widthFrac = endFrac - startFrac;

  return (
    <div
      className="gantt-bar"
      style={{
        left: `${startFrac * 100}%`,
        width: `${widthFrac * 100}%`,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        minWidth: 50,
      }}
      title={`${block.blockNumber} | ${block.startTime}–${block.endTime}`}
    >
      {widthFrac > 0.05 && <span>{block.blockNumber}</span>}
    </div>
  );
}

export function BlockPlansPage() {
  const { blocks, cancelBlock } = useStore();
  const navigate = useNavigate();
  const [view, setView] = useState<'table' | 'gantt'>('table');
  const [selected, setSelected] = useState<MaintenanceBlock | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const filtered = useMemo(() => {
    return blocks.filter((b) => {
      const matchStatus = filterStatus === 'all' || b.status === filterStatus;
      const matchDate = !filterDate || b.date === filterDate;
      return matchStatus && matchDate;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [blocks, filterStatus, filterDate]);

  // Group by date for Gantt
  const blocksByDate = useMemo(() => {
    const map: Record<string, MaintenanceBlock[]> = {};
    filtered.forEach((b) => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [filtered]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Generated Block Plans</h1>
          <p className="page-subtitle">{filtered.length} maintenance blocks · AI-optimized schedule</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${view === 'table' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setView('table')}>
            Table
          </button>
          <button className={`btn ${view === 'gantt' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setView('gantt')}>
            Gantt Timeline
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => navigate('/optimizer')}>
            <Zap size={13} /> Re-optimize
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 150 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" className="form-control" style={{ width: 160 }} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          {filterDate && <button className="btn btn-ghost btn-sm" onClick={() => setFilterDate('')}>Clear</button>}
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Blocks', value: blocks.length, color: '#3b82f6' },
          { label: 'Multi-dept Combined', value: blocks.filter((b) => b.departmentsInvolved.length > 1).length, color: '#10b981' },
          { label: 'Avg AI Score', value: `${Math.round(blocks.reduce((a, b) => a + b.optimizationScore, 0) / (blocks.length || 1))}%`, color: '#f59e0b' },
          { label: 'Total Block Hours', value: `${Math.round(blocks.reduce((a, b) => a + b.duration, 0) * 10) / 10}h`, color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><CalendarCheck size={28} /></div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>No block plans yet</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Run the AI optimizer to generate an optimized block schedule</div>
              <button className="btn btn-accent" onClick={() => navigate('/optimizer')}><Zap size={14} /> Go to Optimizer</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Block #</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Section</th>
                    <th>Departments</th>
                    <th>Activities</th>
                    <th>Priority</th>
                    <th>Train Impact</th>
                    <th>AI Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((block) => (
                    <tr key={block.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(block)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 600 }}>{block.blockNumber}</td>
                      <td style={{ fontSize: 12 }}>{block.date}</td>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{block.startTime}–{block.endTime}</td>
                      <td>
                        <div style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{block.sectionName}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Km {block.fromKm}–{block.toKm}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {block.departmentsInvolved.map((d) => {
                            const db = DEPT_BADGE[d];
                            return <span key={d} className={`badge badge-${db?.cls || 'operations'}`} style={{ fontSize: 9 }}>{db?.short}</span>;
                          })}
                        </div>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {block.activitiesCombined.join(', ')}
                      </td>
                      <td><span className={`badge badge-${block.priority}`}>{block.priority}</span></td>
                      <td style={{ fontSize: 12 }}>{block.expectedTrainImpact} trains</td>
                      <td>
                        <div style={{ fontSize: 16, fontWeight: 800, color: SCORE_COLOR(block.optimizationScore) }}>
                          {block.optimizationScore}%
                        </div>
                      </td>
                      <td><span className={`badge badge-${block.status}`}>{block.status}</span></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {block.status === 'planned' && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelBlock(block.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Gantt View */}
      {view === 'gantt' && (
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><CalendarCheck size={28} /></div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No blocks to display</div>
            </div>
          ) : (
            <div className="gantt-container" style={{ border: 'none' }}>
              {/* Hour headers */}
              <div className="gantt-header">
                <div className="gantt-label" style={{ background: 'var(--color-surface-2)' }}>Block / Section</div>
                <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                  {GANTT_HOURS.filter((h) => h % 3 === 0).map((h) => (
                    <div key={h} style={{
                      position: 'absolute',
                      left: `${(h / 24) * 100}%`,
                      fontSize: 10, color: 'var(--color-text-muted)',
                      padding: '6px 4px', borderLeft: '1px solid var(--color-border)'
                    }}>
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                  {/* Low-traffic highlight */}
                  <div style={{ position: 'absolute', left: `${(1 / 24) * 100}%`, width: `${(3 / 24) * 100}%`, top: 0, bottom: 0, background: 'rgba(16,185,129,0.06)', borderLeft: '1px dashed rgba(16,185,129,0.3)' }} />
                  <div style={{ height: 28 }} />
                </div>
              </div>

              {Object.entries(blocksByDate).map(([date, dateBlocks]) => (
                <React.Fragment key={date}>
                  <div style={{ padding: '6px 14px', background: 'var(--color-surface-3)', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    📅 {date}
                  </div>
                  {dateBlocks.map((block, idx) => (
                    <div key={block.id} className="gantt-row" onClick={() => setSelected(block)}>
                      <div className="gantt-label">
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>{block.blockNumber}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{block.sectionName.split('–')[0].trim()}</div>
                      </div>
                      <div className="gantt-bar-container">
                        <GanttBar block={block} color={GANTT_BAR_COLORS[idx % GANTT_BAR_COLORS.length]} />
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              <div style={{ padding: '8px 14px', display: 'flex', gap: 16, background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
                  <div style={{ width: 16, height: 3, background: 'rgba(16,185,129,0.4)', borderRadius: 2 }} />
                  01:00–04:00 Optimal window (low traffic)
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>Click any bar for details</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Block Detail Modal */}
      {selected && (
        <div className="optimization-overlay" onClick={() => setSelected(null)}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 14, padding: 28, maxWidth: 580, width: '95%', animation: 'slide-in-up 0.25s ease' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{selected.blockNumber}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span className={`badge badge-${selected.priority}`}>{selected.priority}</span>
                  <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: SCORE_COLOR(selected.optimizationScore), background: SCORE_COLOR(selected.optimizationScore) + '20', padding: '2px 6px', borderRadius: 4 }}>
                    AI: {selected.optimizationScore}%
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Date', value: selected.date },
                { label: 'Time Window', value: `${selected.startTime}–${selected.endTime} (${selected.duration}h)` },
                { label: 'Section', value: selected.sectionName },
                { label: 'Location', value: `Km ${selected.fromKm}–${selected.toKm}` },
                { label: 'Train Impact', value: `${selected.expectedTrainImpact} trains` },
                { label: 'Asset Availability ↑', value: `+${selected.assetAvailabilityImprovement.toFixed(1)}%` },
                { label: 'Generated By', value: selected.generatedBy === 'ai' ? '🤖 AI Optimizer' : '👤 Manual' },
                { label: 'Requests Combined', value: `${selected.requestIds.length} request(s)` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 6 }}>Departments Involved</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {selected.departmentsInvolved.map((d) => {
                  const db = DEPT_BADGE[d];
                  return <span key={d} className={`badge badge-${db?.cls || 'operations'}`}>{d}</span>;
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 6 }}>Activities Combined</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selected.activitiesCombined.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary-light)', flexShrink: 0 }} />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {selected.notes && (
              <div style={{ marginTop: 12, background: 'rgba(59,130,246,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: '#60a5fa' }}>Note:</strong> {selected.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

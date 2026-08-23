import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, CheckCircle, Clock, TrendingUp, Users, GitMerge,
  BarChart2, ArrowRight, Brain, Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useStore } from '../store/useStore';
import { TRAFFIC_WINDOWS } from '../data/mockData';
import type { MaintenanceBlock } from '../types';

const SCORE_COLOR = (score: number) =>
  score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';

const DEPT_BADGE: Record<string, { short: string; cls: string }> = {
  Engineering: { short: 'ENG', cls: 'engineering' },
  'Traction Distribution': { short: 'TD', cls: 'traction' },
  'Signal & Telecommunication': { short: 'S&T', cls: 'signaling' },
  Operations: { short: 'OPS', cls: 'operations' },
};

export function OptimizerPage() {
  const { requests, optimizationResult, isOptimizing, runOptimization, clearOptimization } = useStore();
  const navigate = useNavigate();

  const eligible = requests.filter((r) => r.status === 'pending');
  const combinable = eligible.filter((r) => r.canBeCombined);

  const trafficChartData = TRAFFIC_WINDOWS.map((w) => ({
    hour: w.label,
    intensity: w.intensity,
  })).filter((_, i) => i % 2 === 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Block Optimizer</h1>
          <p className="page-subtitle">Intelligent maintenance block planning using multi-factor optimization</p>
        </div>
        {optimizationResult && (
          <button className="btn btn-ghost btn-sm" onClick={clearOptimization}>
            Reset
          </button>
        )}
      </div>

      {/* Optimization Loading Overlay */}
      {isOptimizing && (
        <div className="optimization-overlay">
          <div className="optimization-modal">
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 20px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '3px solid var(--color-primary-light)', opacity: 0.3,
                animation: 'pulse-ring 1.5s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute', inset: 8, borderRadius: '50%',
                border: '3px solid var(--color-accent)', opacity: 0.5,
                animation: 'pulse-ring 1.5s ease-in-out infinite 0.3s'
              }} />
              <div style={{
                position: 'absolute', inset: 16, borderRadius: '50%',
                background: 'rgba(37,87,167,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Brain size={28} color="var(--color-primary-light)" />
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              AI Optimizer Running
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
              Analyzing {eligible.length} requests · Clustering by section · Scoring time windows...
            </div>
            {['Clustering requests by location...', 'Analyzing traffic patterns...', 'Checking department compatibility...', 'Calculating optimization scores...', 'Generating block schedule...'].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'left' }}>
                <div className="spinner" style={{ width: 12, height: 12 }} />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left: Algorithm details + requests */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Algorithm Explainer */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={16} color="var(--color-accent)" /> Optimization Algorithm
                </div>
                <div className="card-subtitle">Rule-based weighted scoring (ML-ready architecture)</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {[
                { factor: 'Location Proximity', weight: '30%', color: '#3b82f6', icon: '📍' },
                { factor: 'Time Window Efficiency', weight: '25%', color: '#8b5cf6', icon: '⏰' },
                { factor: 'Traffic Impact Reduction', weight: '20%', color: '#f59e0b', icon: '🚆' },
                { factor: 'Resource Consolidation', weight: '15%', color: '#10b981', icon: '🔧' },
                { factor: 'Priority Alignment', weight: '10%', color: '#ef4444', icon: '🎯' },
              ].map(({ factor, weight, color, icon }) => (
                <div key={factor} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '12px 10px', textAlign: 'center', border: `1px solid ${color}30` }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color, marginBottom: 4 }}>{weight}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{factor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Eligible Requests */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Eligible Requests ({eligible.length})</div>
                <div className="card-subtitle">{combinable.length} marked as combinable — ready for merge optimization</div>
              </div>
            </div>
            {eligible.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><CheckCircle size={28} /></div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>No pending requests</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>All requests have been scheduled</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eligible.slice(0, 8).map((req) => {
                  const dept = DEPT_BADGE[req.department];
                  return (
                    <div key={req.id} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--color-border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{req.requestNumber}</span>
                          <span className={`badge badge-${dept?.cls || 'operations'}`} style={{ fontSize: 9 }}>{dept?.short}</span>
                          <span className={`badge badge-${req.priority}`} style={{ fontSize: 9 }}>{req.priority}</span>
                          {req.canBeCombined && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>COMBINABLE</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{req.maintenanceType}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{req.sectionName} · Km {req.fromKm}–{req.toKm} · {req.preferredDate} · {req.estimatedDuration}h</div>
                      </div>
                    </div>
                  );
                })}
                {eligible.length > 8 && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '6px 0' }}>
                    +{eligible.length - 8} more requests
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Result blocks */}
          {optimizationResult && (
            <div className="card animate-slide-up">
              <div className="card-header">
                <div>
                  <div className="card-title" style={{ color: '#10b981' }}>✓ Optimization Complete</div>
                  <div className="card-subtitle">{optimizationResult.blocks.length} blocks generated · Score: {optimizationResult.score}%</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/blocks')}>
                  View Plans <ArrowRight size={13} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Blocks Before', value: optimizationResult.blocksBefore, color: '#ef4444' },
                  { label: 'Blocks After', value: optimizationResult.blocksAfter, color: '#10b981' },
                  { label: 'Hours Saved', value: `${optimizationResult.hoursSaved}h`, color: '#3b82f6' },
                  { label: 'Disruption ↓', value: `${optimizationResult.disruptionReduction}%`, color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {optimizationResult.blocks.map((block) => (
                <div key={block.id} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '12px 14px', marginBottom: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{block.blockNumber}</span>
                      {block.requestIds.length > 1 && (
                        <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                          {block.requestIds.length} MERGED
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: SCORE_COLOR(block.optimizationScore) }}>
                        {block.optimizationScore}%
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>AI Score</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    {block.sectionName} · {block.date} · {block.startTime}–{block.endTime} ({block.duration}h)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {block.departmentsInvolved.map((d) => {
                      const db = DEPT_BADGE[d];
                      return <span key={d} className={`badge badge-${db?.cls || 'operations'}`} style={{ fontSize: 9 }}>{db?.short || d}</span>;
                    })}
                    {block.activitiesCombined.map((a) => (
                      <span key={a} style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'var(--color-surface-3)', padding: '1px 6px', borderRadius: 4 }}>{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Traffic + Actions */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* CTA */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #0f2347, #1a3a6b)', border: '1px solid rgba(255,107,0,0.3)', textAlign: 'center', padding: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,107,0,0.15)', border: '2px solid rgba(255,107,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Zap size={30} color="#ff8c38" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>Generate Optimized Block Plan</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.6 }}>
              AI will analyze {eligible.length} pending requests and generate an optimized block schedule.
            </div>
            <button
              className="btn btn-accent btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={runOptimization}
              disabled={isOptimizing || eligible.length === 0}
            >
              {isOptimizing ? <><span className="spinner" /> Optimizing...</> : <><Zap size={16} /> Run AI Optimizer</>}
            </button>
            {optimizationResult && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>
                ✓ Last run: Score {optimizationResult.score}% · {optimizationResult.blocksAfter} blocks generated
              </div>
            )}
          </div>

          {/* Traffic Window */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Traffic Intensity by Hour</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trafficChartData}>
                <XAxis dataKey="hour" tick={{ fill: '#4a6580', fontSize: 8 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4a6580', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11, color: 'var(--color-text-primary)' }}
                  formatter={(v: any) => [`${v}%`, 'Traffic']}
                />
                <Bar dataKey="intensity" radius={[2, 2, 0, 0]}>
                  {trafficChartData.map((d) => (
                    <Cell key={d.hour} fill={d.intensity > 70 ? '#ef4444' : d.intensity > 40 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {[{ c: '#10b981', l: '< 40% (Best)' }, { c: '#f59e0b', l: '40–70%' }, { c: '#ef4444', l: '> 70% (Avoid)' }].map(({ c, l }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-text-muted)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Stats summary */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Current Input Summary</div>
            {[
              { label: 'Total pending requests', value: eligible.length },
              { label: 'Combinable requests', value: combinable.length },
              { label: 'Non-combinable', value: eligible.length - combinable.length },
              { label: 'Unique sections', value: new Set(eligible.map(r => r.sectionId)).size },
              { label: 'Critical priority', value: eligible.filter(r => r.priority === 'critical').length },
              { label: 'High priority', value: eligible.filter(r => r.priority === 'high').length },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: 12 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Settings, Users, Shield, Database, Bell, Save, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEMO_USERS } from '../data/mockData';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrator: ['View Dashboard', 'Manage Users', 'Approve Requests', 'Run Optimizer', 'View All Data', 'Manage Conflicts', 'Export Reports'],
  engineering: ['Submit Requests', 'View Own Requests', 'View Dashboard', 'View Network', 'View Blocks'],
  traction: ['Submit Requests', 'View Own Requests', 'View Dashboard', 'View Network', 'View Blocks'],
  signaling: ['Submit Requests', 'View Own Requests', 'View Dashboard', 'View Network', 'View Blocks'],
  operations: ['View All Requests', 'Approve Requests', 'Run Optimizer', 'View Dashboard', 'Manage Conflicts', 'View Analytics'],
};

const ROLE_COLORS: Record<string, string> = {
  administrator: '#ef4444',
  engineering: '#3b82f6',
  traction: '#f59e0b',
  signaling: '#10b981',
  operations: '#8b5cf6',
};

export function SettingsPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'system' | 'notifications'>('users');
  const [saved, setSaved] = useState(false);

  const isAdmin = user?.role === 'administrator';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Administration</h1>
          <p className="page-subtitle">System configuration, user management, and permissions</p>
        </div>
        {saved && (
          <div className="alert alert-success" style={{ padding: '8px 14px' }}>
            <CheckCircle size={14} /> Settings saved successfully
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="alert alert-warning mb-4">
          <Shield size={14} /> You have read-only access to this section. Contact your Administrator for changes.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'permissions', label: 'Permissions', icon: Shield },
          { id: 'system', label: 'System Config', icon: Settings },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '10px 16px', fontSize: 13, fontWeight: 500,
              color: activeTab === id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              borderBottom: `2px solid ${activeTab === id ? 'var(--color-accent)' : 'transparent'}`,
              marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">User Management</div>
              <div className="card-subtitle">{DEMO_USERS.length} users registered · Demo accounts</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Division</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_USERS.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: ROLE_COLORS[u.role], display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0
                      }}>{u.avatar}</div>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{u.email}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLORS[u.role], background: ROLE_COLORS[u.role] + '20', padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{u.department}</td>
                  <td style={{ fontSize: 12 }}>{u.division}</td>
                  <td>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 10 }}>
                      ● Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Role Permissions Matrix</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
              <div key={role} style={{ background: 'var(--color-surface-2)', borderRadius: 10, padding: '14px 16px', border: `1px solid ${ROLE_COLORS[role]}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: ROLE_COLORS[role] }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: ROLE_COLORS[role], textTransform: 'capitalize' }}>{role}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {perms.map((p) => (
                    <span key={p} style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '3px 8px' }}>
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Config Tab */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>AI Optimization Settings</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Location Proximity Weight', value: '30', unit: '%' },
                { label: 'Time Window Efficiency Weight', value: '25', unit: '%' },
                { label: 'Traffic Impact Weight', value: '20', unit: '%' },
                { label: 'Resource Consolidation Weight', value: '15', unit: '%' },
                { label: 'Priority Alignment Weight', value: '10', unit: '%' },
                { label: 'Minimum Block Gap', value: '30', unit: 'min' },
                { label: 'Max Departments per Block', value: '4', unit: '' },
                { label: 'Low Traffic Threshold', value: '30', unit: '%' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="form-group">
                  <label className="form-label">{label}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="form-control" type="number" defaultValue={value} disabled={!isAdmin} />
                    {unit && <span style={{ padding: '9px 12px', color: 'var(--color-text-muted)', fontSize: 13, background: 'var(--color-surface-3)', borderRadius: 8, border: '1px solid var(--color-border)' }}>{unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>System Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Application', value: 'RailAvail – SIH 2026 Prototype' },
                { label: 'Version', value: 'v1.0.0-sih2026' },
                { label: 'Problem Statement', value: 'PS-26027' },
                { label: 'AI Engine', value: 'Rule-based scoring (ML-replaceable)' },
                { label: 'Database', value: 'In-memory (demo) / SQLite' },
                { label: 'Railway Zone', value: 'Central Railway (CR)' },
                { label: 'Data Status', value: '⚠ Simulated Demo Data' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <button className="btn btn-primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>
              <Save size={14} /> Save Configuration
            </button>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Notification Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'New maintenance request submitted', enabled: true },
              { label: 'Request status change (approved/rejected)', enabled: true },
              { label: 'AI optimization complete', enabled: true },
              { label: 'New conflict detected', enabled: true },
              { label: 'Conflict resolved', enabled: false },
              { label: 'Block plan generated', enabled: true },
              { label: 'Block cancelled', enabled: true },
              { label: 'Weekly analytics report', enabled: false },
            ].map(({ label, enabled }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <input type="checkbox" defaultChecked={enabled} disabled={!isAdmin} style={{ accentColor: 'var(--color-primary-light)', width: 15, height: 15 }} />
                  <span style={{ color: enabled ? '#34d399' : 'var(--color-text-muted)' }}>{enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
            ))}
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 16 }}>
              <Save size={14} /> Save Preferences
            </button>
          )}
        </div>
      )}
    </div>
  );
}

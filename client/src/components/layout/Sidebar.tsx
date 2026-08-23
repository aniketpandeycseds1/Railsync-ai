import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, PlusCircle, Map, Zap,
  CalendarCheck, AlertTriangle, BarChart3, MessageSquareMore,
  Settings, Train, LogOut, Shield
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/requests', icon: ClipboardList, label: 'Maintenance Requests' },
  { to: '/requests/new', icon: PlusCircle, label: 'Submit Request' },
  { to: '/network', icon: Map, label: 'Railway Network' },
  { to: '/optimizer', icon: Zap, label: 'AI Block Optimizer' },
  { to: '/blocks', icon: CalendarCheck, label: 'Block Plans' },
  { to: '/conflicts', icon: AlertTriangle, label: 'Conflict Management' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics & Reports' },
  { to: '/assistant', icon: MessageSquareMore, label: 'RailAvail Assistant' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const ROLE_LABELS: Record<string, string> = {
  administrator: 'Administrator',
  engineering: 'Engineering Dept.',
  traction: 'Traction Distribution',
  signaling: 'Signal & Telecom',
  operations: 'Operations Controller',
};

const ROLE_COLORS: Record<string, string> = {
  administrator: '#ef4444',
  engineering: '#3b82f6',
  traction: '#f59e0b',
  signaling: '#10b981',
  operations: '#8b5cf6',
};

export function Sidebar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #2557a7, #ff6b00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Train size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-title">RailAvail</div>
            <div className="sidebar-logo-sub">SIH 2026 · PS-26027</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: ROLE_COLORS[user.role] || '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {user.avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10.5, color: ROLE_COLORS[user.role] || 'var(--color-text-muted)', fontWeight: 500 }}>
                {ROLE_LABELS[user.role]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ padding: '8px 0', flex: 1 }}>
        <div className="sidebar-section-title">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              clsx('sidebar-nav-item', isActive && 'active')
            }
          >
            <item.icon size={17} className="nav-icon" />
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Shield size={11} />
          Indian Railways · Central Railway Zone
        </div>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

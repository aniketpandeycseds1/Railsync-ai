import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Wifi } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Operations Dashboard', subtitle: 'Overview of railway maintenance operations' },
  '/requests': { title: 'Maintenance Requests', subtitle: 'All submitted maintenance work orders' },
  '/requests/new': { title: 'Submit Maintenance Request', subtitle: 'Create a new maintenance work request' },
  '/network': { title: 'Railway Network View', subtitle: 'Interactive network map and section status' },
  '/optimizer': { title: 'AI Block Optimizer', subtitle: 'AI-powered maintenance block planning engine' },
  '/blocks': { title: 'Generated Block Plans', subtitle: 'Optimized maintenance block schedule' },
  '/conflicts': { title: 'Conflict Management', subtitle: 'Detected conflicts and AI resolutions' },
  '/analytics': { title: 'Analytics & Reports', subtitle: 'Performance metrics and before/after comparison' },
  '/assistant': { title: 'RailAvail Assistant', subtitle: 'AI-powered intelligent query assistant' },
  '/settings': { title: 'Settings & Administration', subtitle: 'System configuration and user management' },
};

export function Topbar() {
  const location = useLocation();
  const { conflicts } = useStore();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'RailAvail', subtitle: '' };
  const openConflicts = conflicts.filter((c) => c.status === 'open').length;

  return (
    <div className="topbar">
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {pageInfo.title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
          {pageInfo.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-success)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 6px var(--color-success)' }} />
          Live · {format(new Date(), 'HH:mm')} IST
        </div>

        {/* Conflicts bell */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
            <Bell size={15} />
          </button>
          {openConflicts > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: '#ef4444', color: 'white',
              fontSize: 9, fontWeight: 700, borderRadius: '50%',
              width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--color-surface)'
            }}>
              {openConflicts}
            </span>
          )}
        </div>

        {/* Demo badge */}
        <div style={{
          background: 'rgba(255,107,0,0.1)', color: 'var(--color-accent)',
          border: '1px solid rgba(255,107,0,0.3)',
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.8px'
        }}>
          Demo Mode
        </div>
      </div>
    </div>
  );
}

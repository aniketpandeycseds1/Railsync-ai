import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, PlusCircle, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import type { MaintenanceRequest } from '../types';

const DEPT_SHORT: Record<string, string> = {
  'Engineering': 'ENG',
  'Traction Distribution': 'TD',
  'Signal & Telecommunication': 'S&T',
  'Operations': 'OPS',
};

const DEPT_CLASS: Record<string, string> = {
  'Engineering': 'engineering',
  'Traction Distribution': 'traction',
  'Signal & Telecommunication': 'signaling',
  'Operations': 'operations',
};

export function RequestsPage() {
  const { requests, updateRequestStatus, user } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.maintenanceType.toLowerCase().includes(search.toLowerCase()) ||
        r.sectionName.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'all' || r.department === filterDept;
      const matchPriority = filterPriority === 'all' || r.priority === filterPriority;
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchSearch && matchDept && matchPriority && matchStatus;
    });
  }, [requests, search, filterDept, filterPriority, filterStatus]);

  const isAdmin = user?.role === 'administrator' || user?.role === 'operations';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Requests</h1>
          <p className="page-subtitle">{filtered.length} of {requests.length} requests shown</p>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('/requests/new')}>
          <PlusCircle size={15} /> Submit New Request
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by request #, type, section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 170 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="all">All Departments</option>
            <option>Engineering</option>
            <option>Traction Distribution</option>
            <option>Signal & Telecommunication</option>
            <option>Operations</option>
          </select>
          <select className="form-control" style={{ width: 140 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="form-control" style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={28} /></div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>No requests found</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Department</th>
                  <th>Maintenance Type</th>
                  <th>Section / Location</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Combinable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{req.requestNumber}</td>
                    <td>
                      <span className={`badge badge-${DEPT_CLASS[req.department] || 'operations'}`}>
                        {DEPT_SHORT[req.department] || req.department}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.maintenanceType}
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{req.sectionName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Km {req.fromKm}–{req.toKm}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{req.preferredDate}</td>
                    <td style={{ fontSize: 12 }}>{req.estimatedDuration}h</td>
                    <td><span className={`badge badge-${req.priority}`}>{req.priority}</span></td>
                    <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                    <td>
                      <span style={{ fontSize: 11, color: req.canBeCombined ? '#34d399' : '#f87171' }}>
                        {req.canBeCombined ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(req)} title="View details">
                          <Eye size={12} />
                        </button>
                        {isAdmin && req.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => updateRequestStatus(req.id, 'approved')} title="Approve">
                              <CheckCircle size={12} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateRequestStatus(req.id, 'rejected')} title="Reject">
                              <XCircle size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="optimization-overlay" onClick={() => setSelected(null)}>
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border-light)',
            borderRadius: 14, padding: 28, maxWidth: 640, width: '95%', maxHeight: '85vh',
            overflowY: 'auto', animation: 'slide-in-up 0.25s ease'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{selected.requestNumber}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{selected.maintenanceType}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Department', value: selected.department },
                { label: 'Division / Zone', value: `${selected.division} / ${selected.zone}` },
                { label: 'Section', value: selected.sectionName },
                { label: 'Location', value: `Km ${selected.fromKm} – ${selected.toKm}` },
                { label: 'Preferred Date', value: selected.preferredDate },
                { label: 'Time Window', value: `${selected.preferredTimeStart} – ${selected.preferredTimeEnd}` },
                { label: 'Duration', value: `${selected.estimatedDuration} hours` },
                { label: 'Workers Required', value: String(selected.requiredWorkers) },
                { label: 'Can Be Combined', value: selected.canBeCombined ? '✓ Yes' : '✗ No' },
                { label: 'Submitted', value: format(new Date(selected.submittedAt), 'dd MMM yyyy HH:mm') },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Description</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px' }}>
                {selected.description}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Equipment Required</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.equipmentRequired.map((eq) => (
                  <span key={eq} style={{
                    background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)', borderRadius: 6, padding: '3px 8px', fontSize: 11
                  }}>{eq}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <span className={`badge badge-${selected.priority}`}>{selected.priority} priority</span>
              <span className={`badge badge-${selected.status}`}>{selected.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

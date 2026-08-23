import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { RAILWAY_SECTIONS } from '../data/mockData';
import type { MaintenanceRequest } from '../types';

const STEPS = ['Basic Info', 'Location', 'Schedule', 'Resources', 'Review'];

const MAINTENANCE_TYPES: Record<string, string[]> = {
  Engineering: [
    'Track Geometry Correction', 'Rail Replacement', 'Ballast Cleaning',
    'Bridge Inspection & Repair', 'Track Renewal', 'Sleeper Replacement',
    'Level Crossing Improvement', 'Drain Cleaning', 'Bank Protection Work'
  ],
  'Traction Distribution': [
    'OHE Overhead Equipment Maintenance', 'OHE Tension Adjustment',
    'Substation Maintenance', 'Feeder Cable Replacement',
    'Earth Wire Inspection', 'Tower Wagon Inspection', 'Auto-transformer Maintenance'
  ],
  'Signal & Telecommunication': [
    'Signal Cable Replacement', 'Interlocking System Upgrade', 'Axle Counter Testing',
    'KAVACH System Installation', 'Point Machine Maintenance', 'Train Detection System',
    'Optical Fiber Cable Laying', 'Relay Room Maintenance'
  ],
  Operations: ['Platform Maintenance', 'Station Building Repair', 'Yard Remodeling'],
};

type FormData = Omit<MaintenanceRequest, 'id' | 'requestNumber' | 'submittedAt' | 'status' | 'submittedBy'>;

const DEPT_FROM_ROLE: Record<string, string> = {
  engineering: 'Engineering',
  traction: 'Traction Distribution',
  signaling: 'Signal & Telecommunication',
  operations: 'Operations',
  administrator: 'Engineering',
};

export function SubmitRequestPage() {
  const { user, addRequest } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const defaultDept = (DEPT_FROM_ROLE[user?.role || ''] || 'Engineering') as any;

  const [form, setForm] = useState<Partial<FormData>>({
    department: defaultDept,
    division: user?.division || 'Mumbai',
    zone: 'CR',
    priority: 'medium',
    preferredTimeStart: '01:00',
    preferredTimeEnd: '05:00',
    preferredDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    canBeCombined: true,
    equipmentRequired: [],
    requiredWorkers: 10,
    estimatedDuration: 3,
  });

  const set = (key: keyof FormData, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const section = RAILWAY_SECTIONS.find((s) => s.id === form.sectionId);

  const handleSubmit = () => {
    if (!form.sectionId || !form.maintenanceType || !form.department) return;
    addRequest({
      department: form.department!,
      division: form.division!,
      zone: form.zone!,
      sectionId: form.sectionId!,
      sectionName: section?.name || '',
      fromLocation: form.fromLocation || '',
      toLocation: form.toLocation || '',
      fromKm: form.fromKm || 0,
      toKm: form.toKm || 0,
      maintenanceType: form.maintenanceType!,
      description: form.description || '',
      estimatedDuration: Number(form.estimatedDuration) || 3,
      priority: form.priority!,
      preferredDate: form.preferredDate!,
      preferredTimeStart: form.preferredTimeStart!,
      preferredTimeEnd: form.preferredTimeEnd!,
      requiredWorkers: Number(form.requiredWorkers) || 10,
      equipmentRequired: form.equipmentRequired || [],
      canBeCombined: Boolean(form.canBeCombined),
      additionalNotes: form.additionalNotes,
      submittedBy: user?.id || 'unknown',
      status: 'pending',
    } as any);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>Request Submitted Successfully</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 28 }}>
            Your maintenance request has been submitted for review. The AI optimizer will evaluate it for block planning.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setStep(0); setForm({ department: defaultDept, division: user?.division || 'Mumbai', zone: 'CR', priority: 'medium', preferredTimeStart: '01:00', preferredTimeEnd: '05:00', preferredDate: new Date(Date.now() + 5*86400000).toISOString().split('T')[0], canBeCombined: true, equipmentRequired: [], requiredWorkers: 10, estimatedDuration: 3 }); }}>
              Submit Another
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/requests')}>View All Requests</button>
            <button className="btn btn-accent" onClick={() => navigate('/optimizer')}>Run AI Optimizer</button>
          </div>
        </div>
      </div>
    );
  }

  const maintenanceTypes = MAINTENANCE_TYPES[form.department || 'Engineering'] || [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit Maintenance Request</h1>
          <p className="page-subtitle">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="card mb-6" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? '#10b981' : i === step ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                  border: `2px solid ${i < step ? '#10b981' : i === step ? 'var(--color-primary-light)' : 'var(--color-border)'}`,
                  color: i <= step ? 'white' : 'var(--color-text-muted)',
                  fontSize: 13, fontWeight: 700, transition: 'all 0.3s'
                }}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === step ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? '#10b981' : 'var(--color-border)', transition: 'background 0.3s', margin: '0 8px', marginBottom: 24 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Basic Information</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className="form-control" value={form.department} onChange={(e) => { set('department', e.target.value as any); set('maintenanceType', ''); }}>
                  <option>Engineering</option>
                  <option>Traction Distribution</option>
                  <option>Signal & Telecommunication</option>
                  <option>Operations</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Division *</label>
                <select className="form-control" value={form.division} onChange={(e) => set('division', e.target.value)}>
                  <option>Mumbai</option>
                  <option>Pune</option>
                  <option>Nagpur</option>
                  <option>Bhusawal</option>
                  <option>Solapur</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Railway Zone *</label>
                <select className="form-control" value={form.zone} onChange={(e) => set('zone', e.target.value)}>
                  <option value="CR">CR – Central Railway</option>
                  <option value="WR">WR – Western Railway</option>
                  <option value="SCR">SCR – South Central Railway</option>
                  <option value="NR">NR – Northern Railway</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Maintenance Type *</label>
                <select className="form-control" value={form.maintenanceType || ''} onChange={(e) => set('maintenanceType', e.target.value)}>
                  <option value="">– Select type –</option>
                  {maintenanceTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Describe the maintenance work required, current condition, and urgency..." />
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
                  <button key={p} onClick={() => set('priority', p)} className="btn" style={{
                    flex: 1, justifyContent: 'center',
                    background: form.priority === p ? (p === 'critical' ? 'rgba(239,68,68,0.2)' : p === 'high' ? 'rgba(249,115,22,0.2)' : p === 'medium' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)') : 'var(--color-surface-2)',
                    border: `1px solid ${form.priority === p ? (p === 'critical' ? '#ef4444' : p === 'high' ? '#f97316' : p === 'medium' ? '#eab308' : '#22c55e') : 'var(--color-border)'}`,
                    color: form.priority === p ? (p === 'critical' ? '#f87171' : p === 'high' ? '#fb923c' : p === 'medium' ? '#fbbf24' : '#4ade80') : 'var(--color-text-muted)',
                    fontWeight: 600, textTransform: 'capitalize'
                  }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Track & Asset Location</h3>
            <div className="form-group">
              <label className="form-label">Railway Section *</label>
              <select className="form-control" value={form.sectionId || ''} onChange={(e) => set('sectionId', e.target.value)}>
                <option value="">– Select section –</option>
                {RAILWAY_SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.zone})</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">From Location</label>
                <input className="form-control" type="text" value={form.fromLocation || ''} onChange={(e) => set('fromLocation', e.target.value)} placeholder="e.g., Lonavala" />
              </div>
              <div className="form-group">
                <label className="form-label">To Location</label>
                <input className="form-control" type="text" value={form.toLocation || ''} onChange={(e) => set('toLocation', e.target.value)} placeholder="e.g., Pune" />
              </div>
              <div className="form-group">
                <label className="form-label">From Km *</label>
                <input className="form-control" type="number" value={form.fromKm || ''} onChange={(e) => set('fromKm', Number(e.target.value))} placeholder="e.g., 45" />
              </div>
              <div className="form-group">
                <label className="form-label">To Km *</label>
                <input className="form-control" type="number" value={form.toKm || ''} onChange={(e) => set('toKm', Number(e.target.value))} placeholder="e.g., 52" />
              </div>
            </div>
            {section && (
              <div style={{ background: 'rgba(37,87,167,0.08)', border: '1px solid rgba(37,87,167,0.25)', borderRadius: 8, padding: '12px 14px', fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>Section Info: {section.name}</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Zone: {section.zone} · Division: {section.division} · Length: {section.length} km ·
                  Traffic: <span style={{ color: section.trafficIntensity === 'high' ? '#f87171' : section.trafficIntensity === 'medium' ? '#fbbf24' : '#4ade80', fontWeight: 600 }}>{section.trafficIntensity.toUpperCase()}</span> ·
                  {section.electrified ? ' ⚡ Electrified' : ' Non-electrified'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Scheduling Preferences</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <input className="form-control" type="date" value={form.preferredDate} onChange={(e) => set('preferredDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Duration (hours) *</label>
                <input className="form-control" type="number" min={0.5} max={12} step={0.5} value={form.estimatedDuration} onChange={(e) => set('estimatedDuration', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Start Time</label>
                <input className="form-control" type="time" value={form.preferredTimeStart} onChange={(e) => set('preferredTimeStart', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred End Time</label>
                <input className="form-control" type="time" value={form.preferredTimeEnd} onChange={(e) => set('preferredTimeEnd', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.canBeCombined} onChange={(e) => set('canBeCombined', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--color-primary-light)' }} />
                Allow this request to be combined with other department activities
              </label>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, marginLeft: 24 }}>
                Enabling this allows the AI optimizer to merge your maintenance block with compatible department activities, reducing total disruption time.
              </div>
            </div>
            <div className="alert alert-info" style={{ marginTop: 8 }}>
              <div>
                <strong>AI Recommendation:</strong> Based on traffic data, the optimal maintenance window for this section is <strong>01:00–04:00 IST</strong> (traffic intensity: 8–12%).
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Resources */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Resources & Equipment</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Number of Workers Required *</label>
                <input className="form-control" type="number" min={1} max={200} value={form.requiredWorkers} onChange={(e) => set('requiredWorkers', Number(e.target.value))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Equipment Required</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {[
                  'Tamping Machine', 'Rail Crane', 'Tower Wagon', 'OHE Inspection Car',
                  'Cable Laying Machine', 'Flash Butt Welding Machine', 'Ballast Cleaning Machine',
                  'Track Recording Car', 'Signal Testing Equipment', 'Bridge Inspection Vehicle',
                ].map((eq) => (
                  <button key={eq} onClick={() => {
                    const current = form.equipmentRequired || [];
                    const next = current.includes(eq) ? current.filter((e) => e !== eq) : [...current, eq];
                    set('equipmentRequired', next);
                  }} style={{
                    background: (form.equipmentRequired || []).includes(eq) ? 'rgba(37,87,167,0.2)' : 'var(--color-surface-2)',
                    border: `1px solid ${(form.equipmentRequired || []).includes(eq) ? 'var(--color-primary-light)' : 'var(--color-border)'}`,
                    color: (form.equipmentRequired || []).includes(eq) ? '#60a5fa' : 'var(--color-text-muted)',
                    borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit'
                  }}>
                    {eq}
                  </button>
                ))}
              </div>
              <input className="form-control" type="text" placeholder="Or type custom equipment and press Enter..." onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                  set('equipmentRequired', [...(form.equipmentRequired || []), (e.target as HTMLInputElement).value]);
                  (e.target as HTMLInputElement).value = '';
                }
              }} />
            </div>
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-control" value={form.additionalNotes || ''} onChange={(e) => set('additionalNotes', e.target.value)} placeholder="Any special requirements, safety precautions, or coordination needs..." />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Review & Submit</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Department', value: form.department },
                { label: 'Maintenance Type', value: form.maintenanceType },
                { label: 'Section', value: section?.name || form.sectionId },
                { label: 'Location', value: `Km ${form.fromKm} – ${form.toKm}` },
                { label: 'Preferred Date', value: form.preferredDate },
                { label: 'Duration', value: `${form.estimatedDuration}h (${form.preferredTimeStart}–${form.preferredTimeEnd})` },
                { label: 'Priority', value: form.priority?.toUpperCase() },
                { label: 'Workers', value: String(form.requiredWorkers) },
                { label: 'Can Be Combined', value: form.canBeCombined ? '✓ Yes' : '✗ No' },
                { label: 'Equipment', value: (form.equipmentRequired || []).join(', ') || 'None specified' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{value || '–'}</div>
                </div>
              ))}
            </div>
            <div className="alert alert-warning">
              By submitting this request, you confirm that the maintenance details are accurate and approved by your department. This request will be reviewed by the Operations Controller.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
            <ChevronLeft size={15} /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button className="btn btn-accent btn-lg" onClick={handleSubmit}>
              <CheckCircle size={16} /> Submit Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

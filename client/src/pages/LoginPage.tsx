import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Lock, Mail, Eye, EyeOff, ChevronRight, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';

const DEMO_ACCOUNTS = [
  { email: 'admin@RailAvail.in', password: 'admin123', role: 'Administrator', color: '#ef4444' },
  { email: 'engineering@RailAvail.in', password: 'eng123', role: 'Engineering', color: '#3b82f6' },
  { email: 'traction@RailAvail.in', password: 'trac123', role: 'Traction Dist.', color: '#f59e0b' },
  { email: 'signaling@RailAvail.in', password: 'signal123', role: 'Signal & Telecom', color: '#10b981' },
  { email: 'operations@RailAvail.in', password: 'ops123', role: 'Operations', color: '#8b5cf6' },
];

export function LoginPage() {
  const [email, setEmail] = useState('admin@RailAvail.in');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(email, password);
    if (ok) {
      navigate('/');
    } else {
      setError('Invalid credentials. Use a demo account below.');
    }
    setLoading(false);
  };

  const fillAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="login-page">
      {/* Left hero panel */}
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'linear-gradient(135deg, #2557a7, #ff6b00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Train size={28} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'Rajdhani, sans-serif', letterSpacing: 1 }}>
                RailAvail
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2 }}>
                Intelligent Block Planning System
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: 16 }}>
            AI-Powered Railway<br />
            <span style={{ color: '#ff8c38' }}>Maintenance Planning</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 440, marginBottom: 48 }}>
            Automatically generate optimized maintenance block plans for Indian Railways.
            Combine multi-department activities, detect conflicts, and maximize asset availability.
          </p>

          {/* Feature tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['AI Optimization Engine', 'Conflict Detection', 'Gantt Timeline', 'Before/After Analysis', 'Multi-dept Planning'].map((f) => (
              <div key={f} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20, padding: '5px 12px', fontSize: 12, color: 'rgba(255,255,255,0.75)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <ChevronRight size={11} color="#ff8c38" />
                {f}
              </div>
            ))}
          </div>

          {/* SIH badge */}
          <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#ff8c38', fontWeight: 600
            }}>
              🏆 Smart India Hackathon 2026 · PS-26027
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="login-right">
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            Sign in to RailAvail
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Indian Railways Maintenance Portal
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: 32 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@RailAvail.in"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: 32, paddingRight: 36 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0
              }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <span className="spinner" /> : <Shield size={16} />}
            {loading ? 'Authenticating...' : 'Sign In to RailAvail'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>
            Demo Accounts — Click to auto-fill
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => fillAccount(acc)}
                style={{
                  background: email === acc.email ? 'var(--color-surface-2)' : 'transparent',
                  border: `1px solid ${email === acc.email ? acc.color + '40' : 'var(--color-border)'}`,
                  borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s',
                  color: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'inherit',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: acc.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{acc.role}</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28, padding: 12, background: 'rgba(37,87,167,0.08)', borderRadius: 8, border: '1px solid rgba(37,87,167,0.2)' }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
            ⚠️ <strong style={{ color: 'var(--color-text-secondary)' }}>Prototype Notice:</strong> This is a demonstration system for SIH 2026. 
            All data is simulated and does not represent actual Indian Railways operations.
          </p>
        </div>
      </div>
    </div>
  );
}

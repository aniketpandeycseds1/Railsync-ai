// ============================================================
// RailSync AI – Express Backend Server
// SIH 2026 | Problem Statement 26027
// ============================================================

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ─────────────────────────────────────────
// In-memory store (mirrors client mock data)
// Replace with SQLite/PostgreSQL for production
// ─────────────────────────────────────────
let requests = [];
let blocks = [];
let conflicts = [];
let users = [
  { id: 'u1', name: 'Rajesh Kumar', email: 'admin@railsync.in', role: 'administrator', department: 'Operations', division: 'Mumbai' },
  { id: 'u2', name: 'Priya Sharma', email: 'engineering@railsync.in', role: 'engineering', department: 'Engineering', division: 'Mumbai' },
  { id: 'u3', name: 'Arjun Nair', email: 'traction@railsync.in', role: 'traction', department: 'Traction Distribution', division: 'Mumbai' },
  { id: 'u4', name: 'Deepa Menon', email: 'signaling@railsync.in', role: 'signaling', department: 'Signal & Telecommunication', division: 'Mumbai' },
  { id: 'u5', name: 'Vikram Singh', email: 'operations@railsync.in', role: 'operations', department: 'Operations', division: 'Mumbai' },
];

const PASSWORDS = {
  'admin@railsync.in': 'admin123',
  'engineering@railsync.in': 'eng123',
  'traction@railsync.in': 'trac123',
  'signaling@railsync.in': 'signal123',
  'operations@railsync.in': 'ops123',
};

// ─────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  if (PASSWORDS[email] !== password) return res.status(401).json({ error: 'Invalid credentials' });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'User not found' });

  const token = Buffer.from(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 })).toString('base64');
  res.json({ user, token });
});

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const { userId } = JSON.parse(Buffer.from(auth, 'base64').toString());
    const user = users.find((u) => u.id === userId);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ─────────────────────────────────────────
// MAINTENANCE REQUESTS
// ─────────────────────────────────────────
app.get('/api/requests', (req, res) => {
  const { department, status, priority } = req.query;
  let filtered = [...requests];
  if (department) filtered = filtered.filter((r) => r.department === department);
  if (status) filtered = filtered.filter((r) => r.status === status);
  if (priority) filtered = filtered.filter((r) => r.priority === priority);
  res.json(filtered);
});

app.post('/api/requests', (req, res) => {
  const request = {
    ...req.body,
    id: uuidv4(),
    requestNumber: `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  requests.push(request);
  res.status(201).json(request);
});

app.patch('/api/requests/:id', (req, res) => {
  const idx = requests.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Request not found' });
  requests[idx] = { ...requests[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json(requests[idx]);
});

// ─────────────────────────────────────────
// MAINTENANCE BLOCKS
// ─────────────────────────────────────────
app.get('/api/blocks', (req, res) => res.json(blocks));

app.post('/api/blocks', (req, res) => {
  const block = { ...req.body, id: uuidv4(), generatedAt: new Date().toISOString() };
  blocks.push(block);
  res.status(201).json(block);
});

app.patch('/api/blocks/:id', (req, res) => {
  const idx = blocks.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Block not found' });
  blocks[idx] = { ...blocks[idx], ...req.body };
  res.json(blocks[idx]);
});

// ─────────────────────────────────────────
// CONFLICTS
// ─────────────────────────────────────────
app.get('/api/conflicts', (req, res) => res.json(conflicts));

app.patch('/api/conflicts/:id', (req, res) => {
  const idx = conflicts.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Conflict not found' });
  conflicts[idx] = { ...conflicts[idx], ...req.body };
  res.json(conflicts[idx]);
});

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────
app.get('/api/users', (req, res) => res.json(users.map(({ ...u }) => u)));

// ─────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────
app.get('/api/analytics/kpis', (req, res) => {
  res.json({
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    optimizedBlocks: blocks.length,
    conflictsDetected: conflicts.length,
    conflictsResolved: conflicts.filter((c) => c.status === 'resolved').length,
    disruptionReduction: 62,
    assetAvailability: 87.4,
    maintenanceHoursSaved: 6.5,
  });
});

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RailSync AI Server', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚂 RailSync AI Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health\n`);
});

# RailAvail – Intelligent Railway Block Planning System
## Smart India Hackathon 2026 | Problem Statement 26027

> AI-powered automatic block planning to maximize asset availability for train operations on Indian Railways

---

## 🚀 Quick Start

### Frontend (React + TypeScript)
```bash
cd client
npm install
npm run dev
```
Open: rail-avail-ai-akmm.vercel.app

### Backend (Node.js + Express) — Optional
```bash
cd server
npm install
npm start
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | admin@RailAvail.in | admin123 |
| **Engineering** | engineering@RailAvail.in | eng123 |
| **Traction Distribution** | traction@RailAvail.in | trac123 |
| **Signal & Telecom** | signaling@RailAvail.in | signal123 |
| **Operations Controller** | operations@RailAvail.in | ops123 |

---

## 🎯 SIH Demo Scenario

Three departments request maintenance on the same Kalyan–Pune section:

| Dept | Request | Duration |
|------|---------|----------|
| Engineering | Track Geometry Correction (Km 45–52) | 4h |
| S&T | Signal Cable Replacement (Km 47–50) | 3h |
| Traction Distribution | OHE Maintenance (Km 44–51) | 3.5h |

**Traditional Planning:** 3 separate blocks = 10.5h disruption  
**RailAvail:** 1 combined optimized block = 4h disruption  
**Result: 62% disruption reduction + 17.4% asset availability improvement**

---

## 📁 Project Structure

```
RailAvail-ai/
├── client/                   # React + TypeScript Frontend (Vite)
│   └── src/
│       ├── components/       # Reusable UI components
│       │   └── layout/       # AppLayout, Sidebar, Topbar
│       ├── pages/            # 11 application pages
│       ├── store/            # Zustand global state
│       ├── engine/           # AI optimization algorithm
│       ├── data/             # Mock data & demo scenario
│       └── types/            # TypeScript interfaces
└── server/                   # Node.js + Express Backend
    └── index.js              # REST API server
```

---

## 🧠 AI Optimization Engine

Located in `client/src/engine/optimizer.ts`

**Algorithm:**
```
Score = Σ(
  location_proximity_score  × 0.30
  time_window_efficiency    × 0.25
  traffic_impact_reduction  × 0.20
  resource_consolidation    × 0.15
  priority_alignment        × 0.10
)
```

**Steps:**
1. Cluster requests by section + date
2. Find lowest-traffic time window per cluster
3. Check department compatibility
4. Score all valid combinations
5. Generate optimized block schedule

Designed to be **replaced with ML/RL model** in production.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| State | Zustand (with localStorage persistence) |
| Charts | Recharts |
| Styling | Tailwind CSS v4 + Custom CSS |
| Backend | Node.js + Express |
| Icons | Lucide React |

---

## ⚠️ Disclaimer

This is a **prototype built for SIH 2026**. All data is simulated and does not represent actual Indian Railways operations or infrastructure.

# CivicTwin + ProofMesh: AI-Powered Community Intelligence Platform

> **A living digital memory of neighborhood infrastructure vulnerabilities powered by the ProofMesh evidence intelligence engine.**
>
> Built for the **Google Hackathon** focusing on the **Four Pillars of Impact**: **Resilience**, **Sustainability**, **Innovation**, and **Cooperation**.

---

## 1. Executive Summary & Vision

Communities repeatedly experience chronic infrastructure problems:
- Waterlogging and flash flooding
- Overflowing drains and silted culverts
- Recurrent road potholes and base erosion
- Waste accumulation blocking storm grates
- Unsafe pedestrian crossings and heat exposure corridors

Traditionally, reports about these incidents are scattered across transient chat messages, complaint portals, residents' memories, and municipal logbooks. When a municipal crew marks a ticket "resolved," the surface water may have receded today, but the underground culvert remains 70% clogged with silt—causing flooding to violently return during the next rain.

**CivicTwin** solves this by establishing a **living digital memory** of a neighborhood that remembers what happened across time, tracks recurrence frequency, and connects multi-date observations.

**ProofMesh** is the verification and reasoning layer inside CivicTwin. Every civic claim has an auditable evidence trail. ProofMesh distinguishes between observed facts, AI-extracted claims, resident observations, independently verified findings, and outdated claims. Crucially, **ProofMesh detects contradictions** (e.g. separating chronological progression from factual conflicts) and powers **"The Unknown Detector"**, which turns missing information into concrete community tasks.

---

## 2. Google Four Pillars of Impact

| Pillar | How CivicTwin + ProofMesh Delivers Real-World Impact |
| :--- | :--- |
| **🛡️ Resilience** | Transforms isolated complaint tickets into an enduring neighborhood memory. Tracks chronic waterlogging and infrastructure breakdowns across seasons so communities and coordinators can intervene *before* heavy weather strikes. |
| **🌱 Sustainability** | Prioritizes eco-centric preventive solutions (such as bio-retention swales, native filter verges, and synchronized waste logistics) backed by empirical outcome measurements with explicit causal limitations. |
| **💡 Innovation** | ProofMesh introduces a typed evidence graph with contradiction detection, chronological epoch modeling, and **"The Unknown Detector"** that makes civic uncertainty actionable rather than generating generic AI summaries. |
| **🤝 Cooperation** | Unites residents, independent community verifiers, NGO coordinators, and municipal stakeholders onto a shared, auditable ground truth with role-aware workbenches and transparent simulation tools. |

---

## 3. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (React 19 + Vite 6)                     │
│  Tailwind CSS • React Flow (@xyflow/react) • Recharts • Leaflet Maps   │
│  Role Switcher (Resident | Verifier | Coordinator | Admin)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api/*)
┌───────────────────────────────────▼────────────────────────────────────┐
│                  BACKEND ENGINE (Node.js 24 + Express)                 │
│  Zod Schema Validation • Structured Logging • Role-Based Auth Guards   │
├────────────────────────────────────────────────────────────────────────┤
│  • AIService: Gemini API SDK + Resilient Local Heuristic Fallback     │
│  • MemoryEngine: Recurrence & Multi-Observation Timeline Tracker       │
│  • ProofMeshEngine: Typed Evidence Graph & Contradiction Detector      │
│  • UnknownDetector: Actionable Evidence Gap Identification Engine      │
│  • PreventionLab: Multi-Attribute Intervention Simulation Engine       │
├────────────────────────────────────────────────────────────────────────┤
│  • Persistent Data Store: JSON File Persistence mirroring Firestore    │
│  • Greenfield Ward: Synthetic Demonstration Scenario Dataset           │
└────────────────────────────────────────────────────────────────────────┘
```

### Technology Highlights
- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, `@xyflow/react` (React Flow), Recharts, Leaflet, Lucide Icons, React Router v7.
- **Backend**: Node.js 24, Express, TypeScript, Zod request validation, `@google/generative-ai` SDK.
- **Persistence**: ACID-style persistent file-backed collection repository with atomic rename writes, zero native C++ compilation hurdles on Windows, and compatibility with Firebase Firestore.
- **Testing**: Vitest + Supertest automated suite (14 passing tests covering all core requirements).

---

## 4. Key Differentiating Features

### A. ProofMesh Interactive Evidence Graph (`/evidence`)
Connects Incidents, Claims, Evidence Items, Observations, and Interventions using typed relationships:
- `REPORTS`, `SUPPORTS`, `CONTRADICTS`, `REFERS_TO`, `OBSERVED_AT`, `OCCURRED_DURING`, `VERIFIED_BY`, `SUPERSEDES`, `ADDRESSES`, `MEASURED_BY`.
- **Contradiction Detection Engine**: Differentiates temporal progression (e.g., drain declared cleared on Jan 12, but flooded on Feb 2) from direct perceptual disagreement.
- Interactive canvas with pan, zoom, custom node cards, edge labeling, and a slide-out live inspection drawer.

### B. "The Unknown Detector" ("What We Still Don't Know")
Rather than hallucinating unverified claims as established facts, ProofMesh analyzes evidence gaps:
1. **Recency Gap**: No follow-up observation recorded within 7 days after reported repair.
2. **Corroboration Gap**: Only one resident reported without independent sensor or verifier corroboration.
3. **Sub-surface Structural Gap**: Waterlogging attributed to surface debris without CCTV crawler camera survey.
4. **Actionable Conversion**: Any identified gap can be converted into a community task with 1 click.

### C. Prevention Lab (`/prevention`)
An interactive simulation sandbox where coordinators compare proposed interventions:
- Adjust estimated cost, target effectiveness (%), and implementation timeframe (weeks).
- Live calculation of **Composite Impact Score**, estimated recurrence reduction, and risk factors.
- Pre-populates a standardized evaluation plan (baseline metric vs post-intervention target).
- 1-click **"Save Intervention to Action Board"** workflow.

### D. Longitudinal Outcome Tracking (`/actions`)
Tracks before-and-after empirical measurements:
- Compares baseline flood stagnation duration (4.8 hrs) against post-swale observations (1.2 hrs).
- Explicitly communicates **correlation vs causation limitations** (e.g. ambient temperature or rainfall intensity variations).

---

## 5. Greenfield Ward Synthetic Demonstration Dataset

The platform is pre-seeded with a complete, coherent synthetic story set in fictional **"Greenfield Ward"**:

1. **Hotspot 1: Recurring Elm Street Low-Lying Culvert Flooding**
   - **Jan 8**: Resident Priya reports severe waterlogging (40cm deep outside St. Jude clinic).
   - **Jan 9**: Resident Marcus reports commuter bus stalled in 45cm deep water; silt discharge from grate.
   - **Jan 10**: Verifier Elena Rostova measures 68cm sediment probe depth at manhole MH-4.
   - **Jan 12**: Municipal work order #MW-4091 claims suction truck cleared the drain.
   - **Feb 2**: Waterlogging returns (35cm depth) after only 18mm rain.
   - **Contradiction**: Claim of permanent resolution is **superseded and contradicted** by the Feb 2 recurrence photo.
   - **Evidence Gap**: Lack of 200m underground CCTV crawler inspection.
   - **Intervention**: Bio-retention swale pilot reducing stagnation from 4.8 hrs to 1.2 hrs.

2. **Hotspot 2: Oak Avenue Arterial Pothole Cluster**
   - Sub-base granular aggregate erosion underneath asphalt caused by heavy night delivery trucks.

3. **Hotspot 3: Market Square North Storm Drain Waste Accumulation**
   - Nightly commercial produce crates blocking storm grate; resolved via midnight compactor coordination.

---

## 6. Quick Start & Execution Guide

### Prerequisites
- Node.js (v18+ or v24+ recommended)
- npm (v9+)

### Installation
From the project root:
```bash
# Install all root, client, and server dependencies
npm install
```

### Running Locally
```bash
# Launch both Backend (port 3001) and Frontend (port 5173) concurrently
npm run dev
```

Open your browser at:
- **Frontend App**: `http://localhost:5173`
- **Backend API Health**: `http://localhost:3001/api/admin/health`
- **Dashboard API**: `http://localhost:3001/api/dashboard/summary`

### Running Automated Test Suite
```bash
# Run Vitest integration suite across all API endpoints and logic
npm test
```

### Production Build
```bash
npm run build
```

---

## 7. 5-Minute Hackathon Presentation Guide (For Judges)

| Time | Action | Page | What to Show |
| :---: | :--- | :--- | :--- |
| **0:00 - 1:00** | **Executive Overview** | `/` & `/dashboard` | Open Landing Page to present the Four Pillars. Navigate to Dashboard to showcase the Greenfield Ward map, 7 KPI cards, and recurring hotspot rankings. |
| **1:00 - 2:00** | **Neighborhood Memory** | `/incidents/inc-elm-waterlog` | Click Elm Street. Show the multi-date observation timeline: Jan 8 flooding &rarr; Jan 9 stalled bus &rarr; Jan 12 municipal clearing &rarr; Feb 2 recurrence. Explain how CivicTwin disproves cosmetic repairs. |
| **2:00 - 3:00** | **ProofMesh Evidence Graph** | `/evidence` | Open the interactive graph. Point to the glowing red `CONTRADICTS` edge between the Jan 12 municipal work order and the Feb 2 photograph. Click a node to inspect the provenance drawer. |
| **3:00 - 4:00** | **The Unknown Detector** | `/incidents/inc-elm-waterlog` (Gaps tab) | Show "What We Still Don't Know". Highlight the missing underground CCTV crawler inspection. Click **"Convert Gap into Community Task"** to dispatch a verifier. |
| **4:00 - 5:00** | **Prevention Lab & Outcomes** | `/prevention` & `/actions` | Adjust the simulation sliders to show real-time impact score calculation. Navigate to the Action Board to inspect the before-and-after outcome measurement (4.8 hrs &rarr; 1.2 hrs) and correlation vs causation disclaimer. |

---

## 8. Role-Aware Experience & Demo Switcher

The top navigation bar features a **Demo Role Switcher** allowing instant switching between:
- **Resident (Priya Sharma)**: Submit new incident reports, pin map locations, view public evidence trails.
- **Community Verifier (Elena Rostova)**: Access the Verification Workbench (`/verification`), review multi-source evidence, and sign auditable decisions.
- **NGO Coordinator (Tariq Al-Mansoor)**: Simulate interventions in the Prevention Lab (`/prevention`), assign community action tasks.
- **Administrator (Dr. Aris Thorne)**: Inspect immutable audit logs, check Gemini inference engine health, and reset demonstration data.

---

## 9. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Aggregated metrics (total reports, unique incidents, recurrence count) |
| `GET` | `/api/dashboard/trends` | Temporal trends and claim verification status breakdown |
| `POST` | `/api/reports` | Ingests new report with Zod validation, AI extraction & duplicate matching |
| `GET` | `/api/reports` | Returns submitted reports with optional category/search filters |
| `GET` | `/api/incidents` | Returns canonical incidents with recurrence counts |
| `GET` | `/api/incidents/:id` | Detailed incident record with observations, claims, evidence, and gaps |
| `GET` | `/api/incidents/:id/timeline` | Chronological multi-date observation sequence |
| `GET` | `/api/evidence/graph` | Formatted React Flow nodes and edges with typed relations |
| `GET` | `/api/claims` | List of claims with verification status |
| `POST` | `/api/claims/:id/verify` | Records signed verification decision and creates immutable audit record |
| `GET` | `/api/incidents/:id/gaps` | Analyzes and returns evidence gaps for an incident |
| `POST` | `/api/gaps/:id/convert-action` | Converts an evidence gap into an active Community Action task |
| `POST` | `/api/interventions/simulate` | Transparent multi-factor simulation impact scoring |
| `POST` | `/api/interventions` | Creates and saves a new proposed intervention |
| `POST` | `/api/interventions/:id/measurements` | Records follow-up before-and-after outcome measurement |
| `GET` | `/api/actions` | Returns community action board tasks |
| `PATCH`| `/api/actions/:id` | Updates task status (`todo`, `in_progress`, `completed`) |
| `GET` | `/api/admin/audit-events` | Retrives system audit logs |
| `GET` | `/api/admin/health` | System health and Gemini AI status check |
| `POST` | `/api/admin/reset-demo` | Safely resets database to pristine Greenfield Ward state |

---

## 10. Security, Privacy & Firebase Deployment

- **Input Validation**: All API inputs validated with strict Zod schemas.
- **Secret Hygiene**: Zero API keys or secrets in frontend bundles; managed via environment variables.
- **Resilient AI**: Gracefully falls back to structured heuristic extraction if `GEMINI_API_KEY` is not provided.
- **Immutable Audit**: Verification decisions and system actions are recorded in an append-only audit trail.
- **Firebase Deployment**:
  - `firebase.json` pre-configured for Firebase Hosting rewrites.
  - `firestore.rules` enforces role-based access control and prevents unauthorized claim status overrides.
  - `storage.rules` restricts file types and limits uploads to 15MB.

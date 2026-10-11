import fs from 'node:fs';
import path from 'node:path';
import {
  User,
  IncidentReport,
  CanonicalIncident,
  Observation,
  Claim,
  EvidenceItem,
  EvidenceRelation,
  VerificationDecision,
  EvidenceGap,
  Intervention,
  OutcomeMeasurement,
  CommunityAction,
  AuditEvent
} from './types.js';
import { seedInitialData } from './seeds.js';

export interface DatabaseSchema {
  users: User[];
  reports: IncidentReport[];
  incidents: CanonicalIncident[];
  observations: Observation[];
  claims: Claim[];
  evidence: EvidenceItem[];
  relations: EvidenceRelation[];
  verificationDecisions: VerificationDecision[];
  evidenceGaps: EvidenceGap[];
  interventions: Intervention[];
  outcomeMeasurements: OutcomeMeasurement[];
  communityActions: CommunityAction[];
  auditEvents: AuditEvent[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'civictwin_db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private isPersisting = false;
  private pendingPersist = false;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.incidents && parsed.claims && parsed.evidence) {
          return parsed as DatabaseSchema;
        }
      } catch (err) {
        console.warn('[DB] Failed to parse existing DB file, re-initializing with seeds:', err);
      }
    }

    const seeded = seedInitialData();
    this.saveDirect(seeded);
    return seeded;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error writing DB file:', err);
    }
  }

  public async persist(): Promise<void> {
    if (this.isPersisting) {
      this.pendingPersist = true;
      return;
    }

    this.isPersisting = true;
    try {
      const serialized = JSON.stringify(this.data, null, 2);
      await fs.promises.writeFile(DB_FILE, serialized, 'utf-8');
    } catch (err) {
      console.error('[DB] Asynchronous persist failed:', err);
    } finally {
      this.isPersisting = false;
      if (this.pendingPersist) {
        this.pendingPersist = false;
        await this.persist();
      }
    }
  }

  public resetToDemo(): DatabaseSchema {
    this.data = seedInitialData();
    this.saveDirect(this.data);
    return this.data;
  }

  // Accessors
  public get users() { return this.data.users; }
  public get reports() { return this.data.reports; }
  public get incidents() { return this.data.incidents; }
  public get observations() { return this.data.observations; }
  public get claims() { return this.data.claims; }
  public get evidence() { return this.data.evidence; }
  public get relations() { return this.data.relations; }
  public get verificationDecisions() { return this.data.verificationDecisions; }
  public get evidenceGaps() { return this.data.evidenceGaps; }
  public get interventions() { return this.data.interventions; }
  public get outcomeMeasurements() { return this.data.outcomeMeasurements; }
  public get communityActions() { return this.data.communityActions; }
  public get auditEvents() { return this.data.auditEvents; }

  // Generic helpers
  public addAudit(actorId: string, actorName: string, actorRole: any, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
    const event: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.data.auditEvents.unshift(event);
    void this.persist();
    return event;
  }
}

export const db = new DatabaseService();

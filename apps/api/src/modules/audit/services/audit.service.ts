export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export class AuditService {
  private log: AuditEntry[] = [];

  record(actor: string, action: string, target: string): void {
    this.log.unshift({
      id: `aud_${Date.now()}`,
      actor,
      action,
      target,
      timestamp: new Date().toISOString(),
    });
  }

  getEntries(): AuditEntry[] {
    return this.log.slice(0, 50);
  }
}

export const auditService = new AuditService();

/**
 * Audit Logging System
 * Tracks role changes, memory updates, PII events, and security checks.
 */

import { getDb } from "@/lib/mongodb";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AuditEventType =
  | "role_change"
  | "memory_update"
  | "pii_detected"
  | "sensitive_data_trigger"
  | "failed_security_check"
  | "profile_created"
  | "profile_updated"
  | "session_started"
  | "session_ended"
  | "voice_generated"
  | "auth_event";

export interface AuditEvent {
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  severity: "info" | "warning" | "critical";
  timestamp: Date;
}

// ─── Core Logger ───────────────────────────────────────────────────────────────

/** Write an audit event to MongoDB. Never throws — failures are silent. */
export async function logAuditEvent(
  event: Omit<AuditEvent, "timestamp">
): Promise<void> {
  try {
    const db = await getDb();
    await db.collection("audit_logs").insertOne({
      ...event,
      timestamp: new Date(),
    });
  } catch (err) {
    // Audit logging must never crash the main flow
    console.error("[AuditLog] Failed to write event:", event.eventType, err);
  }
}

// ─── Convenience Methods ───────────────────────────────────────────────────────

export async function logRoleChange(
  userId: string,
  previousRole: string,
  newRole: string,
  sessionId?: string
): Promise<void> {
  await logAuditEvent({
    eventType: "role_change",
    userId,
    sessionId,
    severity: "info",
    metadata: { previousRole, newRole },
  });
}

export async function logMemoryUpdate(
  userId: string,
  memoryType: string,
  fieldsUpdated: string[]
): Promise<void> {
  await logAuditEvent({
    eventType: "memory_update",
    userId,
    severity: "info",
    metadata: { memoryType, fieldsUpdated },
  });
}

export async function logPIIDetection(
  userId: string,
  piiTypes: string[],
  context: string,
  wasMasked: boolean
): Promise<void> {
  await logAuditEvent({
    eventType: "pii_detected",
    userId,
    severity: "warning",
    metadata: { piiTypes, context, wasMasked },
  });
}

export async function logProfileEvent(
  userId: string,
  eventType: "profile_created" | "profile_updated",
  changes?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    eventType,
    userId,
    severity: "info",
    metadata: changes,
  });
}

export async function logSessionEvent(
  userId: string,
  sessionId: string,
  eventType: "session_started" | "session_ended"
): Promise<void> {
  await logAuditEvent({
    eventType,
    userId,
    sessionId,
    severity: "info",
  });
}

// ─── Index Setup ───────────────────────────────────────────────────────────────

export async function ensureAuditIndexes(): Promise<void> {
  try {
    const db = await getDb();
    const col = db.collection("audit_logs");
    await Promise.all([
      col.createIndex({ userId: 1 }),
      col.createIndex({ timestamp: -1 }),
      col.createIndex({ eventType: 1 }),
      col.createIndex({ severity: 1 }),
    ]);
  } catch (_) { /* indexes may already exist */ }
}

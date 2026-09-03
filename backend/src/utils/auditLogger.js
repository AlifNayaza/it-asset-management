// File: backend/src/utils/auditLogger.js
import { pool, isPostgresConnected, getMockStore, saveMockStore } from '../db.js';

/**
 * Log transactional changes into PostgreSQL JSONB audit_logs
 * @param {object} params
 * @param {string} params.tableName - e.g. 'assets', 'asset_assignments', 'maintenance_logs'
 * @param {string} params.recordId - UUID or ID of the affected record
 * @param {string} params.actionType - 'INSERT', 'UPDATE', 'DELETE'
 * @param {string} params.changedBy - Name or email of operator/user
 * @param {object|null} params.payloadBefore - Data before change (stored as JSONB)
 * @param {object|null} params.payloadAfter - Data after change (stored as JSONB)
 */
export async function logAudit({
  tableName,
  recordId,
  actionType,
  changedBy = 'System Admin',
  payloadBefore = null,
  payloadAfter = null
}) {
  try {
    if (isPostgresConnected) {
      await pool.query(
        `INSERT INTO audit_logs (table_name, record_id, action_type, changed_by, payload_before, payload_after, logged_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          tableName,
          String(recordId),
          actionType,
          changedBy,
          payloadBefore ? JSON.stringify(payloadBefore) : null,
          payloadAfter ? JSON.stringify(payloadAfter) : null
        ]
      );
    } else {
      const store = getMockStore();
      const newAudit = {
        id: (store.audit_logs.length + 1).toString(),
        table_name: tableName,
        record_id: String(recordId),
        action_type: actionType,
        changed_by: changedBy,
        payload_before: payloadBefore,
        payload_after: payloadAfter,
        logged_at: new Date().toISOString()
      };
      store.audit_logs.unshift(newAudit);
      saveMockStore();
    }
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}

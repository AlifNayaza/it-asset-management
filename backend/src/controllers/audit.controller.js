// File: backend/src/controllers/audit.controller.js
import { pool, isPostgresConnected, getMockStore } from '../db.js';

export async function getAuditLogs(req, res) {
  try {
    const { table_name, record_id, action_type, limit = 100 } = req.query;

    if (isPostgresConnected) {
      let conditions = [];
      let params = [];

      if (table_name) {
        params.push(table_name);
        conditions.push(`table_name = $${params.length}`);
      }
      if (record_id) {
        params.push(record_id);
        conditions.push(`record_id = $${params.length}`);
      }
      if (action_type) {
        params.push(action_type);
        conditions.push(`action_type = $${params.length}`);
      }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      params.push(limit);

      const query = `
        SELECT * FROM audit_logs 
        ${where}
        ORDER BY logged_at DESC 
        LIMIT $${params.length}
      `;

      const result = await pool.query(query, params);
      return res.json({ success: true, data: result.rows });
    } else {
      const store = getMockStore();
      let logs = [...store.audit_logs];

      if (table_name) logs = logs.filter(l => l.table_name === table_name);
      if (record_id) logs = logs.filter(l => l.record_id === record_id);
      if (action_type) logs = logs.filter(l => l.action_type === action_type);

      return res.json({ success: true, data: logs.slice(0, Number(limit)) });
    }
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

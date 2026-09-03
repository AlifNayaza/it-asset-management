// File: backend/src/controllers/maintenance.controller.js
import { pool, isPostgresConnected, getMockStore, saveMockStore } from '../db.js';
import { logAudit } from '../utils/auditLogger.js';
import crypto from 'crypto';

/**
 * POST /api/maintenance
 * Log maintenance/repair ticket for an asset
 */
export async function createMaintenanceLog(req, res) {
  try {
    const {
      asset_id,
      service_date,
      completion_date = null,
      vendor_name,
      issue_description,
      cost = 0,
      invoice_path = null,
      set_status_maintenance = true,
      logged_by = 'IT Support'
    } = req.body;

    if (!asset_id || !service_date || !vendor_name || !issue_description) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: asset_id, service_date, vendor_name, issue_description'
      });
    }

    if (isPostgresConnected) {
      const assetRes = await pool.query('SELECT * FROM assets WHERE id = $1', [asset_id]);
      if (assetRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
      }
      const currentAsset = assetRes.rows[0];

      const logRes = await pool.query(
        `INSERT INTO maintenance_logs
         (asset_id, service_date, completion_date, vendor_name, issue_description, cost, invoice_path, logged_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          asset_id,
          service_date,
          completion_date,
          vendor_name.trim(),
          issue_description.trim(),
          parseFloat(cost) || 0,
          invoice_path,
          logged_by
        ]
      );
      const newLog = logRes.rows[0];

      // Update asset status if needed
      if (set_status_maintenance && !completion_date) {
        await pool.query(
          `UPDATE assets SET status = 'maintenance', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [asset_id]
        );
      }

      await logAudit({
        tableName: 'maintenance_logs',
        recordId: newLog.id,
        actionType: 'INSERT',
        changedBy: logged_by,
        payloadBefore: null,
        payloadAfter: newLog
      });

      return res.status(201).json({
        success: true,
        message: 'Catatan pemeliharaan/servis berhasil dibuat',
        data: newLog
      });
    } else {
      const store = getMockStore();
      const assetIndex = store.assets.findIndex(a => a.id === asset_id);
      if (assetIndex === -1) {
        return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
      }

      const newLog = {
        id: crypto.randomUUID(),
        asset_id,
        service_date,
        completion_date,
        vendor_name: vendor_name.trim(),
        issue_description: issue_description.trim(),
        cost: parseFloat(cost) || 0,
        invoice_path,
        logged_by,
        created_at: new Date().toISOString()
      };

      store.maintenance_logs.unshift(newLog);

      if (set_status_maintenance && !completion_date) {
        store.assets[assetIndex].status = 'maintenance';
        store.assets[assetIndex].updated_at = new Date().toISOString();
      }

      saveMockStore();

      await logAudit({
        tableName: 'maintenance_logs',
        recordId: newLog.id,
        actionType: 'INSERT',
        changedBy: logged_by,
        payloadBefore: null,
        payloadAfter: newLog
      });

      return res.status(201).json({
        success: true,
        message: 'Catatan pemeliharaan/servis berhasil dibuat',
        data: newLog
      });
    }
  } catch (err) {
    console.error('createMaintenanceLog error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/maintenance/:id/complete
 * Complete maintenance ticket and restore asset to available
 */
export async function completeMaintenanceLog(req, res) {
  try {
    const { id } = req.params;
    const { completion_date = new Date().toISOString().split('T')[0], cost, logged_by = 'IT Support' } = req.body;

    if (isPostgresConnected) {
      const logCheck = await pool.query('SELECT * FROM maintenance_logs WHERE id = $1', [id]);
      if (logCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Log servis tidak ditemukan' });
      }
      const beforeLog = logCheck.rows[0];

      const updateRes = await pool.query(
        `UPDATE maintenance_logs 
         SET completion_date = $1, cost = COALESCE($2, cost)
         WHERE id = $3
         RETURNING *`,
        [completion_date, cost !== undefined ? parseFloat(cost) : null, id]
      );
      const afterLog = updateRes.rows[0];

      // Restore asset to available
      await pool.query(
        `UPDATE assets SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [afterLog.asset_id]
      );

      await logAudit({
        tableName: 'maintenance_logs',
        recordId: id,
        actionType: 'UPDATE',
        changedBy: logged_by,
        payloadBefore: beforeLog,
        payloadAfter: afterLog
      });

      return res.json({
        success: true,
        message: 'Pemeliharaan selesai, unit telah dikembalikan ke status Tersedia (Available)',
        data: afterLog
      });
    } else {
      const store = getMockStore();
      const index = store.maintenance_logs.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Log servis tidak ditemukan' });
      }

      const beforeLog = { ...store.maintenance_logs[index] };
      const afterLog = {
        ...beforeLog,
        completion_date,
        cost: cost !== undefined ? parseFloat(cost) : beforeLog.cost
      };
      store.maintenance_logs[index] = afterLog;

      // Restore asset to available
      const assetIdx = store.assets.findIndex(a => a.id === afterLog.asset_id);
      if (assetIdx !== -1) {
        store.assets[assetIdx].status = 'available';
        store.assets[assetIdx].updated_at = new Date().toISOString();
      }

      saveMockStore();

      await logAudit({
        tableName: 'maintenance_logs',
        recordId: id,
        actionType: 'UPDATE',
        changedBy: logged_by,
        payloadBefore: beforeLog,
        payloadAfter: afterLog
      });

      return res.json({
        success: true,
        message: 'Pemeliharaan selesai, unit telah dikembalikan ke status Tersedia (Available)',
        data: afterLog
      });
    }
  } catch (err) {
    console.error('completeMaintenanceLog error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/maintenance
 */
export async function getMaintenanceLogs(req, res) {
  try {
    const { asset_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    if (isPostgresConnected) {
      let conditions = [];
      let params = [];

      if (asset_id) {
        params.push(asset_id);
        conditions.push(`m.asset_id = $${params.length}`);
      }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      const countRes = await pool.query(`SELECT COUNT(*) FROM maintenance_logs m ${where}`, params);
      const total = parseInt(countRes.rows[0].count, 10);

      const queryParams = [...params, limit, offset];
      const query = `
        SELECT m.*, a.asset_tag, a.model_name, a.serial_number
        FROM maintenance_logs m
        JOIN assets a ON m.asset_id = a.id
        ${where}
        ORDER BY m.service_date DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `;

      const result = await pool.query(query, queryParams);

      return res.json({
        success: true,
        data: result.rows,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      const store = getMockStore();
      let list = store.maintenance_logs.map(m => {
        const a = store.assets.find(x => x.id === m.asset_id) || {};
        return {
          ...m,
          asset_tag: a.asset_tag || 'Unknown',
          model_name: a.model_name || 'Unknown',
          serial_number: a.serial_number || 'Unknown'
        };
      });

      if (asset_id) list = list.filter(x => x.asset_id === asset_id);

      const total = list.length;
      const paginated = list.slice(offset, offset + Number(limit));

      return res.json({
        success: true,
        data: paginated,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }
  } catch (err) {
    console.error('getMaintenanceLogs error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

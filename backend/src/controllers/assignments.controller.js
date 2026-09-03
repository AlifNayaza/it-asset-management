// File: backend/src/controllers/assignments.controller.js
import { pool, isPostgresConnected, getMockStore, saveMockStore } from '../db.js';
import { logAudit } from '../utils/auditLogger.js';
import crypto from 'crypto';

/**
 * POST /api/assignments/checkout
 * Menyerahkan unit ke karyawan (update status -> assigned, catat riwayat)
 */
export async function checkoutAsset(req, res) {
  try {
    const {
      asset_id,
      employee_name,
      employee_id_number,
      condition_on_checkout = 'Good / Baik',
      assigned_by = 'IT Administrator',
      handover_doc_path = null,
      notes = ''
    } = req.body;

    if (!asset_id || !employee_name || !employee_id_number) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: asset_id, employee_name, employee_id_number'
      });
    }

    if (isPostgresConnected) {
      // Check current asset status
      const assetCheck = await pool.query('SELECT * FROM assets WHERE id = $1', [asset_id]);
      if (assetCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
      }

      const currentAsset = assetCheck.rows[0];
      if (currentAsset.status === 'assigned') {
        return res.status(400).json({
          success: false,
          message: `Aset ini sedang ditugaskan kepada [${currentAsset.current_holder}]. Lakukan check-in terlebih dahulu.`
        });
      }
      if (currentAsset.status === 'maintenance' || currentAsset.status === 'retired') {
        return res.status(400).json({
          success: false,
          message: `Aset berstatus '${currentAsset.status}', tidak dapat diserahterimakan.`
        });
      }

      // 1. Insert assignment record
      const asgResult = await pool.query(
        `INSERT INTO asset_assignments 
         (asset_id, employee_name, employee_id_number, condition_on_checkout, handover_doc_path, assigned_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          asset_id,
          employee_name.trim(),
          employee_id_number.trim(),
          condition_on_checkout,
          handover_doc_path,
          assigned_by,
          notes
        ]
      );
      const assignment = asgResult.rows[0];

      // 2. Update asset status
      const updateAssetRes = await pool.query(
        `UPDATE assets 
         SET status = 'assigned', current_holder = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [employee_name.trim(), asset_id]
      );
      const updatedAsset = updateAssetRes.rows[0];

      // 3. Audit Log
      await logAudit({
        tableName: 'asset_assignments',
        recordId: assignment.id,
        actionType: 'INSERT',
        changedBy: assigned_by,
        payloadBefore: null,
        payloadAfter: assignment
      });

      await logAudit({
        tableName: 'assets',
        recordId: asset_id,
        actionType: 'UPDATE',
        changedBy: assigned_by,
        payloadBefore: currentAsset,
        payloadAfter: updatedAsset
      });

      return res.status(201).json({
        success: true,
        message: `Aset ${updatedAsset.asset_tag} berhasil diserahkan kepada ${employee_name}`,
        data: {
          assignment,
          asset: updatedAsset
        }
      });
    } else {
      const store = getMockStore();
      const assetIndex = store.assets.findIndex(a => a.id === asset_id || a.asset_tag === asset_id);
      if (assetIndex === -1) {
        return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
      }

      const currentAsset = { ...store.assets[assetIndex] };
      if (currentAsset.status === 'assigned') {
        return res.status(400).json({
          success: false,
          message: `Aset sedang ditugaskan kepada [${currentAsset.current_holder}]. Lakukan check-in terlebih dahulu.`
        });
      }

      const assignment = {
        id: crypto.randomUUID(),
        asset_id: currentAsset.id,
        employee_name: employee_name.trim(),
        employee_id_number: employee_id_number.trim(),
        assigned_at: new Date().toISOString(),
        returned_at: null,
        condition_on_checkout,
        condition_on_return: null,
        handover_doc_path,
        assigned_by,
        notes
      };

      store.asset_assignments.unshift(assignment);

      // Update asset
      currentAsset.status = 'assigned';
      currentAsset.current_holder = employee_name.trim();
      currentAsset.updated_at = new Date().toISOString();
      store.assets[assetIndex] = currentAsset;

      saveMockStore();

      await logAudit({
        tableName: 'asset_assignments',
        recordId: assignment.id,
        actionType: 'INSERT',
        changedBy: assigned_by,
        payloadBefore: null,
        payloadAfter: assignment
      });

      return res.status(201).json({
        success: true,
        message: `Aset ${currentAsset.asset_tag} berhasil diserahkan kepada ${employee_name}`,
        data: {
          assignment,
          asset: currentAsset
        }
      });
    }
  } catch (err) {
    console.error('checkoutAsset error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/assignments/:id/checkin
 * Pengembalian unit ke gudang, evaluasi kondisi fisik, status -> available
 */
export async function checkinAsset(req, res) {
  try {
    const { id } = req.params; // assignment_id or asset_id
    const {
      condition_on_return = 'Good / Normal',
      notes = '',
      logged_by = 'IT Administrator'
    } = req.body;

    if (isPostgresConnected) {
      // Find assignment record (could be ID or active by asset_id)
      let asgRes = await pool.query(
        `SELECT * FROM asset_assignments WHERE (id::text = $1 OR asset_id::text = $1) AND returned_at IS NULL ORDER BY assigned_at DESC LIMIT 1`,
        [id]
      );

      if (asgRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Penugasan aktif tidak ditemukan untuk aset / ID ini.'
        });
      }

      const activeAsg = asgRes.rows[0];

      // 1. Update assignment
      const updatedAsgRes = await pool.query(
        `UPDATE asset_assignments 
         SET returned_at = CURRENT_TIMESTAMP, condition_on_return = $1, notes = COALESCE(NULLIF($2, ''), notes)
         WHERE id = $3
         RETURNING *`,
        [condition_on_return, notes, activeAsg.id]
      );
      const updatedAsg = updatedAsgRes.rows[0];

      // 2. Update asset
      const assetRes = await pool.query('SELECT * FROM assets WHERE id = $1', [activeAsg.asset_id]);
      const currentAsset = assetRes.rows[0];

      const updatedAssetRes = await pool.query(
        `UPDATE assets 
         SET status = 'available', current_holder = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [activeAsg.asset_id]
      );
      const updatedAsset = updatedAssetRes.rows[0];

      // 3. Audit Log
      await logAudit({
        tableName: 'asset_assignments',
        recordId: activeAsg.id,
        actionType: 'UPDATE',
        changedBy: logged_by,
        payloadBefore: activeAsg,
        payloadAfter: updatedAsg
      });

      await logAudit({
        tableName: 'assets',
        recordId: activeAsg.asset_id,
        actionType: 'UPDATE',
        changedBy: logged_by,
        payloadBefore: currentAsset,
        payloadAfter: updatedAsset
      });

      return res.json({
        success: true,
        message: `Aset ${updatedAsset.asset_tag} berhasil dikembalikan ke gudang. Status sekarang: Tersedia (Available).`,
        data: {
          assignment: updatedAsg,
          asset: updatedAsset
        }
      });
    } else {
      const store = getMockStore();
      const asgIndex = store.asset_assignments.findIndex(a => 
        (a.id === id || a.asset_id === id) && !a.returned_at
      );

      if (asgIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Penugasan aktif tidak ditemukan untuk aset / ID ini.'
        });
      }

      const activeAsg = { ...store.asset_assignments[asgIndex] };
      activeAsg.returned_at = new Date().toISOString();
      activeAsg.condition_on_return = condition_on_return;
      if (notes) activeAsg.notes = (activeAsg.notes ? activeAsg.notes + ' | ' : '') + notes;
      store.asset_assignments[asgIndex] = activeAsg;

      // Update asset
      const assetIndex = store.assets.findIndex(a => a.id === activeAsg.asset_id);
      let updatedAsset = null;
      if (assetIndex !== -1) {
        const beforeAsset = { ...store.assets[assetIndex] };
        beforeAsset.status = 'available';
        beforeAsset.current_holder = null;
        beforeAsset.updated_at = new Date().toISOString();
        store.assets[assetIndex] = beforeAsset;
        updatedAsset = beforeAsset;
      }

      saveMockStore();

      await logAudit({
        tableName: 'asset_assignments',
        recordId: activeAsg.id,
        actionType: 'UPDATE',
        changedBy: logged_by,
        payloadBefore: null,
        payloadAfter: activeAsg
      });

      return res.json({
        success: true,
        message: `Aset berhasil dikembalikan ke gudang. Status sekarang: Tersedia (Available).`,
        data: {
          assignment: activeAsg,
          asset: updatedAsset
        }
      });
    }
  } catch (err) {
    console.error('checkinAsset error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/assignments
 */
export async function getAssignments(req, res) {
  try {
    const { status, asset_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    if (isPostgresConnected) {
      let conditions = [];
      let params = [];

      if (status === 'active') {
        conditions.push('asg.returned_at IS NULL');
      } else if (status === 'returned') {
        conditions.push('asg.returned_at IS NOT NULL');
      }

      if (asset_id) {
        params.push(asset_id);
        conditions.push(`asg.asset_id = $${params.length}`);
      }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      const countRes = await pool.query(`SELECT COUNT(*) FROM asset_assignments asg ${where}`, params);
      const total = parseInt(countRes.rows[0].count, 10);

      const queryParams = [...params, limit, offset];
      const query = `
        SELECT asg.*, a.asset_tag, a.model_name, a.serial_number
        FROM asset_assignments asg
        JOIN assets a ON asg.asset_id = a.id
        ${where}
        ORDER BY asg.assigned_at DESC
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
      let list = store.asset_assignments.map(asg => {
        const a = store.assets.find(x => x.id === asg.asset_id) || {};
        return {
          ...asg,
          asset_tag: a.asset_tag || 'Unknown',
          model_name: a.model_name || 'Unknown',
          serial_number: a.serial_number || 'Unknown'
        };
      });

      if (status === 'active') list = list.filter(x => !x.returned_at);
      else if (status === 'returned') list = list.filter(x => !!x.returned_at);

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
    console.error('getAssignments error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// File: backend/src/controllers/assets.controller.js
import { pool, isPostgresConnected, getMockStore, saveMockStore } from '../db.js';
import { computeStraightLineDepreciation } from '../utils/depreciation.js';
import { generateQRCodeDataUrl, generateAssetLabelData } from '../utils/qrGenerator.js';
import { logAudit } from '../utils/auditLogger.js';
import crypto from 'crypto';

/**
 * Generate next asset tag based on category (e.g. AST-NB-2026-0001)
 */
async function generateAssetTag(categoryName = 'DEVICE') {
  const year = new Date().getFullYear();
  let prefix = 'AST';
  const catUpper = categoryName.toUpperCase();
  if (catUpper.includes('LAPTOP') || catUpper.includes('NOTEBOOK')) prefix = 'AST-NB';
  else if (catUpper.includes('PC') || catUpper.includes('DESKTOP')) prefix = 'AST-PC';
  else if (catUpper.includes('NETWORK') || catUpper.includes('SWITCH') || catUpper.includes('ROUTER')) prefix = 'AST-NET';
  else if (catUpper.includes('MONITOR')) prefix = 'AST-MON';
  else if (catUpper.includes('SERVER')) prefix = 'AST-SRV';
  else if (catUpper.includes('PRINTER')) prefix = 'AST-PRN';
  else prefix = 'AST-DEV';

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomDigits}`;
}

export async function getAssets(req, res) {
  try {
    const { search, status, category_id, location_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    if (isPostgresConnected) {
      let conditions = [];
      let params = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(a.asset_tag ILIKE $${params.length} OR a.serial_number ILIKE $${params.length} OR a.model_name ILIKE $${params.length} OR a.current_holder ILIKE $${params.length})`);
      }
      if (status && status !== 'all') {
        params.push(status);
        conditions.push(`a.status = $${params.length}`);
      }
      if (category_id && category_id !== 'all') {
        params.push(category_id);
        conditions.push(`a.category_id = $${params.length}`);
      }
      if (location_id && location_id !== 'all') {
        params.push(location_id);
        conditions.push(`a.location_id = $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM assets a ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const queryParams = [...params, limit, offset];
      const query = `
        SELECT a.*, 
               c.name as category_name, c.useful_life_years as category_useful_life, c.salvage_percentage as category_salvage_percentage,
               l.branch_name, l.room_name
        FROM assets a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN locations l ON a.location_id = l.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `;

      const result = await pool.query(query, queryParams);

      // Enhance with computed real-time depreciation
      const assets = result.rows.map(asset => {
        const dep = computeStraightLineDepreciation(
          asset.purchase_price,
          asset.category_salvage_percentage || 5,
          asset.useful_life_years || 4,
          asset.purchase_date
        );
        return {
          ...asset,
          depreciation: dep
        };
      });

      return res.json({
        success: true,
        data: assets,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      const store = getMockStore();
      let filtered = [...store.assets];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(a => 
          (a.asset_tag && a.asset_tag.toLowerCase().includes(s)) ||
          (a.serial_number && a.serial_number.toLowerCase().includes(s)) ||
          (a.model_name && a.model_name.toLowerCase().includes(s)) ||
          (a.current_holder && a.current_holder.toLowerCase().includes(s))
        );
      }
      if (status && status !== 'all') {
        filtered = filtered.filter(a => a.status === status);
      }
      if (category_id && category_id !== 'all') {
        filtered = filtered.filter(a => String(a.category_id) === String(category_id));
      }
      if (location_id && location_id !== 'all') {
        filtered = filtered.filter(a => String(a.location_id) === String(location_id));
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + Number(limit)).map(asset => {
        const category = store.categories.find(c => c.id === asset.category_id) || {};
        const location = store.locations.find(l => l.id === asset.location_id) || {};
        const dep = computeStraightLineDepreciation(
          asset.purchase_price,
          category.salvage_percentage || 5,
          asset.useful_life_years || 4,
          asset.purchase_date
        );
        return {
          ...asset,
          category_name: category.name || 'Uncategorized',
          branch_name: location.branch_name || '-',
          room_name: location.room_name || '-',
          depreciation: dep
        };
      });

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
    console.error('getAssets error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAssetById(req, res) {
  try {
    const { id } = req.params;

    if (isPostgresConnected) {
      const result = await pool.query(
        `SELECT a.*, 
                c.name as category_name, c.useful_life_years as category_useful_life, c.salvage_percentage as category_salvage_percentage,
                l.branch_name, l.room_name
         FROM assets a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN locations l ON a.location_id = l.id
         WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }

      const asset = result.rows[0];

      // Get assignment history
      const assignments = await pool.query(
        `SELECT * FROM asset_assignments WHERE asset_id = $1 ORDER BY assigned_at DESC`,
        [id]
      );

      // Get maintenance logs
      const maintenance = await pool.query(
        `SELECT * FROM maintenance_logs WHERE asset_id = $1 ORDER BY service_date DESC`,
        [id]
      );

      // Generate QR Code base64
      const qrCodeUrl = await generateQRCodeDataUrl(asset.asset_tag);

      // Compute depreciation
      const dep = computeStraightLineDepreciation(
        asset.purchase_price,
        asset.category_salvage_percentage || 5,
        asset.useful_life_years || 4,
        asset.purchase_date
      );

      return res.json({
        success: true,
        data: {
          ...asset,
          qr_code_url: qrCodeUrl,
          depreciation: dep,
          assignments: assignments.rows,
          maintenance_logs: maintenance.rows
        }
      });
    } else {
      const store = getMockStore();
      const asset = store.assets.find(a => a.id === id || a.asset_tag === id);
      if (!asset) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }

      const category = store.categories.find(c => c.id === asset.category_id) || {};
      const location = store.locations.find(l => l.id === asset.location_id) || {};
      const assignments = store.asset_assignments.filter(asg => asg.asset_id === asset.id);
      const maintenance = store.maintenance_logs.filter(m => m.asset_id === asset.id);
      const qrCodeUrl = await generateQRCodeDataUrl(asset.asset_tag);

      const dep = computeStraightLineDepreciation(
        asset.purchase_price,
        category.salvage_percentage || 5,
        asset.useful_life_years || 4,
        asset.purchase_date
      );

      return res.json({
        success: true,
        data: {
          ...asset,
          category_name: category.name || 'Uncategorized',
          branch_name: location.branch_name || '-',
          room_name: location.room_name || '-',
          qr_code_url: qrCodeUrl,
          depreciation: dep,
          assignments,
          maintenance_logs: maintenance
        }
      });
    }
  } catch (err) {
    console.error('getAssetById error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/assets/:tag/quick-view
 * Fast response endpoint called when camera scanner reads QR code
 */
export async function getAssetQuickView(req, res) {
  try {
    const { tag } = req.params;
    const cleanTag = decodeURIComponent(tag).trim();

    if (isPostgresConnected) {
      const result = await pool.query(
        `SELECT a.*, 
                c.name as category_name, c.salvage_percentage as category_salvage_percentage,
                l.branch_name, l.room_name,
                (
                  SELECT json_build_object(
                    'id', asg.id,
                    'employee_name', asg.employee_name,
                    'employee_id_number', asg.employee_id_number,
                    'assigned_at', asg.assigned_at,
                    'condition_on_checkout', asg.condition_on_checkout
                  )
                  FROM asset_assignments asg
                  WHERE asg.asset_id = a.id AND asg.returned_at IS NULL
                  ORDER BY asg.assigned_at DESC
                  LIMIT 1
                ) as active_assignment
         FROM assets a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN locations l ON a.location_id = l.id
         WHERE a.asset_tag = $1 OR a.serial_number = $1 OR a.id::text = $1`,
        [cleanTag]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Asset dengan tag atau serial [${cleanTag}] tidak ditemukan!`
        });
      }

      const asset = result.rows[0];
      const dep = computeStraightLineDepreciation(
        asset.purchase_price,
        asset.category_salvage_percentage || 5,
        asset.useful_life_years || 4,
        asset.purchase_date
      );

      return res.json({
        success: true,
        data: {
          ...asset,
          depreciation: dep
        }
      });
    } else {
      const store = getMockStore();
      const asset = store.assets.find(a => 
        a.asset_tag.toLowerCase() === cleanTag.toLowerCase() || 
        a.serial_number.toLowerCase() === cleanTag.toLowerCase() ||
        a.id === cleanTag
      );

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: `Asset dengan tag atau serial [${cleanTag}] tidak ditemukan!`
        });
      }

      const category = store.categories.find(c => c.id === asset.category_id) || {};
      const location = store.locations.find(l => l.id === asset.location_id) || {};
      const activeAssignment = store.asset_assignments.find(asg => asg.asset_id === asset.id && !asg.returned_at) || null;

      const dep = computeStraightLineDepreciation(
        asset.purchase_price,
        category.salvage_percentage || 5,
        asset.useful_life_years || 4,
        asset.purchase_date
      );

      return res.json({
        success: true,
        data: {
          ...asset,
          category_name: category.name || 'Uncategorized',
          branch_name: location.branch_name || '-',
          room_name: location.room_name || '-',
          active_assignment: activeAssignment,
          depreciation: dep
        }
      });
    }
  } catch (err) {
    console.error('getAssetQuickView error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/assets
 * Mendaftarkan unit hardware baru, otomatis menghasilkan Asset Tag & data kode QR
 */
export async function createAsset(req, res) {
  try {
    const {
      asset_tag,
      serial_number,
      model_name,
      category_id,
      location_id,
      status = 'available',
      purchase_date,
      purchase_price,
      useful_life_years = 4,
      salvage_value = 0,
      current_holder = null,
      image_url = null,
      logged_by = 'System Admin'
    } = req.body;

    if (!serial_number || !model_name || !category_id || !purchase_date || !purchase_price) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: serial_number, model_name, category_id, purchase_date, purchase_price'
      });
    }

    if (isPostgresConnected) {
      // Get category name for tag generation
      const catRes = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
      const catName = catRes.rows[0]?.name || 'DEVICE';

      const finalAssetTag = asset_tag?.trim() || (await generateAssetTag(catName));

      const insertResult = await pool.query(
        `INSERT INTO assets 
         (asset_tag, serial_number, model_name, category_id, location_id, status, purchase_date, purchase_price, useful_life_years, salvage_value, current_holder, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          finalAssetTag,
          serial_number.trim(),
          model_name.trim(),
          parseInt(category_id, 10),
          location_id ? parseInt(location_id, 10) : null,
          status,
          purchase_date,
          parseFloat(purchase_price),
          parseInt(useful_life_years, 10),
          parseFloat(salvage_value) || 0,
          current_holder,
          image_url
        ]
      );

      const createdAsset = insertResult.rows[0];

      // Audit Log
      await logAudit({
        tableName: 'assets',
        recordId: createdAsset.id,
        actionType: 'INSERT',
        changedBy: logged_by,
        payloadBefore: null,
        payloadAfter: createdAsset
      });

      // Generate QR Code
      const qrCodeUrl = await generateQRCodeDataUrl(createdAsset.asset_tag);

      return res.status(201).json({
        success: true,
        message: 'Aset berhasil didaftarkan!',
        data: {
          ...createdAsset,
          qr_code_url: qrCodeUrl
        }
      });
    } else {
      const store = getMockStore();
      const cat = store.categories.find(c => c.id === parseInt(category_id, 10)) || {};
      const finalAssetTag = asset_tag?.trim() || (await generateAssetTag(cat.name || 'DEV'));

      const newAsset = {
        id: crypto.randomUUID(),
        asset_tag: finalAssetTag,
        serial_number: serial_number.trim(),
        model_name: model_name.trim(),
        category_id: parseInt(category_id, 10),
        location_id: location_id ? parseInt(location_id, 10) : null,
        status,
        purchase_date,
        purchase_price: parseFloat(purchase_price),
        useful_life_years: parseInt(useful_life_years, 10) || 4,
        salvage_value: parseFloat(salvage_value) || 0,
        current_holder,
        image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      store.assets.unshift(newAsset);
      saveMockStore();

      await logAudit({
        tableName: 'assets',
        recordId: newAsset.id,
        actionType: 'INSERT',
        changedBy: logged_by,
        payloadBefore: null,
        payloadAfter: newAsset
      });

      const qrCodeUrl = await generateQRCodeDataUrl(newAsset.asset_tag);

      return res.status(201).json({
        success: true,
        message: 'Aset berhasil didaftarkan!',
        data: {
          ...newAsset,
          qr_code_url: qrCodeUrl
        }
      });
    }
  } catch (err) {
    console.error('createAsset error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Asset Tag atau Serial Number sudah terdaftar!' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/assets/:id
 */
export async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const {
      serial_number,
      model_name,
      category_id,
      location_id,
      status,
      purchase_date,
      purchase_price,
      useful_life_years,
      salvage_value,
      current_holder,
      image_url,
      logged_by = 'System Admin'
    } = req.body;

    if (isPostgresConnected) {
      const beforeRes = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
      if (beforeRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Asset tidak ditemukan' });
      }
      const beforeData = beforeRes.rows[0];

      const result = await pool.query(
        `UPDATE assets SET
          serial_number = COALESCE($1, serial_number),
          model_name = COALESCE($2, model_name),
          category_id = COALESCE($3, category_id),
          location_id = COALESCE($4, location_id),
          status = COALESCE($5, status),
          purchase_date = COALESCE($6, purchase_date),
          purchase_price = COALESCE($7, purchase_price),
          useful_life_years = COALESCE($8, useful_life_years),
          salvage_value = COALESCE($9, salvage_value),
          current_holder = $10,
          image_url = COALESCE($11, image_url),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [
          serial_number,
          model_name,
          category_id ? parseInt(category_id, 10) : null,
          location_id ? parseInt(location_id, 10) : null,
          status,
          purchase_date,
          purchase_price ? parseFloat(purchase_price) : null,
          useful_life_years ? parseInt(useful_life_years, 10) : null,
          salvage_value ? parseFloat(salvage_value) : null,
          current_holder !== undefined ? current_holder : beforeData.current_holder,
          image_url,
          id
        ]
      );

      const afterData = result.rows[0];

      await logAudit({
        tableName: 'assets',
        recordId: id,
        actionType: 'UPDATE',
        changedBy: logged_by,
        payloadBefore: beforeData,
        payloadAfter: afterData
      });

      return res.json({
        success: true,
        message: 'Aset berhasil diperbarui',
        data: afterData
      });
    } else {
      const store = getMockStore();
      const index = store.assets.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Asset tidak ditemukan' });
      }

      const beforeData = { ...store.assets[index] };
      const updated = {
        ...beforeData,
        ...(serial_number && { serial_number }),
        ...(model_name && { model_name }),
        ...(category_id && { category_id: parseInt(category_id, 10) }),
        ...(location_id !== undefined && { location_id: location_id ? parseInt(location_id, 10) : null }),
        ...(status && { status }),
        ...(purchase_date && { purchase_date }),
        ...(purchase_price !== undefined && { purchase_price: parseFloat(purchase_price) }),
        ...(useful_life_years !== undefined && { useful_life_years: parseInt(useful_life_years, 10) }),
        ...(salvage_value !== undefined && { salvage_value: parseFloat(salvage_value) }),
        ...(current_holder !== undefined && { current_holder }),
        ...(image_url && { image_url }),
        updated_at: new Date().toISOString()
      };

      store.assets[index] = updated;
      saveMockStore();

      await logAudit({
        tableName: 'assets',
        recordId: id,
        actionType: 'UPDATE',
        changedBy: logged_by,
        payloadBefore: beforeData,
        payloadAfter: updated
      });

      return res.json({
        success: true,
        message: 'Aset berhasil diperbarui',
        data: updated
      });
    }
  } catch (err) {
    console.error('updateAsset error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/assets/:id
 */
export async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const { logged_by = 'System Admin' } = req.body;

    if (isPostgresConnected) {
      const beforeRes = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
      if (beforeRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Asset tidak ditemukan' });
      }

      await pool.query('DELETE FROM assets WHERE id = $1', [id]);

      await logAudit({
        tableName: 'assets',
        recordId: id,
        actionType: 'DELETE',
        changedBy: logged_by,
        payloadBefore: beforeRes.rows[0],
        payloadAfter: null
      });

      return res.json({ success: true, message: 'Aset berhasil dihapus' });
    } else {
      const store = getMockStore();
      const index = store.assets.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Asset tidak ditemukan' });
      }

      const beforeData = store.assets[index];
      store.assets.splice(index, 1);
      saveMockStore();

      await logAudit({
        tableName: 'assets',
        recordId: id,
        actionType: 'DELETE',
        changedBy: logged_by,
        payloadBefore: beforeData,
        payloadAfter: null
      });

      return res.json({ success: true, message: 'Aset berhasil dihapus' });
    }
  } catch (err) {
    console.error('deleteAsset error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/assets/:id/label
 * Dapatkan data label cetak siap print
 */
export async function getAssetLabel(req, res) {
  try {
    const { id } = req.params;

    let asset = null;
    if (isPostgresConnected) {
      const result = await pool.query(
        `SELECT a.*, c.name as category_name, l.branch_name, l.room_name 
         FROM assets a 
         LEFT JOIN categories c ON a.category_id = c.id 
         LEFT JOIN locations l ON a.location_id = l.id
         WHERE a.id = $1 OR a.asset_tag = $1`,
        [id]
      );
      if (result.rows.length > 0) asset = result.rows[0];
    } else {
      const store = getMockStore();
      const a = store.assets.find(x => x.id === id || x.asset_tag === id);
      if (a) {
        const cat = store.categories.find(c => c.id === a.category_id) || {};
        const loc = store.locations.find(l => l.id === a.location_id) || {};
        asset = { ...a, category_name: cat.name, branch_name: loc.branch_name, room_name: loc.room_name };
      }
    }

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const labelData = await generateAssetLabelData(asset);
    return res.json({
      success: true,
      data: labelData
    });
  } catch (err) {
    console.error('getAssetLabel error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/assets/bulk-import
 * Import array of assets from CSV or spreadsheet
 */
export async function bulkImportAssets(req, res) {
  try {
    const { items, logged_by = 'System Admin' } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Data array "items" wajib disertakan dan tidak boleh kosong' });
    }

    const inserted = [];
    const errors = [];

    if (isPostgresConnected) {
      const catRes = await pool.query('SELECT id, name, useful_life_years, salvage_percentage FROM categories');
      const cats = catRes.rows;
      const locRes = await pool.query('SELECT id, branch_name, room_name FROM locations');
      const locs = locRes.rows;

      const defaultCat = cats[0] || { id: 1, name: 'DEVICE', useful_life_years: 4, salvage_percentage: 5 };
      const defaultLoc = locs[0] || null;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          if (!item.model_name || !item.serial_number) {
            errors.push(`Baris #${i + 1}: Nama Model dan Serial Number wajib diisi`);
            continue;
          }

          let matchedCat = defaultCat;
          if (item.category_id) {
            matchedCat = cats.find(c => c.id === parseInt(item.category_id, 10)) || defaultCat;
          } else if (item.category_name) {
            matchedCat = cats.find(c => c.name.toLowerCase() === item.category_name.toLowerCase().trim()) || defaultCat;
          }

          let locId = defaultLoc ? defaultLoc.id : null;
          if (item.location_id) {
            locId = parseInt(item.location_id, 10);
          } else if (item.branch_name || item.room_name) {
            const matchedLoc = locs.find(l => 
              (item.branch_name && l.branch_name.toLowerCase() === item.branch_name.toLowerCase().trim()) ||
              (item.room_name && l.room_name.toLowerCase() === item.room_name.toLowerCase().trim())
            );
            if (matchedLoc) locId = matchedLoc.id;
          }

          const tag = item.asset_tag?.trim() || (await generateAssetTag(matchedCat.name));
          const purchaseDate = item.purchase_date || new Date().toISOString().split('T')[0];
          const purchasePrice = parseFloat(item.purchase_price) || 0;
          const usefulLife = parseInt(item.useful_life_years, 10) || matchedCat.useful_life_years || 4;
          const salvageVal = parseFloat(item.salvage_value) || (purchasePrice * (parseFloat(matchedCat.salvage_percentage) || 5) / 100);
          const status = ['available', 'assigned', 'maintenance', 'retired', 'lost'].includes(item.status) ? item.status : 'available';

          const insertRes = await pool.query(
            `INSERT INTO assets 
             (asset_tag, serial_number, model_name, category_id, location_id, status, purchase_date, purchase_price, useful_life_years, salvage_value, current_holder, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
              tag,
              item.serial_number.trim(),
              item.model_name.trim(),
              matchedCat.id,
              locId,
              status,
              purchaseDate,
              purchasePrice,
              usefulLife,
              salvageVal,
              item.current_holder || null,
              item.image_url || null
            ]
          );

          const newAsset = insertRes.rows[0];
          inserted.push(newAsset);

          await logAudit({
            tableName: 'assets',
            recordId: newAsset.id,
            actionType: 'INSERT',
            changedBy: logged_by,
            payloadBefore: null,
            payloadAfter: newAsset
          });
        } catch (itemErr) {
          errors.push(`Baris #${i + 1} (${item.model_name || 'Unit'}): ${itemErr.message}`);
        }
      }

      return res.json({
        success: true,
        message: `Berhasil mengimpor ${inserted.length} aset.${errors.length > 0 ? ` (${errors.length} dilewati)` : ''}`,
        count: inserted.length,
        errors: errors.length > 0 ? errors : undefined,
        data: inserted
      });
    } else {
      const store = getMockStore();
      const defaultCat = store.categories[0] || { id: 1, name: 'Laptop', useful_life_years: 4, salvage_percentage: 5 };
      const defaultLoc = store.locations[0] || null;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          if (!item.model_name || !item.serial_number) {
            errors.push(`Baris #${i + 1}: Nama Model dan Serial Number wajib diisi`);
            continue;
          }

          if (store.assets.some(a => a.serial_number.toLowerCase() === item.serial_number.toLowerCase().trim())) {
            errors.push(`Baris #${i + 1}: Serial Number '${item.serial_number}' sudah terdaftar`);
            continue;
          }

          let matchedCat = defaultCat;
          if (item.category_id) {
            matchedCat = store.categories.find(c => c.id === parseInt(item.category_id, 10)) || defaultCat;
          } else if (item.category_name) {
            matchedCat = store.categories.find(c => c.name.toLowerCase() === item.category_name.toLowerCase().trim()) || defaultCat;
          }

          let locId = defaultLoc ? defaultLoc.id : null;
          if (item.location_id) {
            locId = parseInt(item.location_id, 10);
          } else if (item.branch_name || item.room_name) {
            const matchedLoc = store.locations.find(l => 
              (item.branch_name && l.branch_name.toLowerCase() === item.branch_name.toLowerCase().trim()) ||
              (item.room_name && l.room_name.toLowerCase() === item.room_name.toLowerCase().trim())
            );
            if (matchedLoc) locId = matchedLoc.id;
          }

          const tag = item.asset_tag?.trim() || (await generateAssetTag(matchedCat.name));
          const purchaseDate = item.purchase_date || new Date().toISOString().split('T')[0];
          const purchasePrice = parseFloat(item.purchase_price) || 0;
          const usefulLife = parseInt(item.useful_life_years, 10) || matchedCat.useful_life_years || 4;
          const salvageVal = parseFloat(item.salvage_value) || (purchasePrice * (parseFloat(matchedCat.salvage_percentage) || 5) / 100);
          const status = ['available', 'assigned', 'maintenance', 'retired', 'lost'].includes(item.status) ? item.status : 'available';

          const newAsset = {
            id: crypto.randomUUID(),
            asset_tag: tag,
            serial_number: item.serial_number.trim(),
            model_name: item.model_name.trim(),
            category_id: matchedCat.id,
            location_id: locId,
            status,
            purchase_date: purchaseDate,
            purchase_price: purchasePrice,
            useful_life_years: usefulLife,
            salvage_value: salvageVal,
            current_holder: item.current_holder || null,
            image_url: item.image_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          store.assets.unshift(newAsset);
          inserted.push(newAsset);

          await logAudit({
            tableName: 'assets',
            recordId: newAsset.id,
            actionType: 'INSERT',
            changedBy: logged_by,
            payloadBefore: null,
            payloadAfter: newAsset
          });
        } catch (itemErr) {
          errors.push(`Baris #${i + 1}: ${itemErr.message}`);
        }
      }

      saveMockStore();

      return res.json({
        success: true,
        message: `Berhasil mengimpor ${inserted.length} aset.${errors.length > 0 ? ` (${errors.length} dilewati)` : ''}`,
        count: inserted.length,
        errors: errors.length > 0 ? errors : undefined,
        data: inserted
      });
    }
  } catch (err) {
    console.error('bulkImportAssets error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// File: backend/src/controllers/locations.controller.js
import { pool, isPostgresConnected, getMockStore, saveMockStore } from '../db.js';

export async function getLocations(req, res) {
  try {
    if (isPostgresConnected) {
      const result = await pool.query(`
        SELECT l.*, COUNT(a.id) as total_assets
        FROM locations l
        LEFT JOIN assets a ON l.id = a.location_id
        GROUP BY l.id
        ORDER BY l.branch_name, l.room_name ASC
      `);
      return res.json({ success: true, data: result.rows });
    } else {
      const store = getMockStore();
      const data = store.locations.map(l => ({
        ...l,
        total_assets: store.assets.filter(a => a.location_id === l.id).length
      }));
      return res.json({ success: true, data });
    }
  } catch (err) {
    console.error('getLocations error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createLocation(req, res) {
  try {
    const { branch_name, room_name } = req.body;
    if (!branch_name || !room_name) {
      return res.status(400).json({ success: false, message: 'branch_name dan room_name wajib diisi' });
    }

    if (isPostgresConnected) {
      const result = await pool.query(
        `INSERT INTO locations (branch_name, room_name)
         VALUES ($1, $2)
         RETURNING *`,
        [branch_name.trim(), room_name.trim()]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    } else {
      const store = getMockStore();
      const newLoc = {
        id: store.locations.length > 0 ? Math.max(...store.locations.map(l => l.id)) + 1 : 1,
        branch_name: branch_name.trim(),
        room_name: room_name.trim(),
        created_at: new Date().toISOString()
      };
      store.locations.push(newLoc);
      saveMockStore();
      return res.status(201).json({ success: true, data: newLoc });
    }
  } catch (err) {
    console.error('createLocation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

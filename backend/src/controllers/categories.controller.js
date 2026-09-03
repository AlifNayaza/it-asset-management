// File: backend/src/controllers/categories.controller.js
import { pool, isPostgresConnected, getMockStore, saveMockStore } from '../db.js';

export async function getCategories(req, res) {
  try {
    if (isPostgresConnected) {
      const result = await pool.query(`
        SELECT c.*, COUNT(a.id) as total_assets
        FROM categories c
        LEFT JOIN assets a ON c.id = a.category_id
        GROUP BY c.id
        ORDER BY c.name ASC
      `);
      return res.json({ success: true, data: result.rows });
    } else {
      const store = getMockStore();
      const data = store.categories.map(c => ({
        ...c,
        total_assets: store.assets.filter(a => a.category_id === c.id).length
      }));
      return res.json({ success: true, data });
    }
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, useful_life_years = 4, salvage_percentage = 5.0 } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    }

    if (isPostgresConnected) {
      const result = await pool.query(
        `INSERT INTO categories (name, useful_life_years, salvage_percentage)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name.trim(), parseInt(useful_life_years, 10), parseFloat(salvage_percentage)]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    } else {
      const store = getMockStore();
      const newCat = {
        id: store.categories.length > 0 ? Math.max(...store.categories.map(c => c.id)) + 1 : 1,
        name: name.trim(),
        useful_life_years: parseInt(useful_life_years, 10) || 4,
        salvage_percentage: parseFloat(salvage_percentage) || 5.0,
        created_at: new Date().toISOString()
      };
      store.categories.push(newCat);
      saveMockStore();
      return res.status(201).json({ success: true, data: newCat });
    }
  } catch (err) {
    console.error('createCategory error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// File: backend/src/controllers/reports.controller.js
import { pool, isPostgresConnected, getMockStore } from '../db.js';
import { computeStraightLineDepreciation } from '../utils/depreciation.js';

/**
 * GET /api/reports/depreciation
 * Menghitung depresiasi garis lurus dan sisa nilai buku (book value) seluruh aset secara dinamis.
 */
export async function getDepreciationReport(req, res) {
  try {
    let assets = [];

    if (isPostgresConnected) {
      const result = await pool.query(`
        SELECT a.*, 
               c.name as category_name, c.salvage_percentage as category_salvage_percentage,
               l.branch_name, l.room_name
        FROM assets a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN locations l ON a.location_id = l.id
        WHERE a.status != 'retired' AND a.status != 'lost'
        ORDER BY a.purchase_date ASC
      `);
      assets = result.rows;
    } else {
      const store = getMockStore();
      assets = store.assets
        .filter(a => a.status !== 'retired' && a.status !== 'lost')
        .map(a => {
          const c = store.categories.find(cat => cat.id === a.category_id) || {};
          const l = store.locations.find(loc => loc.id === a.location_id) || {};
          return {
            ...a,
            category_name: c.name || 'Uncategorized',
            category_salvage_percentage: c.salvage_percentage || 5,
            branch_name: l.branch_name || '-',
            room_name: l.room_name || '-'
          };
        });
    }

    let totalOriginalCost = 0;
    let totalAccumulatedDepreciation = 0;
    let totalCurrentBookValue = 0;
    let totalAnnualDepreciation = 0;

    const categoryBreakdown = {};

    const items = assets.map(asset => {
      const cost = Number(asset.purchase_price) || 0;
      const salvagePercent = Number(asset.category_salvage_percentage || 5);
      const usefulYears = Number(asset.useful_life_years || 4);
      const purchaseDate = asset.purchase_date;

      const dep = computeStraightLineDepreciation(cost, salvagePercent, usefulYears, purchaseDate);

      totalOriginalCost += dep.cost;
      totalAccumulatedDepreciation += dep.accumulatedDepreciation;
      totalCurrentBookValue += dep.currentBookValue;
      totalAnnualDepreciation += dep.annualDepreciation;

      const catName = asset.category_name || 'Other';
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = {
          category_name: catName,
          total_units: 0,
          total_cost: 0,
          total_book_value: 0,
          total_accumulated_depreciation: 0
        };
      }
      categoryBreakdown[catName].total_units += 1;
      categoryBreakdown[catName].total_cost += dep.cost;
      categoryBreakdown[catName].total_book_value += dep.currentBookValue;
      categoryBreakdown[catName].total_accumulated_depreciation += dep.accumulatedDepreciation;

      return {
        id: asset.id,
        asset_tag: asset.asset_tag,
        serial_number: asset.serial_number,
        model_name: asset.model_name,
        category_name: asset.category_name,
        branch_name: asset.branch_name,
        status: asset.status,
        current_holder: asset.current_holder,
        purchase_date: asset.purchase_date,
        useful_life_years: usefulYears,
        salvage_percentage: salvagePercent,
        financials: dep
      };
    });

    return res.json({
      success: true,
      data: {
        summary: {
          totalAssetsEvaluated: items.length,
          totalOriginalCost,
          totalAccumulatedDepreciation,
          totalCurrentBookValue,
          totalAnnualDepreciation,
          depreciationRatio: totalOriginalCost > 0 
            ? Number(((totalAccumulatedDepreciation / totalOriginalCost) * 100).toFixed(2)) 
            : 0
        },
        categorySummary: Object.values(categoryBreakdown),
        assets: items
      }
    });
  } catch (err) {
    console.error('getDepreciationReport error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/reports/summary
 * Dashboard Metrics and Overview
 */
export async function getDashboardSummary(req, res) {
  try {
    if (isPostgresConnected) {
      const statsRes = await pool.query(`
        SELECT 
          COUNT(*) as total_assets,
          COUNT(*) FILTER (WHERE status = 'available') as available_assets,
          COUNT(*) FILTER (WHERE status = 'assigned') as assigned_assets,
          COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_assets,
          COUNT(*) FILTER (WHERE status = 'retired') as retired_assets,
          COUNT(*) FILTER (WHERE status = 'lost') as lost_assets,
          COALESCE(SUM(purchase_price), 0) as total_acquisition_cost
        FROM assets
      `);

      const recentAssignmentsRes = await pool.query(`
        SELECT asg.*, a.asset_tag, a.model_name 
        FROM asset_assignments asg 
        JOIN assets a ON asg.asset_id = a.id 
        ORDER BY asg.assigned_at DESC 
        LIMIT 5
      `);

      const recentMaintenanceRes = await pool.query(`
        SELECT m.*, a.asset_tag, a.model_name 
        FROM maintenance_logs m 
        JOIN assets a ON m.asset_id = a.id 
        ORDER BY m.created_at DESC 
        LIMIT 5
      `);

      const categoryDistributionRes = await pool.query(`
        SELECT c.name as category_name, COUNT(a.id) as count
        FROM categories c
        LEFT JOIN assets a ON c.id = a.category_id
        GROUP BY c.id, c.name
      `);

      const stats = statsRes.rows[0];

      return res.json({
        success: true,
        data: {
          stats: {
            total_assets: parseInt(stats.total_assets, 10),
            available: parseInt(stats.available_assets, 10),
            assigned: parseInt(stats.assigned_assets, 10),
            maintenance: parseInt(stats.maintenance_assets, 10),
            retired: parseInt(stats.retired_assets, 10),
            lost: parseInt(stats.lost_assets, 10),
            total_acquisition_cost: parseFloat(stats.total_acquisition_cost)
          },
          recentAssignments: recentAssignmentsRes.rows,
          recentMaintenance: recentMaintenanceRes.rows,
          categoryDistribution: categoryDistributionRes.rows
        }
      });
    } else {
      const store = getMockStore();
      const assets = store.assets;

      const total = assets.length;
      const available = assets.filter(a => a.status === 'available').length;
      const assigned = assets.filter(a => a.status === 'assigned').length;
      const maintenance = assets.filter(a => a.status === 'maintenance').length;
      const retired = assets.filter(a => a.status === 'retired').length;
      const lost = assets.filter(a => a.status === 'lost').length;
      const totalCost = assets.reduce((sum, a) => sum + (Number(a.purchase_price) || 0), 0);

      const recentAssignments = store.asset_assignments.slice(0, 5).map(asg => {
        const a = store.assets.find(x => x.id === asg.asset_id) || {};
        return {
          ...asg,
          asset_tag: a.asset_tag || 'Unknown',
          model_name: a.model_name || 'Unknown'
        };
      });

      const recentMaintenance = store.maintenance_logs.slice(0, 5).map(m => {
        const a = store.assets.find(x => x.id === m.asset_id) || {};
        return {
          ...m,
          asset_tag: a.asset_tag || 'Unknown',
          model_name: a.model_name || 'Unknown'
        };
      });

      const catDist = store.categories.map(c => {
        const count = assets.filter(a => a.category_id === c.id).length;
        return {
          category_name: c.name,
          count
        };
      });

      return res.json({
        success: true,
        data: {
          stats: {
            total_assets: total,
            available,
            assigned,
            maintenance,
            retired,
            lost,
            total_acquisition_cost: totalCost
          },
          recentAssignments,
          recentMaintenance,
          categoryDistribution: catDist
        }
      });
    }
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

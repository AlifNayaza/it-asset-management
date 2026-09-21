// File: frontend/src/services/mockData.js
// Client-Side Mock Database with LocalStorage Persistence for 100% Free Demo Mode

const STORAGE_KEY = 'it_asset_management_demo_db_v1';

// Initial seed data
const initialSeed = {
  categories: [
    { id: 1, name: "Laptop / Notebook", useful_life_years: 4, salvage_percentage: 5 },
    { id: 2, name: "Desktop PC / Workstation", useful_life_years: 5, salvage_percentage: 5 },
    { id: 3, name: "Monitor & Display", useful_life_years: 4, salvage_percentage: 5 },
    { id: 4, name: "Network & Security Device", useful_life_years: 5, salvage_percentage: 10 },
    { id: 5, name: "Server & Storage", useful_life_years: 5, salvage_percentage: 10 },
    { id: 6, name: "Printer & Peripheral", useful_life_years: 3, salvage_percentage: 5 }
  ],
  locations: [
    { id: 1, branch_name: "Headquarters Jakarta", room_name: "Server Room Lt. 3" },
    { id: 2, branch_name: "Headquarters Jakarta", room_name: "Software Engineering Lab Lt. 4" },
    { id: 3, branch_name: "Headquarters Jakarta", room_name: "Gudang IT & Storage Lt. 1" },
    { id: 4, branch_name: "Headquarters Jakarta", room_name: "Finance & HR Lt. 2" },
    { id: 5, branch_name: "Kantor Cabang Bandung", room_name: "Main Operations Hall" },
    { id: 6, branch_name: "Kantor Cabang Surabaya", room_name: "Branch Tech Hub" }
  ],
  assets: [
    {
      id: "ast-001",
      asset_tag: "AST-NB-2024-1001",
      serial_number: "PF-4X998A-2024",
      model_name: "Lenovo ThinkPad E14 Gen 4 (Core i7 / 16GB / 512GB SSD)",
      category_id: 1,
      location_id: 2,
      status: "assigned",
      purchase_date: "2024-01-15",
      purchase_price: 16500000,
      useful_life_years: 4,
      salvage_value: 825000,
      current_holder: "Ahmad Fauzi (Lead Backend Dev)",
      image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60",
      created_at: "2024-01-15T08:30:00.000Z",
      updated_at: "2024-01-15T08:30:00.000Z"
    },
    {
      id: "ast-002",
      asset_tag: "AST-NB-2024-1002",
      serial_number: "PF-4X999B-2024",
      model_name: "Lenovo ThinkPad T14s Gen 3 (AMD Ryzen 7 PRO / 32GB)",
      category_id: 1,
      location_id: 2,
      status: "assigned",
      purchase_date: "2024-02-10",
      purchase_price: 24000000,
      useful_life_years: 4,
      salvage_value: 1200000,
      current_holder: "Dewi Lestari (UI/UX Lead)",
      image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60",
      created_at: "2024-02-10T09:00:00.000Z",
      updated_at: "2024-02-10T09:00:00.000Z"
    },
    {
      id: "ast-003",
      asset_tag: "AST-NB-2024-1003",
      serial_number: "C02G871QMD6R",
      model_name: "MacBook Pro 14\" M3 Pro (18GB Unified / 512GB SSD Space Black)",
      category_id: 1,
      location_id: 3,
      status: "available",
      purchase_date: "2024-03-20",
      purchase_price: 31999000,
      useful_life_years: 4,
      salvage_value: 1599950,
      current_holder: null,
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
      created_at: "2024-03-20T10:00:00.000Z",
      updated_at: "2024-03-20T10:00:00.000Z"
    },
    {
      id: "ast-004",
      asset_tag: "AST-NB-2025-1004",
      serial_number: "5CD3490XYZ",
      model_name: "HP EliteBook 840 G10 (Intel Core i5-1335U / 16GB / 512GB)",
      category_id: 1,
      location_id: 3,
      status: "maintenance",
      purchase_date: "2025-01-08",
      purchase_price: 18200000,
      useful_life_years: 4,
      salvage_value: 910000,
      current_holder: null,
      image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60",
      created_at: "2025-01-08T11:00:00.000Z",
      updated_at: "2025-01-08T11:00:00.000Z"
    },
    {
      id: "ast-005",
      asset_tag: "AST-MON-2024-2001",
      serial_number: "CN-0U3421WE-9871",
      model_name: "Dell UltraSharp U3421WE 34\" Curved WQHD USB-C Hub Monitor",
      category_id: 3,
      location_id: 2,
      status: "assigned",
      purchase_date: "2024-03-01",
      purchase_price: 12800000,
      useful_life_years: 4,
      salvage_value: 640000,
      current_holder: "Ahmad Fauzi (Lead Backend Dev)",
      image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
      created_at: "2024-03-01T10:00:00.000Z",
      updated_at: "2024-03-01T10:00:00.000Z"
    },
    {
      id: "ast-006",
      asset_tag: "AST-MON-2024-2002",
      serial_number: "CN-0U2723QE-5512",
      model_name: "Dell UltraSharp U2723QE 27\" 4K IPS Black USB-C Hub",
      category_id: 3,
      location_id: 2,
      status: "assigned",
      purchase_date: "2024-03-01",
      purchase_price: 9500000,
      useful_life_years: 4,
      salvage_value: 475000,
      current_holder: "Dewi Lestari (UI/UX Lead)",
      image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
      created_at: "2024-03-01T10:00:00.000Z",
      updated_at: "2024-03-01T10:00:00.000Z"
    },
    {
      id: "ast-007",
      asset_tag: "AST-MON-2025-2003",
      serial_number: "LG-27UP850-2025A",
      model_name: "LG 27UP850N-W 27\" UHD 4K IPS HDR400 USB-C",
      category_id: 3,
      location_id: 3,
      status: "available",
      purchase_date: "2025-02-15",
      purchase_price: 6300000,
      useful_life_years: 4,
      salvage_value: 315000,
      current_holder: null,
      image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
      created_at: "2025-02-15T09:00:00.000Z",
      updated_at: "2025-02-15T09:00:00.000Z"
    },
    {
      id: "ast-008",
      asset_tag: "AST-NET-2023-3001",
      serial_number: "FOC24391XYZ",
      model_name: "Cisco Catalyst WS-C2960X-48FPS-L Gigabit PoE+ Switch",
      category_id: 4,
      location_id: 1,
      status: "assigned",
      purchase_date: "2023-06-10",
      purchase_price: 32000000,
      useful_life_years: 5,
      salvage_value: 3200000,
      current_holder: "Infrastructure Core Rack A1",
      image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60",
      created_at: "2023-06-10T12:00:00.000Z",
      updated_at: "2023-06-10T12:00:00.000Z"
    },
    {
      id: "ast-009",
      asset_tag: "AST-SRV-2023-4001",
      serial_number: "DL-R750-SRV-901",
      model_name: "Dell PowerEdge R750 (2x Intel Xeon Gold 6330 / 128GB ECC / 4x 1.92TB NVMe)",
      category_id: 5,
      location_id: 1,
      status: "assigned",
      purchase_date: "2023-03-15",
      purchase_price: 115000000,
      useful_life_years: 5,
      salvage_value: 11500000,
      current_holder: "Virtualization & Production DB Cluster",
      image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60",
      created_at: "2023-03-15T12:00:00.000Z",
      updated_at: "2023-03-15T12:00:00.000Z"
    },
    {
      id: "ast-010",
      asset_tag: "AST-PC-2024-5001",
      serial_number: "HP-Z2-G9-WK01",
      model_name: "HP Z2 Tower G9 Workstation (Intel Core i9-13900K / 64GB DDR5 / RTX A4000)",
      category_id: 2,
      location_id: 2,
      status: "assigned",
      purchase_date: "2024-05-10",
      purchase_price: 39500000,
      useful_life_years: 5,
      salvage_value: 1975000,
      current_holder: "Rudi Hermawan (AI / ML Engineer)",
      image_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60",
      created_at: "2024-05-10T11:00:00.000Z",
      updated_at: "2024-05-10T11:00:00.000Z"
    },
    {
      id: "ast-011",
      asset_tag: "AST-PRN-2024-6001",
      serial_number: "EPS-L6490-2024",
      model_name: "Epson EcoTank L6490 A4 Wi-Fi Duplex All-in-One Ink Tank Printer",
      category_id: 6,
      location_id: 4,
      status: "assigned",
      purchase_date: "2024-08-01",
      purchase_price: 7800000,
      useful_life_years: 3,
      salvage_value: 390000,
      current_holder: "Finance Department Lt. 2",
      image_url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&auto=format&fit=crop&q=60",
      created_at: "2024-08-01T09:00:00.000Z",
      updated_at: "2024-08-01T09:00:00.000Z"
    },
    {
      id: "ast-012",
      asset_tag: "AST-NB-2022-1008",
      serial_number: "PF-2K1100-2022",
      model_name: "Lenovo ThinkPad X1 Carbon Gen 9 (Core i7 / 16GB / 512GB)",
      category_id: 1,
      location_id: 3,
      status: "retired",
      purchase_date: "2022-01-10",
      purchase_price: 26000000,
      useful_life_years: 4,
      salvage_value: 1300000,
      current_holder: null,
      image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60",
      created_at: "2022-01-10T10:00:00.000Z",
      updated_at: "2022-01-10T10:00:00.000Z"
    }
  ],
  asset_assignments: [
    {
      id: "asg-001",
      asset_id: "ast-001",
      employee_name: "Ahmad Fauzi",
      employee_id_number: "EMP-IT-0042",
      assigned_at: "2024-01-16T09:00:00.000Z",
      returned_at: null,
      condition_on_checkout: "Kondisi baru segel box, kelengkapan charger adaptor dan backpack.",
      condition_on_return: null,
      assigned_by: "Bambang (IT Operations)",
      notes: "Serah terima laptop kerja utama Lead Backend Developer."
    },
    {
      id: "asg-002",
      asset_id: "ast-002",
      employee_name: "Dewi Lestari",
      employee_id_number: "EMP-UI-0018",
      assigned_at: "2024-02-12T10:00:00.000Z",
      returned_at: null,
      condition_on_checkout: "Mulus 100%, terpasang screen protector.",
      condition_on_return: null,
      assigned_by: "Bambang (IT Operations)",
      notes: "Laptop desain dan riset antarmuka pengguna."
    },
    {
      id: "asg-003",
      asset_id: "ast-003",
      employee_name: "Rian Hidayat",
      employee_id_number: "EMP-FE-0081",
      assigned_at: "2024-03-22T08:30:00.000Z",
      returned_at: "2025-01-10T14:00:00.000Z",
      condition_on_checkout: "Baru, box lengkap.",
      condition_on_return: "Fisik baik 98%, keyboard normal, charger lengkap.",
      assigned_by: "Bambang (IT Operations)",
      notes: "Pengembalian selesai proyek Q4, unit kembali ke gudang IT."
    }
  ],
  maintenance_logs: [
    {
      id: "mnt-001",
      asset_id: "ast-004",
      service_date: "2025-02-20",
      issue_description: "Baterai kembung dan touchpad terasa keras saat ditekan.",
      vendor_name: "HP Authorized Service Center Mall Ambasador",
      cost: 1450000,
      status: "in_progress",
      action_taken: "Penggantian modul baterai original 3-cell 51Wh dan kalibrasi touchpad.",
      created_at: "2025-02-20T10:00:00.000Z"
    }
  ],
  audit_logs: [
    {
      id: "aud-001",
      action: "INSERT",
      table_name: "assets",
      record_id: "ast-001",
      performed_by: "System Admin",
      timestamp: "2024-01-15T08:30:00.000Z",
      new_values: { model_name: "Lenovo ThinkPad E14 Gen 4", status: "available" }
    },
    {
      id: "aud-002",
      action: "CHECKOUT",
      table_name: "asset_assignments",
      record_id: "asg-001",
      performed_by: "Bambang (IT Operations)",
      timestamp: "2024-01-16T09:00:00.000Z",
      new_values: { employee_name: "Ahmad Fauzi", asset_tag: "AST-NB-2024-1001" }
    }
  ]
};

// --- Storage Management Helpers ---

export const getMockDB = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      return JSON.parse(JSON.stringify(initialSeed));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage, using initialSeed:', e);
    return JSON.parse(JSON.stringify(initialSeed));
  }
};

export const saveMockDB = (db) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving mock database to localStorage:', e);
  }
};

export const resetMockStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
  return JSON.parse(JSON.stringify(initialSeed));
};

// --- Straight-Line Depreciation Engine Helper ---

export const calculateMockDepreciation = (asset, asOfDate = new Date()) => {
  const purchaseDate = new Date(asset.purchase_date);
  const purchasePrice = parseFloat(asset.purchase_price) || 0;
  const usefulLifeYears = parseInt(asset.useful_life_years, 10) || 4;
  const salvageValue = parseFloat(asset.salvage_value) || (purchasePrice * 0.05);

  const diffMs = asOfDate.getTime() - purchaseDate.getTime();
  const ageYears = Math.max(0, diffMs / (1000 * 60 * 60 * 24 * 365.25));

  const depreciableAmount = Math.max(0, purchasePrice - salvageValue);
  const annualDepreciation = usefulLifeYears > 0 ? depreciableAmount / usefulLifeYears : 0;
  const monthlyDepreciation = annualDepreciation / 12;

  const accumulatedDepreciation = Math.min(
    depreciableAmount,
    Math.round(annualDepreciation * ageYears)
  );
  const currentBookValue = Math.max(salvageValue, purchasePrice - accumulatedDepreciation);
  const isFullyDepreciated = ageYears >= usefulLifeYears;

  return {
    purchasePrice,
    salvageValue,
    usefulLifeYears,
    annualDepreciation,
    monthlyDepreciation,
    accumulatedDepreciation,
    currentBookValue,
    isFullyDepreciated,
    ageYears: parseFloat(ageYears.toFixed(2))
  };
};

const enrichAsset = (asset, db) => {
  const category = db.categories.find((c) => String(c.id) === String(asset.category_id));
  const location = db.locations.find((l) => String(l.id) === String(asset.location_id));
  const depreciation = calculateMockDepreciation(asset);

  return {
    ...asset,
    category_name: category ? category.name : 'Hardware',
    category_useful_life_years: category ? category.useful_life_years : 4,
    category_salvage_percentage: category ? category.salvage_percentage : 5,
    branch_name: location ? location.branch_name : 'Gudang Utama',
    room_name: location ? location.room_name : 'Storage Room',
    depreciation
  };
};

// --- Mock API Implementations ---

export const mockGetDashboardSummary = async () => {
  const db = getMockDB();
  const totalAssets = db.assets.length;
  const availableCount = db.assets.filter((a) => a.status === 'available').length;
  const assignedCount = db.assets.filter((a) => a.status === 'assigned').length;
  const maintenanceCount = db.assets.filter((a) => a.status === 'maintenance').length;
  const retiredCount = db.assets.filter((a) => a.status === 'retired').length;

  let totalCapex = 0;
  let totalBookValue = 0;
  let totalAccumulatedDep = 0;

  db.assets.forEach((a) => {
    const dep = calculateMockDepreciation(a);
    totalCapex += dep.purchasePrice;
    totalBookValue += dep.currentBookValue;
    totalAccumulatedDep += dep.accumulatedDepreciation;
  });

  const categoryStats = db.categories.map((c) => ({
    category_id: c.id,
    category_name: c.name,
    count: db.assets.filter((a) => String(a.category_id) === String(c.id)).length
  }));

  const recentAssignments = db.asset_assignments.slice(-5).reverse().map((asg) => {
    const asset = db.assets.find((a) => a.id === asg.asset_id);
    return {
      ...asg,
      asset_tag: asset ? asset.asset_tag : 'AST-XXX',
      model_name: asset ? asset.model_name : 'Device'
    };
  });

  return {
    success: true,
    data: {
      stats: {
        total_assets: totalAssets,
        available: availableCount,
        assigned: assignedCount,
        maintenance: maintenanceCount,
        retired: retiredCount,
        lost: 0,
        total_acquisition_cost: totalCapex
      },
      totalAssets,
      availableCount,
      assignedCount,
      maintenanceCount,
      retiredCount,
      totalCapex,
      totalBookValue,
      totalAccumulatedDep,
      categoryStats,
      recentAssignments
    }
  };
};


export const mockGetAssets = async (params = {}) => {
  const db = getMockDB();
  let list = db.assets.map((a) => enrichAsset(a, db));

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.asset_tag?.toLowerCase().includes(q) ||
        a.model_name?.toLowerCase().includes(q) ||
        a.serial_number?.toLowerCase().includes(q) ||
        a.current_holder?.toLowerCase().includes(q) ||
        a.branch_name?.toLowerCase().includes(q) ||
        a.room_name?.toLowerCase().includes(q)
    );
  }

  if (params.status && params.status !== 'all') {
    list = list.filter((a) => a.status === params.status);
  }

  if (params.category_id && params.category_id !== 'all') {
    list = list.filter((a) => String(a.category_id) === String(params.category_id));
  }

  if (params.location_id && params.location_id !== 'all') {
    list = list.filter((a) => String(a.location_id) === String(params.location_id));
  }

  const total = list.length;
  const page = parseInt(params.page, 10) || 1;
  const limit = parseInt(params.limit, 10) || 100;
  const totalPages = Math.ceil(total / limit) || 1;
  const pagedList = list.slice((page - 1) * limit, page * limit);

  return {
    success: true,
    data: pagedList,
    pagination: { total, page, limit, totalPages }
  };
};

export const mockGetAssetById = async (id) => {
  const db = getMockDB();
  const asset = db.assets.find((a) => String(a.id) === String(id));
  if (!asset) throw new Error('Asset tidak ditemukan');

  const enriched = enrichAsset(asset, db);
  const assignments = db.asset_assignments
    .filter((asg) => String(asg.asset_id) === String(id))
    .reverse();
  const maintenance = db.maintenance_logs
    .filter((m) => String(m.asset_id) === String(id))
    .reverse();

  return {
    success: true,
    data: {
      ...enriched,
      assignments,
      maintenance
    }
  };
};

export const mockGetAssetQuickView = async (tag) => {
  const db = getMockDB();
  const asset = db.assets.find(
    (a) => a.asset_tag?.toLowerCase() === tag?.toLowerCase()
  );
  if (!asset) throw new Error('Asset dengan tag tersebut tidak ditemukan');
  return {
    success: true,
    data: enrichAsset(asset, db)
  };
};

export const mockCreateAsset = async (assetData) => {
  const db = getMockDB();
  const newId = 'ast-' + Date.now();
  const newAsset = {
    id: newId,
    asset_tag: assetData.asset_tag || `AST-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    serial_number: assetData.serial_number || `SN-${Date.now().toString().slice(-6)}`,
    model_name: assetData.model_name,
    category_id: parseInt(assetData.category_id, 10),
    location_id: assetData.location_id ? parseInt(assetData.location_id, 10) : null,
    status: assetData.status || 'available',
    purchase_date: assetData.purchase_date || new Date().toISOString().split('T')[0],
    purchase_price: parseFloat(assetData.purchase_price) || 0,
    useful_life_years: parseInt(assetData.useful_life_years, 10) || 4,
    salvage_value:
      assetData.salvage_value ||
      (parseFloat(assetData.purchase_price) * (parseFloat(assetData.salvage_percentage || 5) / 100)),
    current_holder: assetData.current_holder || null,
    image_url: assetData.image_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.assets.unshift(newAsset);
  db.audit_logs.unshift({
    id: 'aud-' + Date.now(),
    action: 'INSERT',
    table_name: 'assets',
    record_id: newId,
    performed_by: 'Demo Admin',
    timestamp: new Date().toISOString(),
    new_values: { asset_tag: newAsset.asset_tag, model_name: newAsset.model_name }
  });

  saveMockDB(db);
  return { success: true, data: enrichAsset(newAsset, db) };
};

export const mockUpdateAsset = async (id, assetData) => {
  const db = getMockDB();
  const idx = db.assets.findIndex((a) => String(a.id) === String(id));
  if (idx === -1) throw new Error('Aset tidak ditemukan untuk diperbarui');

  const old = db.assets[idx];
  const updated = {
    ...old,
    ...assetData,
    purchase_price: assetData.purchase_price !== undefined ? parseFloat(assetData.purchase_price) : old.purchase_price,
    useful_life_years: assetData.useful_life_years !== undefined ? parseInt(assetData.useful_life_years, 10) : old.useful_life_years,
    salvage_value: assetData.salvage_value !== undefined ? parseFloat(assetData.salvage_value) : old.salvage_value,
    updated_at: new Date().toISOString()
  };

  db.assets[idx] = updated;
  db.audit_logs.unshift({
    id: 'aud-' + Date.now(),
    action: 'UPDATE',
    table_name: 'assets',
    record_id: id,
    performed_by: 'Demo Admin',
    timestamp: new Date().toISOString(),
    new_values: { model_name: updated.model_name, status: updated.status }
  });

  saveMockDB(db);
  return { success: true, data: enrichAsset(updated, db) };
};

export const mockDeleteAsset = async (id) => {
  const db = getMockDB();
  const idx = db.assets.findIndex((a) => String(a.id) === String(id));
  if (idx === -1) throw new Error('Aset tidak ditemukan');

  const deleted = db.assets.splice(idx, 1)[0];
  db.audit_logs.unshift({
    id: 'aud-' + Date.now(),
    action: 'DELETE',
    table_name: 'assets',
    record_id: id,
    performed_by: 'Demo Admin',
    timestamp: new Date().toISOString(),
    old_values: { asset_tag: deleted.asset_tag, model_name: deleted.model_name }
  });

  saveMockDB(db);
  return { success: true, message: 'Aset berhasil dihapus' };
};

export const mockBulkImportAssets = async (items = []) => {
  const db = getMockDB();
  let count = 0;

  for (const item of items) {
    let catId = 1;
    if (item.category_name) {
      const matchCat = db.categories.find(
        (c) => c.name.toLowerCase() === item.category_name.toLowerCase().trim()
      );
      if (matchCat) catId = matchCat.id;
    }

    let locId = 1;
    if (item.branch_name) {
      const matchLoc = db.locations.find((l) =>
        l.branch_name.toLowerCase().includes(item.branch_name.toLowerCase().trim())
      );
      if (matchLoc) locId = matchLoc.id;
    }

    const price = parseFloat(item.purchase_price) || 0;
    const usefulYears = parseInt(item.useful_life_years, 10) || 4;
    const salvage = price * 0.05;

    const newAsset = {
      id: 'ast-bulk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      asset_tag: item.asset_tag || `AST-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
      serial_number: item.serial_number || `SN-${Date.now().toString().slice(-6)}`,
      model_name: item.model_name,
      category_id: catId,
      location_id: locId,
      status: item.status || 'available',
      purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
      purchase_price: price,
      useful_life_years: usefulYears,
      salvage_value: salvage,
      current_holder: null,
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.assets.unshift(newAsset);
    count++;
  }

  saveMockDB(db);
  return { success: true, count, message: `Berhasil mengimpor ${count} unit aset` };
};

export const mockGetAssetLabel = async (id) => {
  const db = getMockDB();
  const asset = db.assets.find((a) => String(a.id) === String(id));
  if (!asset) throw new Error('Aset tidak ditemukan');
  return { success: true, data: enrichAsset(asset, db) };
};

// --- Categories & Locations ---

export const mockGetCategories = async () => {
  const db = getMockDB();
  const list = db.categories.map((c) => ({
    ...c,
    total_assets: db.assets.filter((a) => String(a.category_id) === String(c.id)).length
  }));
  return { success: true, data: list };
};

export const mockCreateCategory = async (catData) => {
  const db = getMockDB();
  const newCat = {
    id: db.categories.length > 0 ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1,
    name: catData.name,
    useful_life_years: parseInt(catData.useful_life_years, 10) || 4,
    salvage_percentage: parseFloat(catData.salvage_percentage) || 5.0
  };
  db.categories.push(newCat);
  saveMockDB(db);
  return { success: true, data: newCat };
};

export const mockGetLocations = async () => {
  const db = getMockDB();
  return { success: true, data: db.locations };
};

export const mockCreateLocation = async (locData) => {
  const db = getMockDB();
  const newLoc = {
    id: db.locations.length > 0 ? Math.max(...db.locations.map((l) => l.id)) + 1 : 1,
    branch_name: locData.branch_name,
    room_name: locData.room_name
  };
  db.locations.push(newLoc);
  saveMockDB(db);
  return { success: true, data: newLoc };
};

// --- Handover / Assignments ---

export const mockGetAssignments = async (params = {}) => {
  const db = getMockDB();
  const list = db.asset_assignments.map((asg) => {
    const asset = db.assets.find((a) => String(a.id) === String(asg.asset_id));
    return {
      ...asg,
      asset_tag: asset ? asset.asset_tag : 'AST-XXX',
      model_name: asset ? asset.model_name : 'Unknown Device',
      serial_number: asset ? asset.serial_number : 'SN-XXX'
    };
  }).reverse();

  return { success: true, data: list };
};

export const mockCheckoutAsset = async (payload) => {
  const db = getMockDB();
  const asset = db.assets.find((a) => String(a.id) === String(payload.asset_id));
  if (!asset) throw new Error('Aset tidak ditemukan');

  asset.status = 'assigned';
  asset.current_holder = payload.employee_name;
  asset.updated_at = new Date().toISOString();

  const newAsg = {
    id: 'asg-' + Date.now(),
    asset_id: asset.id,
    employee_name: payload.employee_name,
    employee_id_number: payload.employee_id_number || 'N/A',
    assigned_at: new Date().toISOString(),
    returned_at: null,
    condition_on_checkout: payload.condition_on_checkout || 'Baik',
    condition_on_return: null,
    assigned_by: payload.assigned_by || 'Demo Admin',
    notes: payload.notes || ''
  };

  db.asset_assignments.unshift(newAsg);
  db.audit_logs.unshift({
    id: 'aud-' + Date.now(),
    action: 'CHECKOUT',
    table_name: 'asset_assignments',
    record_id: newAsg.id,
    performed_by: payload.assigned_by || 'Demo Admin',
    timestamp: new Date().toISOString(),
    new_values: { asset_tag: asset.asset_tag, employee_name: payload.employee_name }
  });

  saveMockDB(db);
  return { success: true, data: newAsg };
};

export const mockCheckinAsset = async (payload) => {
  const db = getMockDB();
  const asset = db.assets.find((a) => String(a.id) === String(payload.asset_id));
  if (!asset) throw new Error('Aset tidak ditemukan');

  asset.status = 'available';
  asset.current_holder = null;
  asset.updated_at = new Date().toISOString();

  const asg = db.asset_assignments.find(
    (a) => String(a.asset_id) === String(payload.asset_id) && !a.returned_at
  );
  if (asg) {
    asg.returned_at = new Date().toISOString();
    asg.condition_on_return = payload.condition_on_return || 'Normal';
  }

  db.audit_logs.unshift({
    id: 'aud-' + Date.now(),
    action: 'CHECKIN',
    table_name: 'asset_assignments',
    record_id: asg ? asg.id : 'asg-unknown',
    performed_by: payload.logged_by || 'Demo Admin',
    timestamp: new Date().toISOString(),
    new_values: { asset_tag: asset.asset_tag, condition: payload.condition_on_return }
  });

  saveMockDB(db);
  return { success: true, message: 'Unit berhasil dikembalikan ke gudang' };
};

// --- Maintenance ---

export const mockGetMaintenanceList = async () => {
  const db = getMockDB();
  const list = db.maintenance_logs.map((m) => {
    const asset = db.assets.find((a) => String(a.id) === String(m.asset_id));
    return {
      ...m,
      asset_tag: asset ? asset.asset_tag : 'AST-XXX',
      model_name: asset ? asset.model_name : 'Unknown Device',
      serial_number: asset ? asset.serial_number : 'SN-XXX'
    };
  }).reverse();

  return { success: true, data: list };
};

export const mockCreateMaintenance = async (payload) => {
  const db = getMockDB();
  const asset = db.assets.find((a) => String(a.id) === String(payload.asset_id));
  if (asset) {
    asset.status = 'maintenance';
    asset.updated_at = new Date().toISOString();
  }

  const newMnt = {
    id: 'mnt-' + Date.now(),
    asset_id: payload.asset_id,
    service_date: payload.service_date || new Date().toISOString().split('T')[0],
    issue_description: payload.issue_description,
    vendor_name: payload.vendor_name || 'Vendor Servis Rekanan',
    cost: parseFloat(payload.cost) || 0,
    status: 'in_progress',
    action_taken: payload.action_taken || '',
    created_at: new Date().toISOString()
  };

  db.maintenance_logs.unshift(newMnt);
  saveMockDB(db);
  return { success: true, data: newMnt };
};

export const mockCompleteMaintenance = async (id, payload) => {
  const db = getMockDB();
  const mnt = db.maintenance_logs.find((m) => String(m.id) === String(id));
  if (mnt) {
    mnt.status = 'completed';
    mnt.action_taken = payload.action_taken || mnt.action_taken;
    const asset = db.assets.find((a) => String(a.id) === String(mnt.asset_id));
    if (asset) {
      asset.status = 'available';
      asset.updated_at = new Date().toISOString();
    }
  }

  saveMockDB(db);
  return { success: true, data: mnt };
};

// --- Depreciation Report ---

export const mockGetDepreciationReport = async () => {
  const db = getMockDB();
  let totalCapex = 0;
  let totalBookValue = 0;
  let totalAccumulatedDep = 0;

  const enrichedAssets = db.assets.map((a) => {
    const dep = calculateMockDepreciation(a);
    totalCapex += dep.purchasePrice;
    totalBookValue += dep.currentBookValue;
    totalAccumulatedDep += dep.accumulatedDepreciation;
    return enrichAsset(a, db);
  });

  return {
    success: true,
    data: {
      summary: {
        totalAssets: db.assets.length,
        totalCapex,
        totalBookValue,
        totalAccumulatedDep
      },
      assets: enrichedAssets
    }
  };
};

// --- Audit Logs ---

export const mockGetAuditLogs = async () => {
  const db = getMockDB();
  return { success: true, data: db.audit_logs };
};

// --- File Upload (Base64 Data URL) ---

export const mockUploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        success: true,
        filePath: reader.result
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// File: backend/src/seed.js
import { pool, isPostgresConnected, getMockStore, saveMockStore } from './db.js';
import crypto from 'crypto';

const SEED_CATEGORIES = [
  { id: 1, name: 'Laptop / Notebook', useful_life_years: 4, salvage_percentage: 5.00 },
  { id: 2, name: 'Desktop PC / Workstation', useful_life_years: 5, salvage_percentage: 5.00 },
  { id: 3, name: 'Monitor & Display', useful_life_years: 4, salvage_percentage: 5.00 },
  { id: 4, name: 'Network & Security Device', useful_life_years: 5, salvage_percentage: 10.00 },
  { id: 5, name: 'Server & Storage', useful_life_years: 5, salvage_percentage: 10.00 },
  { id: 6, name: 'Printer & Peripheral', useful_life_years: 3, salvage_percentage: 5.00 }
];

const SEED_LOCATIONS = [
  { id: 1, branch_name: 'Headquarters Jakarta', room_name: 'Server Room Fl 3' },
  { id: 2, branch_name: 'Headquarters Jakarta', room_name: 'Software Engineering Lab Fl 4' },
  { id: 3, branch_name: 'Headquarters Jakarta', room_name: 'IT Warehouse & Storage Fl 1' },
  { id: 4, branch_name: 'Headquarters Jakarta', room_name: 'Finance & HR Floor 2' },
  { id: 5, branch_name: 'Bandung Branch Office', room_name: 'Main Operations Hall' },
  { id: 6, branch_name: 'Surabaya Branch Office', room_name: 'Branch Tech Hub' }
];

const SEED_ASSETS = [
  {
    asset_tag: 'AST-NB-2024-1001',
    serial_number: 'PF-4X998A-2024',
    model_name: 'Lenovo ThinkPad E14 Gen 4 (Core i7 / 16GB / 512GB SSD)',
    category_id: 1,
    location_id: 2,
    status: 'assigned',
    purchase_date: '2024-01-15',
    purchase_price: 16500000,
    useful_life_years: 4,
    salvage_value: 825000,
    current_holder: 'Ahmad Fauzi (Lead Backend Dev)',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NB-2024-1002',
    serial_number: 'PF-4X999B-2024',
    model_name: 'Lenovo ThinkPad T14s Gen 3 (AMD Ryzen 7 PRO / 32GB)',
    category_id: 1,
    location_id: 2,
    status: 'assigned',
    purchase_date: '2024-02-10',
    purchase_price: 24000000,
    useful_life_years: 4,
    salvage_value: 1200000,
    current_holder: 'Siti Rahma (DevOps Specialist)',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NB-2025-1003',
    serial_number: 'C02G8790MD6T',
    model_name: 'Apple MacBook Pro 14" M3 Pro (18GB / 512GB SSD Space Black)',
    category_id: 1,
    location_id: 2,
    status: 'assigned',
    purchase_date: '2025-01-08',
    purchase_price: 33500000,
    useful_life_years: 4,
    salvage_value: 1675000,
    current_holder: 'Budi Santoso (Principal Mobile Dev)',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NB-2025-1004',
    serial_number: 'C02G8791MD7U',
    model_name: 'Apple MacBook Air 15" M2 (16GB / 512GB Midnight)',
    category_id: 1,
    location_id: 4,
    status: 'assigned',
    purchase_date: '2025-03-20',
    purchase_price: 21999000,
    useful_life_years: 4,
    salvage_value: 1099950,
    current_holder: 'Dewi Lestari (UI/UX Lead)',
    image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NB-2025-1005',
    serial_number: 'DL-LAT-5440-881',
    model_name: 'Dell Latitude 5440 (Core i5-1335U / 16GB / 512GB SSD)',
    category_id: 1,
    location_id: 3,
    status: 'available',
    purchase_date: '2025-05-12',
    purchase_price: 15200000,
    useful_life_years: 4,
    salvage_value: 760000,
    current_holder: null,
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NB-2025-1006',
    serial_number: 'DL-LAT-5440-882',
    model_name: 'Dell Latitude 5440 (Core i5-1335U / 16GB / 512GB SSD)',
    category_id: 1,
    location_id: 3,
    status: 'available',
    purchase_date: '2025-05-12',
    purchase_price: 15200000,
    useful_life_years: 4,
    salvage_value: 760000,
    current_holder: null,
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NB-2023-1007',
    serial_number: 'HP-EB-840G9-33',
    model_name: 'HP EliteBook 840 G9 (Core i7-1260P / 16GB / 512GB)',
    category_id: 1,
    location_id: 3,
    status: 'maintenance',
    purchase_date: '2023-08-14',
    purchase_price: 18500000,
    useful_life_years: 4,
    salvage_value: 925000,
    current_holder: null,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-MON-2024-2001',
    serial_number: 'CN-0U3421WE-9871',
    model_name: 'Dell UltraSharp U3421WE 34" Curved WQHD USB-C Hub Monitor',
    category_id: 3,
    location_id: 2,
    status: 'assigned',
    purchase_date: '2024-03-01',
    purchase_price: 12800000,
    useful_life_years: 4,
    salvage_value: 640000,
    current_holder: 'Ahmad Fauzi (Lead Backend Dev)',
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-MON-2024-2002',
    serial_number: 'CN-0U2723QE-5512',
    model_name: 'Dell UltraSharp U2723QE 27" 4K IPS Black USB-C Hub',
    category_id: 3,
    location_id: 2,
    status: 'assigned',
    purchase_date: '2024-03-01',
    purchase_price: 9500000,
    useful_life_years: 4,
    salvage_value: 475000,
    current_holder: 'Dewi Lestari (UI/UX Lead)',
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-MON-2025-2003',
    serial_number: 'LG-27UP850-2025A',
    model_name: 'LG 27UP850N-W 27" UHD 4K IPS HDR400 USB-C',
    category_id: 3,
    location_id: 3,
    status: 'available',
    purchase_date: '2025-02-15',
    purchase_price: 6300000,
    useful_life_years: 4,
    salvage_value: 315000,
    current_holder: null,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NET-2023-3001',
    serial_number: 'FOC24391XYZ',
    model_name: 'Cisco Catalyst WS-C2960X-48FPS-L Gigabit PoE+ Switch',
    category_id: 4,
    location_id: 1,
    status: 'assigned',
    purchase_date: '2023-04-10',
    purchase_price: 38000000,
    useful_life_years: 5,
    salvage_value: 3800000,
    current_holder: 'Infrastructure / NOC Team',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NET-2024-3002',
    serial_number: 'UB-U6PRO-88912',
    model_name: 'Ubiquiti UniFi U6-Pro WiFi 6 Enterprise Access Point',
    category_id: 4,
    location_id: 2,
    status: 'assigned',
    purchase_date: '2024-06-18',
    purchase_price: 3200000,
    useful_life_years: 5,
    salvage_value: 320000,
    current_holder: 'Headquarters Wireless Grid',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NET-2024-3003',
    serial_number: 'UB-UDM-SE-1002',
    model_name: 'Ubiquiti UniFi Dream Machine Special Edition (UDM-SE)',
    category_id: 4,
    location_id: 1,
    status: 'assigned',
    purchase_date: '2024-06-18',
    purchase_price: 10500000,
    useful_life_years: 5,
    salvage_value: 1050000,
    current_holder: 'Headquarters Main Gateway',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NET-2023-3004',
    serial_number: 'MK-CCR2004-16G',
    model_name: 'MikroTik CCR2004-16G-2S+ Core Cloud Router',
    category_id: 4,
    location_id: 5,
    status: 'assigned',
    purchase_date: '2023-11-05',
    purchase_price: 8900000,
    useful_life_years: 5,
    salvage_value: 890000,
    current_holder: 'Bandung Office Gateway',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-SRV-2023-4001',
    serial_number: 'DL-R750-SRV-901',
    model_name: 'Dell PowerEdge R750 (2x Intel Xeon Gold 6330 / 128GB ECC / 4x 1.92TB NVMe)',
    category_id: 5,
    location_id: 1,
    status: 'assigned',
    purchase_date: '2023-03-15',
    purchase_price: 115000000,
    useful_life_years: 5,
    salvage_value: 11500000,
    current_holder: 'Virtualization & Production DB Cluster',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-SRV-2024-4002',
    serial_number: 'SYN-DS1821P-77',
    model_name: 'Synology DiskStation DS1821+ 8-Bay NAS (8x 8TB Enterprise SATA)',
    category_id: 5,
    location_id: 1,
    status: 'assigned',
    purchase_date: '2024-04-12',
    purchase_price: 45000000,
    useful_life_years: 5,
    salvage_value: 4500000,
    current_holder: 'Backup & Disaster Recovery Storage',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-PC-2024-5001',
    serial_number: 'HP-Z2-G9-WK01',
    model_name: 'HP Z2 Tower G9 Workstation (Intel Core i9-13900K / 64GB DDR5 / RTX A4000)',
    category_id: 2,
    location_id: 2,
    status: 'assigned',
    purchase_date: '2024-05-10',
    purchase_price: 39500000,
    useful_life_years: 5,
    salvage_value: 1975000,
    current_holder: 'Rudi Hermawan (AI / ML Engineer)',
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-PC-2025-5002',
    serial_number: 'DL-OPT-7010-09',
    model_name: 'Dell OptiPlex 7010 Micro (Core i5-13500T / 16GB / 512GB SSD)',
    category_id: 2,
    location_id: 4,
    status: 'assigned',
    purchase_date: '2025-02-01',
    purchase_price: 11800000,
    useful_life_years: 5,
    salvage_value: 590000,
    current_holder: 'Indah Permata (Accounting Staff)',
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-PRN-2024-6001',
    serial_number: 'EPS-L6490-2024',
    model_name: 'Epson EcoTank L6490 A4 Wi-Fi Duplex All-in-One Ink Tank Printer',
    category_id: 6,
    location_id: 4,
    status: 'assigned',
    purchase_date: '2024-08-01',
    purchase_price: 7800000,
    useful_life_years: 3,
    salvage_value: 390000,
    current_holder: 'Finance Department Floor 2',
    image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-PRN-2023-6002',
    serial_number: 'HP-LJ-M404DN-11',
    model_name: 'HP LaserJet Pro M404dn Network Laser Printer',
    category_id: 6,
    location_id: 3,
    status: 'available',
    purchase_date: '2023-09-15',
    purchase_price: 4900000,
    useful_life_years: 3,
    salvage_value: 245000,
    current_holder: null,
    image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&auto=format&fit=crop&q=60'
  },
  {
    asset_tag: 'AST-NB-2022-1008',
    serial_number: 'PF-2K1100-2022',
    model_name: 'Lenovo ThinkPad X1 Carbon Gen 9 (Core i7 / 16GB / 512GB)',
    category_id: 1,
    location_id: 3,
    status: 'retired',
    purchase_date: '2022-01-10',
    purchase_price: 26000000,
    useful_life_years: 4,
    salvage_value: 1300000,
    current_holder: null,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60'
  }
];

export async function seedDatabase(client = pool) {
  try {
    console.log('🌱 Starting Enterprise IT Asset Seeding...');

    if (isPostgresConnected) {
      // 1. Seed Categories
      for (const cat of SEED_CATEGORIES) {
        await client.query(
          `INSERT INTO categories (id, name, useful_life_years, salvage_percentage)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (name) DO UPDATE SET useful_life_years = EXCLUDED.useful_life_years`,
          [cat.id, cat.name, cat.useful_life_years, cat.salvage_percentage]
        );
      }
      await client.query(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))`);

      // 2. Seed Locations
      for (const loc of SEED_LOCATIONS) {
        await client.query(
          `INSERT INTO locations (id, branch_name, room_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO NOTHING`,
          [loc.id, loc.branch_name, loc.room_name]
        );
      }
      await client.query(`SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations))`);

      // 3. Seed Assets
      const createdAssets = [];
      for (const a of SEED_ASSETS) {
        const res = await client.query(
          `INSERT INTO assets 
           (asset_tag, serial_number, model_name, category_id, location_id, status, purchase_date, purchase_price, useful_life_years, salvage_value, current_holder, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (asset_tag) DO UPDATE SET model_name = EXCLUDED.model_name
           RETURNING *`,
          [
            a.asset_tag,
            a.serial_number,
            a.model_name,
            a.category_id,
            a.location_id,
            a.status,
            a.purchase_date,
            a.purchase_price,
            a.useful_life_years,
            a.salvage_value,
            a.current_holder,
            a.image_url
          ]
        );
        createdAssets.push(res.rows[0]);
      }

      // 4. Seed Assignments
      const laptop1 = createdAssets.find(x => x.asset_tag === 'AST-NB-2024-1001');
      if (laptop1) {
        await client.query(
          `INSERT INTO asset_assignments (asset_id, employee_name, employee_id_number, assigned_at, condition_on_checkout, assigned_by, notes)
           VALUES ($1, 'Ahmad Fauzi', 'EMP-IT-0042', '2024-01-16 09:00:00+07', 'Brand new, sealed box with charger and bag', 'Bambang (IT Admin)', 'Serah terima laptop kerja lead developer')
           ON CONFLICT DO NOTHING`,
          [laptop1.id]
        );
      }

      const macbook = createdAssets.find(x => x.asset_tag === 'AST-NB-2025-1003');
      if (macbook) {
        await client.query(
          `INSERT INTO asset_assignments (asset_id, employee_name, employee_id_number, assigned_at, condition_on_checkout, assigned_by, notes)
           VALUES ($1, 'Budi Santoso', 'EMP-MOB-0105', '2025-01-10 10:30:00+07', 'Kondisi 100% mulus dengan charger 70W USB-C', 'Bambang (IT Admin)', 'Peralatan kerja Principal Mobile Engineer')
           ON CONFLICT DO NOTHING`,
          [macbook.id]
        );
      }

      // 5. Seed Maintenance Logs
      const brokenLaptop = createdAssets.find(x => x.asset_tag === 'AST-NB-2023-1007');
      if (brokenLaptop) {
        await client.query(
          `INSERT INTO maintenance_logs (asset_id, service_date, completion_date, vendor_name, issue_description, cost, logged_by)
           VALUES ($1, '2025-02-20', NULL, 'PT Mitra Servisindo Mandiri', 'Layar LCD berkedip dan penggantian baterai yang aus', 1850000, 'Bambang (IT Admin)')
           ON CONFLICT DO NOTHING`,
          [brokenLaptop.id]
        );
      }

      // 6. Seed Audit Logs with JSONB
      await client.query(
        `INSERT INTO audit_logs (table_name, record_id, action_type, changed_by, payload_before, payload_after, logged_at)
         VALUES ('assets', 'INITIAL_MIGRATION', 'INSERT', 'System Seeder', NULL, '{"seed_count": 21, "status": "success"}'::jsonb, CURRENT_TIMESTAMP)`
      );

      console.log('✅ Enterprise IT Asset Seeding completed successfully (PostgreSQL).');
    } else {
      // Mock Store Seeding
      const store = getMockStore();
      store.categories = SEED_CATEGORIES;
      store.locations = SEED_LOCATIONS;
      store.assets = SEED_ASSETS.map((a, idx) => ({
        id: crypto.randomUUID(),
        ...a,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Assignments
      const laptop1 = store.assets.find(x => x.asset_tag === 'AST-NB-2024-1001');
      if (laptop1) {
        store.asset_assignments.push({
          id: crypto.randomUUID(),
          asset_id: laptop1.id,
          employee_name: 'Ahmad Fauzi',
          employee_id_number: 'EMP-IT-0042',
          assigned_at: '2024-01-16T09:00:00.000Z',
          returned_at: null,
          condition_on_checkout: 'Brand new, sealed box with charger and bag',
          condition_on_return: null,
          handover_doc_path: null,
          assigned_by: 'Bambang (IT Admin)',
          notes: 'Serah terima laptop kerja lead developer'
        });
      }

      // Maintenance
      const brokenLaptop = store.assets.find(x => x.asset_tag === 'AST-NB-2023-1007');
      if (brokenLaptop) {
        store.maintenance_logs.push({
          id: crypto.randomUUID(),
          asset_id: brokenLaptop.id,
          service_date: '2025-02-20',
          completion_date: null,
          vendor_name: 'PT Mitra Servisindo Mandiri',
          issue_description: 'Layar LCD berkedip dan penggantian baterai yang aus',
          cost: 1850000,
          invoice_path: null,
          logged_by: 'Bambang (IT Admin)',
          created_at: new Date().toISOString()
        });
      }

      // Audit Log
      store.audit_logs.push({
        id: '1',
        table_name: 'assets',
        record_id: 'INITIAL_MIGRATION',
        action_type: 'INSERT',
        changed_by: 'System Seeder',
        payload_before: null,
        payload_after: { seed_count: 21, status: 'success' },
        logged_at: new Date().toISOString()
      });

      saveMockStore();
      console.log('✅ Enterprise IT Asset Seeding completed successfully (Local Store).');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('Done.');
    process.exit(0);
  });
}

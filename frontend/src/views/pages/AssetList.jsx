// File: frontend/src/views/pages/AssetList.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  Filter,
  Plus,
  Camera,
  RefreshCw,
  Boxes,
  Download,
  SlidersHorizontal,
  Printer,
  Cpu,
  Layers,
  CheckSquare,
  FileSpreadsheet,
  Settings2,
  X,
  MapPin
} from 'lucide-react';
import AssetTable from '../../components/AssetTable';
import EditAssetModal from '../../components/EditAssetModal';
import ImportCsvModal from '../../components/ImportCsvModal';
import ManageMasterModal from '../../components/ManageMasterModal';
import BatchQRPrintModal from '../../components/BatchQRPrintModal';
import { getAssets, getCategories, getLocations, deleteAsset } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AssetList({
  onSelectAsset,
  onPrintLabel,
  onOpenAddAsset,
  onOpenScanner,
  onCheckout,
  onCheckin,
  onMaintenance
}) {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search with debounce state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal States
  const [editingAsset, setEditingAsset] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadMasterData();
  }, []);

  // Debounce search effect (300ms delay)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    loadAssets();
  }, [debouncedSearch, statusFilter, categoryFilter, locationFilter, page]);

  const loadMasterData = async () => {
    try {
      const [catRes, locRes] = await Promise.all([getCategories(), getLocations()]);
      if (catRes.success) setCategories(catRes.data);
      if (locRes.success) setLocations(locRes.data);
    } catch (e) {
      console.error('Failed to load master metadata:', e);
    }
  };

  const loadAssets = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
        location_id: locationFilter !== 'all' ? locationFilter : undefined,
        page,
        limit: 100
      };
      const res = await getAssets(params);
      if (res.success) {
        setAssets(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (e) {
      console.error('Failed to load assets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data aset ini dari sistem?')) {
      try {
        await deleteAsset(id);
        showSuccess('Data aset berhasil dihapus dari sistem.');
        loadAssets();
      } catch (err) {
        showError('Gagal menghapus aset: ' + err.message);
      }
    }
  };

  const exportCSV = () => {
    if (assets.length === 0) return showError('Tidak ada data aset untuk diekspor');
    const headers = [
      'Asset Tag',
      'Serial Number',
      'Model',
      'Category',
      'Branch',
      'Room',
      'Status',
      'Current Holder',
      'Purchase Date',
      'Purchase Price',
      'Book Value'
    ];
    const rows = assets.map((a) => [
      a.asset_tag,
      `"${a.serial_number}"`,
      `"${a.model_name}"`,
      `"${a.category_name || ''}"`,
      `"${a.branch_name || ''}"`,
      `"${a.room_name || ''}"`,
      a.status,
      `"${a.current_holder || ''}"`,
      a.purchase_date?.split('T')[0] || a.purchase_date,
      a.purchase_price,
      a.depreciation?.currentBookValue || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `katalog_inventaris_it_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('File CSV inventaris aset berhasil diunduh!');
  };

  // Toggle selection for batch printing
  const toggleSelectAsset = (id) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    if (selectedAssetIds.length === assets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map((a) => a.id));
    }
  };

  const selectedAssetsForPrint = assets.filter((a) => selectedAssetIds.includes(a.id));

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Title & Operational Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-sky-600" />
            <span>Katalog Master Inventaris Aset</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Total {pagination.total} unit perangkat keras terdata dalam basis data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Print Button if selected */}
          {selectedAssetIds.length > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition animate-scaleUp"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Massal ({selectedAssetIds.length} Unit)</span>
            </button>
          )}

          {/* Import CSV Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition"
            title="Import unit dari file spreadsheet CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          {/* Manage Master Button */}
          <button
            onClick={() => setShowMasterModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition"
            title="Kelola Master Kategori & Lokasi"
          >
            <Settings2 className="w-4 h-4 text-slate-600" />
            <span>Kelola Master</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          {/* Scan QR */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition"
          >
            <Camera className="w-4 h-4 text-sky-600" />
            <span>Scan QR</span>
          </button>

          {/* Add Asset */}
          <button
            onClick={onOpenAddAsset}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit</span>
          </button>
        </div>
      </div>

      {/* Category Pills Quick Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            setCategoryFilter('all');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            categoryFilter === 'all'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCategoryFilter(String(c.id));
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              String(categoryFilter) === String(c.id)
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input with Debounce */}
        <div className="relative w-full md:w-96 flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Tag (AST-...), Serial, Model, Pemegang..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Location Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Lokasi:</span>
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-bold max-w-[150px] truncate"
            >
              <option value="all">Semua Lokasi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={String(loc.id)}>
                  {loc.branch_name} - {loc.room_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-bold"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia di Gudang</option>
              <option value="assigned">Sedang Dipinjam Staf</option>
              <option value="maintenance">Dalam Servis</option>
              <option value="retired">Afkir / Pensiun</option>
              <option value="lost">Hilang</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadAssets}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-300 transition"
            title="Muat ulang tabel"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Asset Table / Card Grid */}
      <AssetTable
        assets={assets}
        loading={loading}
        onSelectAsset={onSelectAsset}
        onPrintLabel={onPrintLabel}
        onCheckout={onCheckout}
        onCheckin={onCheckin}
        onMaintenance={onMaintenance}
        onEdit={(asset) => setEditingAsset(asset)}
        onDelete={handleDelete}
        selectedAssetIds={selectedAssetIds}
        onToggleSelect={toggleSelectAsset}
        onSelectAll={selectAllVisible}
      />

      {/* Edit Asset Modal */}
      {editingAsset && (
        <EditAssetModal
          isOpen={!!editingAsset}
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSuccess={() => {
            loadAssets();
          }}
        />
      )}

      {/* Bulk CSV Import Modal */}
      {showImportModal && (
        <ImportCsvModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            loadAssets();
          }}
        />
      )}

      {/* Manage Master Categories & Locations Modal */}
      {showMasterModal && (
        <ManageMasterModal
          isOpen={showMasterModal}
          onClose={() => setShowMasterModal(false)}
          onMasterUpdated={() => {
            loadMasterData();
            loadAssets();
          }}
        />
      )}

      {/* Batch QR Print Modal */}
      {showBatchModal && (
        <BatchQRPrintModal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          assets={selectedAssetsForPrint}
        />
      )}
    </div>
  );
}

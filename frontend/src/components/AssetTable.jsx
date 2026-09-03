// File: frontend/src/components/AssetTable.jsx
import React, { useState } from 'react';
import {
  Printer,
  ExternalLink,
  Trash2,
  UserCheck,
  RotateCcw,
  Wrench,
  QrCode,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Image as ImageIcon
} from 'lucide-react';

export default function AssetTable({
  assets = [],
  loading = false,
  onSelectAsset,
  onPrintLabel,
  onCheckout,
  onCheckin,
  onMaintenance,
  onEdit,
  onDelete,
  selectedAssetIds = [],
  onToggleSelect,
  onSelectAll
}) {

  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Client-side pagination for lightning-fast performance
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Tersedia
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Dipinjam
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Servis
          </span>
        );
      case 'retired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            Afkir
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-medium">Memuat katalog aset...</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <QrCode className="w-10 h-10 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Data Aset</h4>
        <p className="text-xs text-slate-500">Belum ada unit perangkat yang terdaftar atau cocok dengan filter.</p>
      </div>
    );
  }

  const isAllSelected = assets.length > 0 && selectedAssetIds.length === assets.length;

  // Pagination Slice
  const totalPages = Math.ceil(assets.length / pageSize) || 1;
  const currentAssets = assets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-3">
      {/* Top View Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 px-1">
        <div className="flex items-center gap-3">
          {onSelectAll && (
            <button
              onClick={onSelectAll}
              className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-sky-600 transition"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-sky-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Pilih Semua ({assets.length})</span>
            </button>
          )}
          <span>Total <strong>{assets.length}</strong> unit</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Page Size selector */}
          <div className="flex items-center gap-1">
            <span>Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="space-y-3">
          {/* Mobile Card List (When in Table Mode on Mobile) */}
          <div className="block sm:hidden space-y-3">
            {currentAssets.map((asset) => {
              const isSelected = selectedAssetIds.includes(asset.id);
              return (
                <div
                  key={asset.id}
                  className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 ${
                    isSelected ? 'ring-2 ring-sky-500 bg-sky-50/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect && onToggleSelect(asset.id)}
                        className="rounded text-sky-600 focus:ring-sky-500 mt-1"
                      />
                      {asset.image_url && (
                        <img
                          src={asset.image_url.startsWith('http') ? asset.image_url : `http://localhost:5000${asset.image_url}`}
                          alt={asset.model_name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                      )}
                      <div>
                        <button
                          onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                          className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200"
                        >
                          {asset.asset_tag}
                        </button>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{asset.model_name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">S/N: {asset.serial_number}</p>
                      </div>
                    </div>
                    {getStatusBadge(asset.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kategori & Lokasi:</span>
                      <strong className="text-slate-900 text-xs truncate block">{asset.category_name}</strong>
                      <span className="text-[10px] text-slate-500 truncate block">{asset.branch_name} - {asset.room_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pemegang:</span>
                      <strong className="text-slate-900 text-xs truncate block">{asset.current_holder || 'Gudang IT'}</strong>
                      <span className="text-[10px] font-mono text-slate-500 truncate block">
                        Buku: Rp {Number(asset.depreciation?.currentBookValue || asset.purchase_price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    {asset.status === 'available' && (
                      <button
                        onClick={() => onCheckout && onCheckout(asset)}
                        className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition border border-emerald-200 flex items-center justify-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Serah Terima</span>
                      </button>
                    )}

                    {asset.status === 'assigned' && (
                      <button
                        onClick={() => onCheckin && onCheckin(asset)}
                        className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg text-xs transition border border-sky-200 flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kembalikan</span>
                      </button>
                    )}

                    {onEdit && (
                      <button
                        onClick={() => onEdit(asset)}
                        className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition border border-sky-200"
                        title="Edit Data Aset"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onPrintLabel && onPrintLabel(asset)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                      title="Cetak Label"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                      title="Detail"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={onSelectAll}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                  </th>
                  <th className="py-3 px-3">Tag & Perangkat</th>
                  <th className="py-3 px-3">Kategori & Lokasi</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Pemegang Aktif</th>
                  <th className="py-3 px-3">Nilai Buku (IDR)</th>
                  <th className="py-3 px-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect && onToggleSelect(asset.id)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {asset.image_url ? (
                            <img
                              src={asset.image_url.startsWith('http') ? asset.image_url : `http://localhost:5000${asset.image_url}`}
                              alt={asset.model_name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                              className="font-mono font-bold text-xs text-sky-700 hover:underline block truncate text-left"
                            >
                              {asset.asset_tag}
                            </button>
                            <p className="text-slate-900 font-bold text-xs line-clamp-1">{asset.model_name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">S/N: {asset.serial_number}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-xs">
                        <p className="font-semibold text-slate-800">{asset.category_name || 'Hardware'}</p>
                        <p className="text-slate-500 text-[10px]">{asset.branch_name} - {asset.room_name}</p>
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(asset.status)}
                      </td>

                      <td className="py-3 px-3 text-xs">
                        {asset.current_holder ? (
                          <div>
                            <p className="font-bold text-slate-900">{asset.current_holder}</p>
                            <span className="text-[10px] text-slate-500">Staf Pengguna</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Tersedia di Gudang</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-xs font-mono">
                        <span className="font-bold text-slate-900 block">
                          Rp {Number(asset.depreciation?.currentBookValue || asset.purchase_price).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Beli: Rp {Number(asset.purchase_price).toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {asset.status === 'available' && (
                            <button
                              onClick={() => onCheckout && onCheckout(asset)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition border border-emerald-200"
                              title="Serah Terima ke Karyawan"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {asset.status === 'assigned' && (
                            <button
                              onClick={() => onCheckin && onCheckin(asset)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition border border-sky-200"
                              title="Kembalikan ke Gudang"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onEdit && (
                            <button
                              onClick={() => onEdit(asset)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition border border-sky-200"
                              title="Edit Data Aset"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onPrintLabel && onPrintLabel(asset)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                            title="Cetak Label Stiker QR"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                            title="Lihat Lembar Spesifikasi"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDelete && onDelete(asset.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200"
                            title="Hapus Aset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 bg-white shadow-xs text-xs text-slate-600">
              <span>Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {assets.length} Unit)</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-lg font-bold ${
                      currentPage === pg ? 'bg-sky-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. GRID / CARD VIEW */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentAssets.map((asset) => {
              const isSelected = selectedAssetIds.includes(asset.id);
              return (
                <div
                  key={asset.id}
                  className={`p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-sm transition space-y-2.5 flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-sky-500 bg-sky-50/20' : ''
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect && onToggleSelect(asset.id)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                          {asset.asset_tag}
                        </span>
                      </div>
                      {getStatusBadge(asset.status)}
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                      {asset.model_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">S/N: {asset.serial_number}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 text-xs">
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Pemegang:</span>
                      <strong className="text-slate-900">{asset.current_holder || 'Gudang'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Nilai Buku:</span>
                      <span className="font-mono font-bold text-slate-900">
                        Rp {Number(asset.depreciation?.currentBookValue || asset.purchase_price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    {asset.status === 'available' && (
                      <button
                        onClick={() => onCheckout && onCheckout(asset)}
                        className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition border border-emerald-200 flex items-center justify-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Pinjamkan</span>
                      </button>
                    )}
                    {asset.status === 'assigned' && (
                      <button
                        onClick={() => onCheckin && onCheckin(asset)}
                        className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg text-xs transition border border-sky-200 flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Kembalikan</span>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(asset)}
                        className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition border border-sky-200"
                        title="Edit Data Aset"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onPrintLabel && onPrintLabel(asset)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                      title="Cetak Label"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                      title="Detail"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Navigation Bar for Grid */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-600">
              <span>Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong></span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

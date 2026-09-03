// File: frontend/src/views/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Package,
  UserCheck,
  Wrench,
  TrendingDown,
  Camera,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  DollarSign,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  FileText,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import { getDashboardSummary, getDepreciationReport, getAssets } from '../../services/api';

export default function Dashboard({
  onOpenScanner,
  onOpenAddAsset,
  onSelectAsset,
  onNavigateTab
}) {
  const [summary, setSummary] = useState(null);
  const [depreciationSummary, setDepreciationSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allAssets, setAllAssets] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, depRes, astRes] = await Promise.all([
        getDashboardSummary(),
        getDepreciationReport(),
        getAssets({ limit: 100 })
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (depRes.success) setDepreciationSummary(depRes.data.summary);
      if (astRes.success) setAllAssets(astRes.data);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (q) => {
    setQuickSearch(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const s = q.toLowerCase();
    const matches = allAssets.filter(a =>
      (a.asset_tag && a.asset_tag.toLowerCase().includes(s)) ||
      (a.model_name && a.model_name.toLowerCase().includes(s)) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(s)) ||
      (a.current_holder && a.current_holder.toLowerCase().includes(s)) ||
      (a.category_name && a.category_name.toLowerCase().includes(s))
    ).slice(0, 5);
    setSearchResults(matches);
  };

  const totalAssets = summary?.stats?.total_assets || 0;
  const available = summary?.stats?.available || 0;
  const assigned = summary?.stats?.assigned || 0;
  const maintenance = summary?.stats?.maintenance || 0;
  const currentBookVal = depreciationSummary?.totalCurrentBookValue || 0;

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* 1. HERO SECTION: Clean Light Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-600"></span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              IT Asset & Inventory Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan & Alur Sirkulasi Perangkat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola inventaris, serah terima staf, scan QR kamera, dan penyusutan nilai buku aset.
          </p>
        </div>

        {/* 2 Big Core Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenScanner}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition hover:scale-105 active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Scan QR</span>
          </button>
          <button
            onClick={onOpenAddAsset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl border border-slate-300 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
            <span>Tambah Unit</span>
          </button>
        </div>
      </div>

      {/* QUICK UNIVERSAL SEARCH BAR */}
      <div className="relative">
        <div className="p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Cari barang (Tag, Serial, Model, atau Nama Karyawan)..."
            value={quickSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none min-w-0"
          />
          {quickSearch && (
            <button
              onClick={() => handleSearchChange('')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Suggestion Dropdown */}
        {quickSearch && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 animate-fadeIn max-h-80 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Tidak ada unit yang cocok dengan pencarian "{quickSearch}".
              </div>
            ) : (
              searchResults.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    handleSearchChange('');
                    onSelectAsset(a.id);
                  }}
                  className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition gap-2"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-[10px] sm:text-xs text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                        {a.asset_tag}
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">{a.model_name}</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">S/N: {a.serial_number} • {a.category_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                      a.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      a.status === 'assigned' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {a.status === 'available' ? 'Tersedia' : a.status === 'assigned' ? 'Dipinjam' : 'Servis'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 2. OPERATIONAL EARLY WARNING ALERT (Sistem Peringatan Dini Operasional) */}
      {maintenance > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm">Pemberitahuan: {maintenance} Unit Sedang Dalam Servis</p>
              <p className="text-amber-700 text-[11px] sm:text-xs">Koordinasikan dengan vendor reparasi untuk percepatan ketersediaan unit.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('maintenance')}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 transition text-center text-xs"
          >
            Lihat Tiket Servis
          </button>
        </div>
      )}

      {/* 3. INTERACTIVE ASSET LIFECYCLE: 4 Simple Steps (2 Columns on Mobile!) */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Alur Siklus Hidup Aset IT</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">4 langkah mudah operasional perangkat</p>
            </div>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] sm:text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            {showGuide ? 'Tutup' : 'Panduan'}
          </button>
        </div>

        {/* 2 Columns on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          {/* Step 1 */}
          <div
            onClick={onOpenAddAsset}
            className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 transition cursor-pointer space-y-1 sm:space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-slate-700 font-mono text-[10px] sm:text-xs font-bold flex items-center justify-center border border-slate-300 group-hover:bg-sky-600 group-hover:text-white transition">
                1
              </span>
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-sky-600 transition" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-sky-600 transition">1. Daftarkan</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight line-clamp-2 sm:line-clamp-none">
              Catat unit baru & buat kode QR otomatis.
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigateTab('handover')}
            className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 transition cursor-pointer space-y-1 sm:space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-slate-700 font-mono text-xs font-bold flex items-center justify-center border border-slate-300 group-hover:bg-sky-600 group-hover:text-white transition">
                2
              </span>
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-sky-600 transition" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-sky-600 transition">2. Serah Terima</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight line-clamp-2 sm:line-clamp-none">
              Check-out ke staf & terbitkan surat BAST.
            </p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigateTab('handover')}
            className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 transition cursor-pointer space-y-1 sm:space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-slate-700 font-mono text-xs font-bold flex items-center justify-center border border-slate-300 group-hover:bg-sky-600 group-hover:text-white transition">
                3
              </span>
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-sky-600 transition" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-sky-600 transition">3. Kembali</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight line-clamp-2 sm:line-clamp-none">
              Check-in unit kembali ke gudang IT.
            </p>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => onNavigateTab('depreciation')}
            className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 transition cursor-pointer space-y-1 sm:space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-slate-700 font-mono text-xs font-bold flex items-center justify-center border border-slate-300 group-hover:bg-sky-600 group-hover:text-white transition">
                4
              </span>
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-sky-600 transition" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-sky-600 transition">4. Depresiasi</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight line-clamp-2 sm:line-clamp-none">
              Nilai buku otomatis menyusut per tahun.
            </p>
          </div>
        </div>

        {showGuide && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-700 space-y-1.5 animate-fadeIn">
            <h5 className="font-bold text-sky-950">💡 Panduan Fitur Unggulan Perusahaan:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li><strong>Scan QR Cepat:</strong> Deteksi unit dan serah terima seketika.</li>
              <li><strong>Cetak BAST Resmi:</strong> Terbitkan dokumen serah terima dengan tanda tangan.</li>
              <li><strong>Cetak Stiker Massal:</strong> Centang beberapa unit dan cetak lembar A4.</li>
            </ul>
          </div>
        )}
      </div>

      {/* 4. STATUS CARDS: 2 COLUMNS ON MOBILE (TIDAK 1 BARIS PANJANG!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Available */}
        <div
          onClick={() => onNavigateTab('assets')}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2.5 sm:space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500">Tersedia</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-black text-slate-900">{available} <span className="text-xs sm:text-sm font-normal text-slate-500">unit</span></div>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <span>Di gudang</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>

        {/* Card 2: Assigned */}
        <div
          onClick={() => onNavigateTab('handover')}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2.5 sm:space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500">Dipinjam</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-sky-50 text-sky-600">
              <UserCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-black text-slate-900">{assigned} <span className="text-xs sm:text-sm font-normal text-slate-500">unit</span></div>
            <p className="text-[10px] sm:text-xs text-sky-600 font-bold mt-0.5 flex items-center gap-0.5">
              <span>Dipakai staf</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>

        {/* Card 3: Maintenance */}
        <div
          onClick={() => onNavigateTab('maintenance')}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2.5 sm:space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500">Servis</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wrench className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-black text-slate-900">{maintenance} <span className="text-xs sm:text-sm font-normal text-slate-500">unit</span></div>
            <p className="text-[10px] sm:text-xs text-amber-600 font-bold mt-0.5 flex items-center gap-0.5">
              <span>Dalam reparasi</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>

        {/* Card 4: Financial Valuation */}
        <div
          onClick={() => onNavigateTab('depreciation')}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2.5 sm:space-y-4 group min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500">Nilai Buku</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-base lg:text-lg font-bold text-slate-900 truncate font-mono">
              Rp {Number(currentBookVal).toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] sm:text-xs text-indigo-600 font-bold mt-0.5 flex items-center gap-0.5">
              <span>Lihat neraca</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITIES: Clean 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Sirkulasi Terakhir */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>Sirkulasi Penugasan Terbaru</span>
            </h4>
            <button
              onClick={() => onNavigateTab('handover')}
              className="text-[11px] sm:text-xs text-sky-600 hover:text-sky-700 font-bold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {summary?.recentAssignments && summary.recentAssignments.length > 0 ? (
              summary.recentAssignments.map((asg) => (
                <div
                  key={asg.id}
                  onClick={() => onSelectAsset && onSelectAsset(asg.asset_id)}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition cursor-pointer flex items-center justify-between gap-2.5 text-xs"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{asg.employee_name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{asg.model_name}</p>
                    <span className="text-[10px] font-mono text-slate-400">NIP: {asg.employee_id_number}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 block text-[10px] sm:text-[11px] mb-1">
                      {asg.asset_tag}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(asg.assigned_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">Belum ada aktivitas sirkulasi.</div>
            )}
          </div>
        </div>

        {/* Right: Inventaris per Kategori */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Inventaris per Kategori</span>
            </h4>
            <button
              onClick={() => onNavigateTab('assets')}
              className="text-[11px] sm:text-xs text-sky-600 hover:text-sky-700 font-bold"
            >
              Katalog Aset
            </button>
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            {summary?.categoryCounts && summary.categoryCounts.length > 0 ? (
              summary.categoryCounts.map((cat, idx) => {
                const count = parseInt(cat.count, 10) || 0;
                const percent = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate pr-2">{cat.name}</span>
                      <span className="font-bold text-slate-900 font-mono shrink-0">{count} unit</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">Belum ada data kategori.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

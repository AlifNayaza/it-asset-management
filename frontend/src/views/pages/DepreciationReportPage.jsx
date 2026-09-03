// File: frontend/src/views/pages/DepreciationReportPage.jsx
import React, { useEffect, useState } from 'react';
import {
  TrendingDown,
  DollarSign,
  PieChart,
  Calculator,
  Download,
  Boxes,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Shield,
  Activity,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { getDepreciationReport } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function DepreciationReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { showSuccess, showError } = useToast();

  // Interactive Simulation State
  const [simCost, setSimCost] = useState(15000000);
  const [simYears, setSimYears] = useState(4);
  const [simSalvagePercent, setSimSalvagePercent] = useState(5);
  const [simTargetYear, setSimTargetYear] = useState(2);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await getDepreciationReport();
      if (res.success) {
        setReport(res.data);
      }
    } catch (e) {
      console.error('Failed to load depreciation report:', e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!report || !report.assets || report.assets.length === 0) return showError('Tidak ada data laporan depresiasi');
    const headers = [
      'Asset Tag',
      'Model Name',
      'Category',
      'Purchase Date',
      'Masa Manfaat (Tahun)',
      'Harga Perolehan (IDR)',
      'Nilai Sisa Residu (IDR)',
      'Depresiasi per Tahun (IDR)',
      'Akumulasi Depresiasi (IDR)',
      'Sisa Nilai Buku / Book Value (IDR)'
    ];

    const rows = report.assets.map(a => [
      a.asset_tag,
      `"${a.model_name}"`,
      `"${a.category_name}"`,
      a.purchase_date?.split('T')[0],
      a.useful_life_years,
      a.financials.cost,
      a.financials.salvageValue,
      a.financials.annualDepreciation,
      a.financials.accumulatedDepreciation,
      a.financials.currentBookValue
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_depresiasi_keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('File CSV laporan depresiasi keuangan berhasil diunduh!');
  };

  // Simulation Calculations
  const simSalvageValue = (simCost * simSalvagePercent) / 100;
  const simDepreciableAmount = simCost - simSalvageValue;
  const simAnnualDep = simYears > 0 ? simDepreciableAmount / simYears : 0;
  const simAccumulated = Math.min(simAnnualDep * simTargetYear, simDepreciableAmount);
  const simCurrentBookValue = Math.max(simCost - simAccumulated, simSalvageValue);

  const summary = report?.summary || {};

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingDown className="w-6 h-6 text-sky-600" />
            <span>Laporan Depresiasi Garis Lurus (Straight-Line)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Perhitungan nilai buku aset (*Book Value*) otomatis berdasarkan masa manfaat ekonomis dan nilai residu
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Laporan Neraca (CSV)</span>
        </button>
      </div>

      {/* Financial Summary KPI Cards (2 Columns on Mobile!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-mono truncate block">Total Modal (Capex)</span>
          <p className="text-xs sm:text-lg lg:text-xl font-black text-slate-900 font-mono truncate">
            Rp {Number(summary.totalOriginalCost || 0).toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] sm:text-xs text-slate-500 block truncate">{summary.totalAssetsEvaluated || 0} unit aset aktif</span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-rose-50 border border-rose-200 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-rose-700 uppercase tracking-wider font-mono truncate block">Akumulasi Penyusutan</span>
          <p className="text-xs sm:text-lg lg:text-xl font-black text-rose-700 font-mono truncate">
            - Rp {Number(summary.totalAccumulatedDepreciation || 0).toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] sm:text-xs text-rose-600 font-medium block truncate">
            Rasio: {summary.depreciationRatio || 0}%
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono truncate block">Nilai Buku (Book Value)</span>
          <p className="text-xs sm:text-lg lg:text-xl font-black text-emerald-800 font-mono truncate">
            Rp {Number(summary.totalCurrentBookValue || 0).toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] sm:text-xs text-emerald-700 font-medium block truncate">Valuasi neraca aktif</span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-sky-50 border border-sky-200 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-sky-800 uppercase tracking-wider font-mono truncate block">Beban Tahunan</span>
          <p className="text-xs sm:text-lg lg:text-xl font-black text-sky-800 font-mono truncate">
            Rp {Number(summary.totalAnnualDepreciation || 0).toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] sm:text-xs text-sky-700 font-medium block truncate">Beban per tahun fiskal</span>
        </div>
      </div>

      {/* INTERACTIVE FINANCIAL DEPRECIATION SIMULATOR (Fitur Inovatif Baru) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Simulasi Cepat Perhitungan Depresiasi Pengadaan Aset</h3>
              <p className="text-xs text-slate-500">Hitung perkiraan nilai buku sebelum melakukan pembelian perangkat baru</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Sliders Input */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Perkiraan Harga Beli (IDR):</span>
                <span className="text-sky-700 font-mono">Rp {Number(simCost).toLocaleString('id-ID')}</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="500000"
                value={simCost}
                onChange={e => setSimCost(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Masa Manfaat (Tahun):</label>
                <select
                  value={simYears}
                  onChange={e => setSimYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value={2}>2 Tahun (Smartphone)</option>
                  <option value={3}>3 Tahun (Tablet)</option>
                  <option value={4}>4 Tahun (Laptop & PC)</option>
                  <option value={5}>5 Tahun (Server & Jaringan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Simulasi Tahun Ke-:</label>
                <select
                  value={simTargetYear}
                  onChange={e => setSimTargetYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  {Array.from({ length: simYears + 1 }, (_, i) => (
                    <option key={i} value={i}>Tahun ke-{i}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="border-b border-slate-200 pb-2.5">
              <span className="text-[11px] text-slate-500 font-medium block">Perkiraan Sisa Nilai Buku (Tahun ke-{simTargetYear}):</span>
              <div className="font-mono font-black text-emerald-700 text-xl sm:text-2xl mt-0.5">
                Rp {Number(simCurrentBookValue).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nilai Residu ({simSalvagePercent}%):</span>
                <span className="font-semibold text-slate-800">Rp {Number(simSalvageValue).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Beban Depresiasi / Thn:</span>
                <span className="font-semibold text-slate-800">Rp {Number(simAnnualDep).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-rose-600 font-bold border-t border-slate-200 pt-1.5">
                <span>Akumulasi Penyusutan:</span>
                <span>- Rp {Number(simAccumulated).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Schedule Table with Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Boxes className="w-4 h-4 text-sky-600" />
            <span>Jadwal Rincian Depresiasi Seluruh Aset Fisik</span>
          </h3>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Tag / Model / Kategori..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {(() => {
          const filteredAssets = (report?.assets || []).filter(a => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            return (
              (a.asset_tag && a.asset_tag.toLowerCase().includes(s)) ||
              (a.model_name && a.model_name.toLowerCase().includes(s)) ||
              (a.category_name && a.category_name.toLowerCase().includes(s)) ||
              (a.serial_number && a.serial_number.toLowerCase().includes(s))
            );
          });

          const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
          const currentAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

          return (
            <div className="space-y-3">
              {/* MOBILE CARD LIST VIEW (Tampilan Mobile Rapi & Nyaman) */}
              <div className="block sm:hidden space-y-3">
                {currentAssets.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                    Tidak ada unit aset yang cocok dengan kata kunci "{searchTerm}".
                  </div>
                ) : (
                  currentAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {asset.asset_tag}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{asset.model_name}</h4>
                          <span className="text-[11px] text-slate-500">{asset.category_name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block">Umur Pakai</span>
                          <span className="font-mono font-bold text-xs text-sky-700">
                            {asset.age_years || '0'} / {asset.useful_life_years} thn
                          </span>
                        </div>
                      </div>

                      {/* 2-Column Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-sans block">Harga Beli:</span>
                          <span className="font-bold text-slate-900 text-xs truncate block">
                            Rp {Number(asset.financials.cost).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-sans block">Nilai Sisa:</span>
                          <span className="font-bold text-slate-700 text-xs truncate block">
                            Rp {Number(asset.financials.salvageValue).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                          <span className="text-[10px] text-rose-700 font-sans block">Akumulasi:</span>
                          <span className="font-bold text-rose-700 text-xs truncate block">
                            - Rp {Number(asset.financials.accumulatedDepreciation).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[10px] text-emerald-800 font-sans font-bold block">Nilai Buku:</span>
                          <span className="font-black text-emerald-800 text-xs truncate block">
                            Rp {Number(asset.financials.currentBookValue).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DESKTOP TABLE VIEW (Tampilan Desktop / Tablet) */}
              <div className="hidden sm:block overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider whitespace-nowrap">
                      <th className="py-3 px-4">Tag & Perangkat</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Tgl Beli & Umur</th>
                      <th className="py-3 px-4">Harga Perolehan</th>
                      <th className="py-3 px-4">Nilai Sisa</th>
                      <th className="py-3 px-4">Akumulasi Penyusutan</th>
                      <th className="py-3 px-4 font-bold text-emerald-800">Sisa Nilai Buku</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {currentAssets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-400 text-xs font-sans">
                          Tidak ada unit aset yang cocok dengan kata kunci "{searchTerm}".
                        </td>
                      </tr>
                    ) : (
                      currentAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-sky-700 block text-xs">{asset.asset_tag}</span>
                            <span className="text-slate-900 font-sans text-xs font-medium block">{asset.model_name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-sans text-xs whitespace-nowrap">{asset.category_name}</td>
                          <td className="py-3 px-4 text-xs whitespace-nowrap">
                            <span className="text-slate-900 font-semibold block">{asset.purchase_date?.split('T')[0] || '-'}</span>
                            <span className="text-sky-600 text-[11px] block">{asset.age_years || '0'} thn / {asset.useful_life_years} thn</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-900 font-bold whitespace-nowrap">
                            Rp {Number(asset.financials.cost).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                            Rp {Number(asset.financials.salvageValue).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-xs text-rose-600 font-bold whitespace-nowrap">
                            - Rp {Number(asset.financials.accumulatedDepreciation).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-xs font-black text-emerald-800 bg-emerald-50/30 whitespace-nowrap">
                            Rp {Number(asset.financials.currentBookValue).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 bg-white shadow-xs text-xs text-slate-600">
                  <span>Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {filteredAssets.length} Aset)</span>
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
          );
        })()}
      </div>
    </div>
  );
}

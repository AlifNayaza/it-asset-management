// File: frontend/src/views/pages/MaintenanceLogPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Wrench,
  PlusCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  Laptop,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { getAssets, getMaintenanceLogs, createMaintenanceLog, completeMaintenanceLog } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function MaintenanceLogPage({ initialAsset = null, onClearInitial }) {
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAssetSearch, setModalAssetSearch] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { showSuccess, showError } = useToast();

  // Form State
  const [form, setForm] = useState({
    asset_id: '',
    service_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    issue_description: '',
    cost: '',
    set_status_maintenance: true,
    logged_by: 'IT Support'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialAsset && initialAsset.id) {
      setForm(prev => ({
        ...prev,
        asset_id: initialAsset.id
      }));
      setShowModal(true);
      if (onClearInitial) onClearInitial();
    }
  }, [initialAsset]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, assetsRes] = await Promise.all([
        getMaintenanceLogs({ limit: 100 }),
        getAssets({ limit: 100 })
      ]);
      if (logsRes.success) setLogs(logsRes.data);
      if (assetsRes.success) setAssets(assetsRes.data);
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createMaintenanceLog({
        ...form,
        cost: parseFloat(form.cost) || 0
      });
      if (res.success) {
        showSuccess('Tiket pemeliharaan/servis unit berhasil dicatat!');
        setShowModal(false);
        setForm({
          asset_id: '',
          service_date: new Date().toISOString().split('T')[0],
          vendor_name: '',
          issue_description: '',
          cost: '',
          set_status_maintenance: true,
          logged_by: 'IT Support'
        });
        loadData();
      }
    } catch (err) {
      showError('Gagal membuat catatan servis: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (logId) => {
    if (confirm('Tandai servis ini selesai? Unit aset akan dikembalikan ke status Tersedia (Available).')) {
      try {
        const res = await completeMaintenanceLog(logId, {
          completion_date: new Date().toISOString().split('T')[0]
        });
        if (res.success) {
          showSuccess('Servis selesai! Status unit telah dikembalikan ke Tersedia (Available).');
          loadData();
        }
      } catch (err) {
        showError('Gagal menyelesaikan servis: ' + err.message);
      }
    }
  };

  // Filter logs by search query
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (log.asset_tag && log.asset_tag.toLowerCase().includes(s)) ||
      (log.model_name && log.model_name.toLowerCase().includes(s)) ||
      (log.vendor_name && log.vendor_name.toLowerCase().includes(s)) ||
      (log.issue_description && log.issue_description.toLowerCase().includes(s)) ||
      (log.logged_by && log.logged_by.toLowerCase().includes(s))
    );
  });

  // Pagination Slice
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filter modal assets by search
  const filteredModalAssets = assets.filter(a => {
    if (!modalAssetSearch) return true;
    const s = modalAssetSearch.toLowerCase();
    return (
      (a.asset_tag && a.asset_tag.toLowerCase().includes(s)) ||
      (a.model_name && a.model_name.toLowerCase().includes(s)) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-amber-600" />
            <span>Riwayat Pemeliharaan & Servis Fisik</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pelacakan reparasi teknis perangkat, klaim garansi vendor, dan pencatatan biaya pemeliharaan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Tiket / Tag / Vendor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-7 py-2 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
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

          <button
            onClick={() => {
              setForm({
                asset_id: '',
                service_date: new Date().toISOString().split('T')[0],
                vendor_name: '',
                issue_description: '',
                cost: '',
                set_status_maintenance: true,
                logged_by: 'IT Support'
              });
              setModalAssetSearch('');
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tiket Servis</span>
          </button>
        </div>
      </div>

      {/* MOBILE CARD LIST VIEW */}
      <div className="block sm:hidden space-y-3">
        {currentLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            {searchTerm ? `Tidak ada tiket pemeliharaan yang cocok dengan "${searchTerm}".` : 'Belum ada catatan pemeliharaan atau reparasi unit.'}
          </div>
        ) : (
          currentLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {log.asset_tag}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{log.model_name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center gap-1 ${
                  log.completion_date
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${log.completion_date ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {log.completion_date ? 'Selesai' : 'Dalam Proses'}
                </span>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {log.issue_description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Vendor:</span>
                  <strong className="text-slate-900 text-xs truncate block">{log.vendor_name}</strong>
                  <span className="text-[10px] text-slate-500">{log.service_date}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Biaya Servis:</span>
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    Rp {Number(log.cost).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400">Petugas: {log.logged_by}</span>
                </div>
              </div>

              {!log.completion_date && (
                <button
                  onClick={() => handleComplete(log.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Servis Selesai</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden sm:block overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4">Tag & Perangkat</th>
              <th className="py-3 px-4">Kendala / Masalah Teknis</th>
              <th className="py-3 px-4">Vendor & Tgl Servis</th>
              <th className="py-3 px-4">Biaya Servis</th>
              <th className="py-3 px-4">Status Reparasi</th>
              <th className="py-3 px-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                  {searchTerm ? `Tidak ada tiket pemeliharaan yang cocok dengan "${searchTerm}".` : 'Belum ada catatan pemeliharaan atau reparasi unit.'}
                </td>
              </tr>
            ) : (
              currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-xs text-sky-700 block">{log.asset_tag}</span>
                    <span className="text-slate-900 font-bold text-xs">{log.model_name}</span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-xs">
                    <p className="text-slate-800 line-clamp-2">{log.issue_description}</p>
                    <span className="text-[10px] text-slate-400">Petugas: {log.logged_by}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <p className="font-bold text-slate-900">{log.vendor_name}</p>
                    <p className="text-slate-500 text-[11px]">{log.service_date}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                    Rp {Number(log.cost).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      log.completion_date
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${log.completion_date ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {log.completion_date ? 'Selesai' : 'Dalam Proses'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {!log.completion_date && (
                      <button
                        onClick={() => handleComplete(log.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 bg-white shadow-xs text-xs text-slate-600">
          <span>Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Ditemukan {filteredLogs.length} Tiket)</span>
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
                  currentPage === pg ? 'bg-amber-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
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

      {/* Create Maintenance Modal with searchable device picker */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-40 top-14 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Buat Tiket Pemeliharaan</h3>
                  <p className="text-[11px] text-slate-500">Catat kendala teknis dan biaya servis unit</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pilih Perangkat <span className="text-rose-500">*</span></label>
                
                {/* Search device in modal */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik untuk memfilter unit..."
                    value={modalAssetSearch}
                    onChange={(e) => setModalAssetSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 mb-1 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  required
                  value={form.asset_id}
                  onChange={e => setForm({ ...form, asset_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Unit Perangkat ({filteredModalAssets.length} unit) --</option>
                  {filteredModalAssets.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.asset_tag}] {a.model_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Servis <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={form.service_date}
                    onChange={e => setForm({ ...form, service_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Vendor / Service Center <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Asus Service Center"
                    value={form.vendor_name}
                    onChange={e => setForm({ ...form, vendor_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Kendala / Kerusakan Fisik <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows="3"
                  placeholder="Misal: Ganti baterai dan pembersihan kipas heatsink"
                  value={form.issue_description}
                  onChange={e => setForm({ ...form, issue_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Estimasi / Biaya Riil Servis (IDR)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 (Jika garansi gratis)"
                  value={form.cost}
                  onChange={e => setForm({ ...form, cost: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Tiket Servis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

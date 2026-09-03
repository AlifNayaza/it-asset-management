// File: frontend/src/views/pages/HandoverPage.jsx
import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  RotateCcw,
  Clock,
  Package,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  Shield,
  FileText,
  AlertCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { getAssets, getAssignments, checkoutAsset, checkinAsset } from '../../services/api';
import { useToast } from '../../components/Toast';
import BastModal from '../../components/BastModal';

export default function HandoverPage({
  initialCheckoutAsset = null,
  initialCheckinAsset = null,
  onClearInitial
}) {
  const [activeTab, setActiveTab] = useState('checkout'); // 'checkout', 'checkin', 'history'
  const [availableAssets, setAvailableAssets] = useState([]);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [assignmentsHistory, setAssignmentsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [checkoutSearch, setCheckoutSearch] = useState('');
  const [checkinSearch, setCheckinSearch] = useState('');
  const historyPerPage = 8;
  const { showSuccess, showError } = useToast();

  // BAST Modal State
  const [bastData, setBastData] = useState(null);

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    asset_id: '',
    employee_name: '',
    employee_id_number: '',
    condition_on_checkout: 'Kondisi fisik 100% baik, lengkap dengan charger & aksesoris',
    assigned_by: 'Petugas IT',
    notes: ''
  });

  // Checkin Form State
  const [checkinForm, setCheckinForm] = useState({
    asset_id: '',
    condition_on_return: 'Kondisi fisik baik dan berfungsi normal',
    notes: '',
    logged_by: 'Petugas IT'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialCheckoutAsset) {
      setActiveTab('checkout');
      setCheckoutForm(prev => ({ ...prev, asset_id: initialCheckoutAsset.id }));
    } else if (initialCheckinAsset) {
      setActiveTab('checkin');
      setCheckinForm(prev => ({ ...prev, asset_id: initialCheckinAsset.id }));
    }
  }, [initialCheckoutAsset, initialCheckinAsset]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [availRes, asgndRes, histRes] = await Promise.all([
        getAssets({ status: 'available', limit: 100 }),
        getAssets({ status: 'assigned', limit: 100 }),
        getAssignments({ limit: 100 })
      ]);

      if (availRes.success) setAvailableAssets(availRes.data);
      if (asgndRes.success) setAssignedAssets(asgndRes.data);
      if (histRes.success) setAssignmentsHistory(histRes.data);
    } catch (err) {
      console.error('Failed to load handover data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutForm.asset_id) return showError('Silakan pilih unit perangkat yang akan diserahkan');
    setLoading(true);
    try {
      const res = await checkoutAsset(checkoutForm);
      if (res.success) {
        showSuccess(`Unit [${res.data.asset.asset_tag}] berhasil diserahkan kepada ${checkoutForm.employee_name}!`);
        
        // Open BAST Modal automatically
        setBastData({
          assignmentData: res.data.assignment,
          assetData: res.data.asset
        });

        setCheckoutForm({
          asset_id: '',
          employee_name: '',
          employee_id_number: '',
          condition_on_checkout: 'Kondisi fisik 100% baik, lengkap dengan charger & aksesoris',
          assigned_by: 'Petugas IT',
          notes: ''
        });
        if (onClearInitial) onClearInitial();
        loadData();
      }
    } catch (err) {
      showError('Gagal serah terima: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    if (!checkinForm.asset_id) return showError('Silakan pilih unit yang hendak dikembalikan ke gudang');
    setLoading(true);
    try {
      const res = await checkinAsset(checkinForm.asset_id, {
        condition_on_return: checkinForm.condition_on_return,
        notes: checkinForm.notes,
        logged_by: checkinForm.logged_by
      });
      if (res.success) {
        showSuccess('Perangkat berhasil dikembalikan ke gudang! Status sekarang: Tersedia.');
        setCheckinForm({
          asset_id: '',
          condition_on_return: 'Kondisi fisik baik dan berfungsi normal',
          notes: '',
          logged_by: 'Petugas IT'
        });
        if (onClearInitial) onClearInitial();
        loadData();
      }
    } catch (err) {
      showError('Gagal pengembalian: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCheckoutUnit = availableAssets.find(a => a.id === checkoutForm.asset_id);
  const selectedCheckinUnit = assignedAssets.find(a => a.id === checkinForm.asset_id);

  const filteredCheckoutAssets = availableAssets.filter(a => {
    if (!checkoutSearch) return true;
    const s = checkoutSearch.toLowerCase();
    return (
      (a.asset_tag && a.asset_tag.toLowerCase().includes(s)) ||
      (a.model_name && a.model_name.toLowerCase().includes(s)) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(s))
    );
  });

  const filteredCheckinAssets = assignedAssets.filter(a => {
    if (!checkinSearch) return true;
    const s = checkinSearch.toLowerCase();
    return (
      (a.asset_tag && a.asset_tag.toLowerCase().includes(s)) ||
      (a.model_name && a.model_name.toLowerCase().includes(s)) ||
      (a.current_holder && a.current_holder.toLowerCase().includes(s)) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(s))
    );
  });

  const filteredHistory = assignmentsHistory.filter(h => {
    if (historyFilter === 'active' && h.returned_at) return false;
    if (historyFilter === 'returned' && !h.returned_at) return false;
    if (!historySearch) return true;
    const s = historySearch.toLowerCase();
    return (
      (h.asset_tag && h.asset_tag.toLowerCase().includes(s)) ||
      (h.model_name && h.model_name.toLowerCase().includes(s)) ||
      (h.employee_name && h.employee_name.toLowerCase().includes(s)) ||
      (h.employee_id_number && h.employee_id_number.toLowerCase().includes(s))
    );
  });

  const totalHistoryPages = Math.ceil(filteredHistory.length / historyPerPage) || 1;
  const currentHistoryLogs = filteredHistory.slice((historyPage - 1) * historyPerPage, historyPage * historyPerPage);

  return (
    <div className="space-y-5 animate-fadeIn max-w-5xl mx-auto">
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Sirkulasi & Serah Terima Aset
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Kelola serah terima perangkat ke staf, terbitkan surat BAST, dan pengembalian unit ke gudang.
        </p>
      </div>

      {/* Segmented Navigation Tabs (Clean & Responsive) */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 w-full sm:w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('checkout')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'checkout'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
          <span>Serah Terima</span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'checkin'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
          <span>Pengembalian</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
          <span>Riwayat ({assignmentsHistory.length})</span>
        </button>
      </div>

      {/* 1. CHECK-OUT FORM */}
      {activeTab === 'checkout' && (
        <div className="p-4 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 sm:space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Formulir Serah Terima Perangkat ke Karyawan</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Sistem akan otomatis menerbitkan lembar Berita Acara Serah Terima (BAST) resmi.
            </p>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            {/* Step 1: Select Available Unit with Search */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                1. Pilih Perangkat Tersedia di Gudang <span className="text-rose-500">*</span>
              </label>
              
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik untuk mencari unit di gudang..."
                  value={checkoutSearch}
                  onChange={(e) => setCheckoutSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 mb-1 focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                required
                value={checkoutForm.asset_id}
                onChange={e => setCheckoutForm({ ...checkoutForm, asset_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="">-- Pilih Unit dari {filteredCheckoutAssets.length} Perangkat --</option>
                {filteredCheckoutAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.asset_tag}] {a.model_name} (S/N: {a.serial_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Unit Visual Card */}
            {selectedCheckoutUnit && (
              <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200 flex items-center justify-between text-xs animate-fadeIn gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-mono font-bold text-sky-700 text-xs block">{selectedCheckoutUnit.asset_tag}</span>
                  <p className="text-slate-900 font-bold text-xs sm:text-sm truncate">{selectedCheckoutUnit.model_name}</p>
                  <p className="text-slate-500 text-[10px] sm:text-[11px] font-mono truncate">Serial: {selectedCheckoutUnit.serial_number}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Siap Diserahkan
                </span>
              </div>
            )}

            {/* Step 2: Employee Name & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  2. Nama Karyawan Penerima <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  value={checkoutForm.employee_name}
                  onChange={e => setCheckoutForm({ ...checkoutForm, employee_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  3. Nomor Induk Pegawai (NIP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: EMP-IT-0042"
                  value={checkoutForm.employee_id_number}
                  onChange={e => setCheckoutForm({ ...checkoutForm, employee_id_number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Step 3: Condition and Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                4. Kondisi Fisik saat Serah Terima
              </label>
              <textarea
                rows="2"
                value={checkoutForm.condition_on_checkout}
                onChange={e => setCheckoutForm({ ...checkoutForm, condition_on_checkout: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
              ></textarea>
            </div>

            {/* Officer & Additional Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Petugas IT Penyerah</label>
                <input
                  type="text"
                  value={checkoutForm.assigned_by}
                  onChange={e => setCheckoutForm({ ...checkoutForm, assigned_by: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan Kelengkapan Tambahan</label>
                <input
                  type="text"
                  placeholder="Misal: Termasuk charger 65W & tas ransel"
                  value={checkoutForm.notes}
                  onChange={e => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{loading ? 'Memproses...' : 'Konfirmasi Serah Terima & Buat BAST'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. CHECK-IN FORM */}
      {activeTab === 'checkin' && (
        <div className="p-4 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 sm:space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Formulir Pengembalian Perangkat ke Gudang IT</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Unit yang dikembalikan akan langsung kembali tersedia di gudang (*Available*).
            </p>
          </div>

          <form onSubmit={handleCheckinSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                1. Pilih Perangkat yang Hendak Dikembalikan <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik untuk mencari unit yang dipinjam..."
                  value={checkinSearch}
                  onChange={(e) => setCheckinSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 mb-1 focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                required
                value={checkinForm.asset_id}
                onChange={e => setCheckinForm({ ...checkinForm, asset_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="">-- Pilih Unit dari {filteredCheckinAssets.length} Perangkat Dipinjam --</option>
                {filteredCheckinAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.asset_tag}] {a.model_name} (Pemegang: {a.current_holder || 'Staf'})
                  </option>
                ))}
              </select>
            </div>

            {selectedCheckinUnit && (
              <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200 flex items-center justify-between text-xs animate-fadeIn gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-mono font-bold text-sky-700 text-xs block">{selectedCheckinUnit.asset_tag}</span>
                  <p className="text-slate-900 font-bold text-xs sm:text-sm truncate">{selectedCheckinUnit.model_name}</p>
                  <p className="text-slate-500 text-[10px] sm:text-[11px] truncate">Pemegang: <strong className="text-slate-900">{selectedCheckinUnit.current_holder}</strong></p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                  Sedang Dipinjam
                </span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                2. Evaluasi Kondisi Fisik saat Pengembalian
              </label>
              <textarea
                rows="2"
                value={checkinForm.condition_on_return}
                onChange={e => setCheckinForm({ ...checkinForm, condition_on_return: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Petugas IT Penerima</label>
                <input
                  type="text"
                  value={checkinForm.logged_by}
                  onChange={e => setCheckinForm({ ...checkinForm, logged_by: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan Penutupan / Kondisi</label>
                <input
                  type="text"
                  placeholder="Misal: Sudah dibersihkan, OS direset"
                  value={checkinForm.notes}
                  onChange={e => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{loading ? 'Memproses...' : 'Konfirmasi Pengembalian ke Gudang'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. CIRCULATION HISTORY TABLE WITH SEARCH & PAGINATION */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setHistoryFilter('all'); setHistoryPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  historyFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Semua ({assignmentsHistory.length})
              </button>
              <button
                onClick={() => { setHistoryFilter('active'); setHistoryPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  historyFilter === 'active' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Sedang Dipinjam ({assignmentsHistory.filter(x => !x.returned_at).length})
              </button>
              <button
                onClick={() => { setHistoryFilter('returned'); setHistoryPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  historyFilter === 'returned' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Sudah Kembali ({assignmentsHistory.filter(x => !!x.returned_at).length})
              </button>
            </div>

            {/* History Live Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Staf / NIP / Tag..."
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
                className="pl-9 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* MOBILE CARD LIST VIEW */}
          <div className="block sm:hidden space-y-3">
            {currentHistoryLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                {historySearch ? `Tidak ada riwayat sirkulasi yang cocok dengan "${historySearch}".` : 'Belum ada data riwayat sirkulasi.'}
              </div>
            ) : (
              currentHistoryLogs.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {item.asset_tag}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{item.model_name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      item.returned_at ? 'bg-slate-100 text-slate-600' : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {item.returned_at ? 'Sudah Kembali' : 'Sedang Dipinjam'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Karyawan:</span>
                      <strong className="text-slate-900 text-xs truncate block">{item.employee_name}</strong>
                      <span className="text-[10px] font-mono text-slate-500">NIP: {item.employee_id_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tanggal Check-out:</span>
                      <span className="text-slate-700 font-medium block">
                        {new Date(item.assigned_at).toLocaleDateString('id-ID')}
                      </span>
                      {item.returned_at && (
                        <span className="text-[10px] text-slate-500 block">
                          Kembali: {new Date(item.returned_at).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setBastData({ assignmentData: item, assetData: { asset_tag: item.asset_tag, model_name: item.model_name } })}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>Cetak Lembar BAST Resmi</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3 px-4">Perangkat</th>
                  <th className="py-3 px-4">Karyawan Penerima</th>
                  <th className="py-3 px-4">Tgl Check-out</th>
                  <th className="py-3 px-4">Tgl Check-in</th>
                  <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentHistoryLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 text-xs">
                      {historySearch ? `Tidak ada riwayat sirkulasi yang cocok dengan "${historySearch}".` : 'Belum ada data riwayat sirkulasi.'}
                    </td>
                  </tr>
                ) : (
                  currentHistoryLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs text-sky-700 block">{item.asset_tag}</span>
                        <span className="text-slate-900 text-xs font-medium">{item.model_name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.employee_name}</p>
                        <p className="font-mono text-[11px] text-slate-500">NIP: {item.employee_id_number}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {new Date(item.assigned_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {item.returned_at ? (
                          <span className="text-slate-600">{new Date(item.returned_at).toLocaleDateString('id-ID')}</span>
                        ) : (
                          <span className="text-sky-600 font-bold italic">Sedang Digunakan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setBastData({ assignmentData: item, assetData: { asset_tag: item.asset_tag, model_name: item.model_name } })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cetak BAST</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Circulation History */}
          {totalHistoryPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
              <span>Halaman <strong>{historyPage}</strong> dari <strong>{totalHistoryPages}</strong> (Ditemukan {filteredHistory.length} Riwayat)</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setHistoryPage(pg)}
                    className={`w-7 h-7 rounded-lg font-bold ${
                      historyPage === pg ? 'bg-sky-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={historyPage === totalHistoryPages}
                  onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Digital BAST Modal */}
      {bastData && (
        <BastModal
          isOpen={!!bastData}
          onClose={() => setBastData(null)}
          assignmentData={bastData.assignmentData}
          assetData={bastData.assetData}
        />
      )}
    </div>
  );
}


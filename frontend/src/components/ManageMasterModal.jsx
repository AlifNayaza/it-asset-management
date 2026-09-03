// File: frontend/src/components/ManageMasterModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  MapPin,
  Plus,
  CheckCircle2,
  Boxes,
  Building,
  Calendar,
  Percent,
  RefreshCw
} from 'lucide-react';
import { getCategories, createCategory, getLocations, createLocation } from '../services/api';
import { useToast } from './Toast';

export default function ManageMasterModal({ isOpen, onClose, onMasterUpdated }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'locations'
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  // New Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    useful_life_years: 4,
    salvage_percentage: 5.0
  });

  // New Location Form State
  const [locationForm, setLocationForm] = useState({
    branch_name: '',
    room_name: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, locRes] = await Promise.all([getCategories(), getLocations()]);
      if (catRes.success) setCategories(catRes.data);
      if (locRes.success) setLocations(locRes.data);
    } catch (e) {
      console.error('Failed to load master data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return showError('Nama kategori tidak boleh kosong');

    setSubmitting(true);
    try {
      const res = await createCategory({
        name: categoryForm.name.trim(),
        useful_life_years: parseInt(categoryForm.useful_life_years, 10) || 4,
        salvage_percentage: parseFloat(categoryForm.salvage_percentage) || 5.0
      });
      if (res.success) {
        showSuccess(`Kategori "${categoryForm.name}" berhasil ditambahkan!`);
        setCategoryForm({ name: '', useful_life_years: 4, salvage_percentage: 5.0 });
        loadData();
        if (onMasterUpdated) onMasterUpdated();
      }
    } catch (err) {
      showError('Gagal menambahkan kategori: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locationForm.branch_name.trim() || !locationForm.room_name.trim()) {
      return showError('Cabang dan Nama Ruangan wajib diisi');
    }

    setSubmitting(true);
    try {
      const res = await createLocation({
        branch_name: locationForm.branch_name.trim(),
        room_name: locationForm.room_name.trim()
      });
      if (res.success) {
        showSuccess(`Lokasi "${locationForm.branch_name} - ${locationForm.room_name}" berhasil ditambahkan!`);
        setLocationForm({ branch_name: '', room_name: '' });
        loadData();
        if (onMasterUpdated) onMasterUpdated();
      }
    } catch (err) {
      showError('Gagal menambahkan lokasi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 top-0 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Kelola Master Kategori & Lokasi</h3>
              <p className="text-xs text-slate-500">Konfigurasi referensi jenis perangkat dan ruangan inventaris</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kategori Hardware ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'locations'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Master Lokasi & Ruangan ({locations.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              {/* Add Category Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-sky-600" />
                  <span>Tambah Kategori Hardware Baru</span>
                </h4>

                <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-700">Nama Kategori</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Drone, Tablet"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Masa Manfaat (Thn)</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      required
                      value={categoryForm.useful_life_years}
                      onChange={(e) => setCategoryForm({ ...categoryForm, useful_life_years: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Nilai Residu (%)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        required
                        value={categoryForm.salvage_percentage}
                        onChange={(e) => setCategoryForm({ ...categoryForm, salvage_percentage: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shrink-0 shadow-xs"
                      >
                        {submitting ? '...' : 'Tambah'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Category List Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Daftar Kategori Terdaftar:</span>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Nama Kategori</th>
                        <th className="py-2.5 px-4">Masa Manfaat</th>
                        <th className="py-2.5 px-4">Nilai Residu</th>
                        <th className="py-2.5 px-4 text-center">Total Unit Terdaftar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{cat.name}</td>
                          <td className="py-2.5 px-4 text-slate-600 font-mono">{cat.useful_life_years} Tahun</td>
                          <td className="py-2.5 px-4 text-slate-600 font-mono">{cat.salvage_percentage}%</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-50 text-sky-700 border border-sky-200">
                              {cat.total_assets || 0} unit
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. LOCATIONS TAB */}
          {activeTab === 'locations' && (
            <div className="space-y-5">
              {/* Add Location Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-sky-600" />
                  <span>Tambah Master Lokasi / Ruangan Baru</span>
                </h4>

                <form onSubmit={handleAddLocation} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Nama Kantor / Cabang</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kantor Cabang Bandung"
                      value={locationForm.branch_name}
                      onChange={(e) => setLocationForm({ ...locationForm, branch_name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Nama Ruangan / Lantai</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Server Room Lt. 2"
                        value={locationForm.room_name}
                        onChange={(e) => setLocationForm({ ...locationForm, room_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shrink-0 shadow-xs"
                      >
                        {submitting ? '...' : 'Tambah'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Location List Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Daftar Lokasi Terdaftar:</span>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Kantor / Cabang</th>
                        <th className="py-2.5 px-4">Nama Ruangan / Gudang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {locations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{loc.branch_name}</td>
                          <td className="py-2.5 px-4 text-slate-600">{loc.room_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

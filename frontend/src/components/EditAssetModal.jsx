// File: frontend/src/components/EditAssetModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Package,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  TrendingDown,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { updateAsset, getCategories, getLocations, uploadFile } from '../services/api';
import { useToast } from './Toast';

export default function EditAssetModal({ isOpen, asset, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    serial_number: '',
    model_name: '',
    category_id: '',
    location_id: '',
    status: 'available',
    purchase_date: '',
    purchase_price: '',
    useful_life_years: 4,
    salvage_percentage: 5.0,
    current_holder: '',
    image_url: ''
  });

  useEffect(() => {
    if (isOpen && asset) {
      loadFormData();
      setForm({
        serial_number: asset.serial_number || '',
        model_name: asset.model_name || '',
        category_id: asset.category_id || '',
        location_id: asset.location_id || '',
        status: asset.status || 'available',
        purchase_date: asset.purchase_date ? asset.purchase_date.split('T')[0] : '',
        purchase_price: asset.purchase_price || '',
        useful_life_years: asset.useful_life_years || 4,
        salvage_percentage: asset.category_salvage_percentage || 5.0,
        current_holder: asset.current_holder || '',
        image_url: asset.image_url || ''
      });
    }
  }, [isOpen, asset]);

  const loadFormData = async () => {
    try {
      const [catRes, locRes] = await Promise.all([getCategories(), getLocations()]);
      if (catRes.success) setCategories(catRes.data);
      if (locRes.success) setLocations(locRes.data);
    } catch (e) {
      console.error('Failed to load edit modal metadata:', e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadFile(file);
      if (res.success) {
        setForm((prev) => ({ ...prev, image_url: res.filePath }));
        showSuccess('Foto perangkat berhasil diunggah!');
      }
    } catch (err) {
      showError('Gagal mengunggah foto: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const priceNum = parseFloat(form.purchase_price) || 0;
  const salvageVal = (priceNum * (parseFloat(form.salvage_percentage) || 5)) / 100;
  const annualDep = (priceNum - salvageVal) / (parseInt(form.useful_life_years, 10) || 4);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asset || !asset.id) return;

    setLoading(true);
    try {
      const payload = {
        serial_number: form.serial_number.trim(),
        model_name: form.model_name.trim(),
        category_id: parseInt(form.category_id, 10),
        location_id: form.location_id ? parseInt(form.location_id, 10) : null,
        status: form.status,
        purchase_date: form.purchase_date,
        purchase_price: parseFloat(form.purchase_price),
        useful_life_years: parseInt(form.useful_life_years, 10),
        salvage_value: salvageVal,
        current_holder: form.current_holder || null,
        image_url: form.image_url || null
      };

      const res = await updateAsset(asset.id, payload);
      if (res.success) {
        showSuccess(`Data unit [${asset.asset_tag}] berhasil diperbarui!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      showError('Gagal memperbarui unit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

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
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  {asset.asset_tag}
                </span>
                <h3 className="font-black text-slate-900 text-base">Edit Spesifikasi Unit Aset</h3>
              </div>
              <p className="text-xs text-slate-500">Perbarui data perangkat, lokasi, dan kalkulasi depresiasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Model Name */}
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Model & Spesifikasi Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.model_name}
                onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            {/* Serial Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Nomor Seri (Serial Number) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.serial_number}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Status Operasional</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-bold"
              >
                <option value="available">Tersedia di Gudang</option>
                <option value="assigned">Sedang Dipinjam Staf</option>
                <option value="maintenance">Dalam Perbaikan/Servis</option>
                <option value="retired">Afkir / Pensiun</option>
                <option value="lost">Hilang</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Kategori Hardware <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.category_id}
                onChange={(e) => {
                  const cat = categories.find((c) => String(c.id) === String(e.target.value));
                  setForm({
                    ...form,
                    category_id: e.target.value,
                    useful_life_years: cat ? cat.useful_life_years : form.useful_life_years,
                    salvage_percentage: cat ? cat.salvage_percentage : form.salvage_percentage
                  });
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.useful_life_years} Tahun)
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Lokasi / Gudang</label>
              <select
                value={form.location_id}
                onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="">-- Tanpa Lokasi Khusus --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.branch_name} - {loc.room_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Tanggal Pembelian <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Purchase Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Harga Perolehan / Beli (IDR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Photo Upload & Preview */}
            <div className="col-span-1 sm:col-span-2 space-y-2 border-t border-slate-200 pt-3">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Foto Fisik Perangkat (Maks 5MB)</span>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: '' })}
                    className="text-[10px] text-rose-600 hover:underline font-normal"
                  >
                    Hapus Foto
                  </button>
                )}
              </label>

              <div className="flex items-center gap-3">
                {form.image_url ? (
                  <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                    <img
                      src={form.image_url.startsWith('http') ? form.image_url : `http://localhost:5000${form.image_url}`}
                      alt="Unit"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    {uploadingImage ? 'Mengunggah foto...' : 'Format JPG, PNG, atau WEBP'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Depreciation Preview */}
          {priceNum > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Simulasi Nilai Depresiasi Terbaru</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700 font-mono pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nilai Residu:</span>
                  <span className="font-bold text-slate-900">Rp {Number(salvageVal).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Depresiasi / Thn:</span>
                  <span className="font-bold text-slate-900">Rp {Number(annualDep).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Masa Manfaat:</span>
                  <span className="font-bold text-slate-900">{form.useful_life_years} Tahun</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

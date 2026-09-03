import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Package,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { createAsset, getCategories, getLocations, uploadFile } from '../services/api';
import { useToast } from './Toast';

export default function AddAssetModal({ isOpen, onClose, onSuccess, onOpenManageMaster }) {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    asset_tag: '',
    serial_number: '',
    model_name: '',
    category_id: '',
    location_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    useful_life_years: 4,
    salvage_percentage: 5.0,
    status: 'available',
    image_url: ''
  });


  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    try {
      const [catRes, locRes] = await Promise.all([getCategories(), getLocations()]);
      if (catRes.success) setCategories(catRes.data);
      if (locRes.success) setLocations(locRes.data);

      if (catRes.success && catRes.data.length > 0) {
        setForm((prev) => ({
          ...prev,
          category_id: catRes.data[0].id,
          useful_life_years: catRes.data[0].useful_life_years || 4,
          salvage_percentage: catRes.data[0].salvage_percentage || 5.0
        }));
      }
      if (locRes.success && locRes.data.length > 0) {
        setForm((prev) => ({ ...prev, location_id: locRes.data[0].id }));
      }
    } catch (e) {
      console.error('Failed to load modal metadata:', e);
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find((c) => String(c.id) === String(catId));
    setForm((prev) => ({
      ...prev,
      category_id: catId,
      useful_life_years: cat ? cat.useful_life_years : 4,
      salvage_percentage: cat ? cat.salvage_percentage : 5.0
    }));
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

  const autoGenerateTag = () => {
    const cat = categories.find((c) => String(c.id) === String(form.category_id));
    const prefix = cat ? cat.name.substring(0, 2).toUpperCase() : 'IT';
    const year = new Date(form.purchase_date).getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    setForm((prev) => ({
      ...prev,
      asset_tag: `AST-${prefix}-${year}-${random}`,
      serial_number: `SN-${Date.now().toString().slice(-6)}`
    }));
  };

  const priceNum = parseFloat(form.purchase_price) || 0;
  const salvageVal = (priceNum * (parseFloat(form.salvage_percentage) || 5)) / 100;
  const annualDep = (priceNum - salvageVal) / (parseInt(form.useful_life_years, 10) || 4);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        purchase_price: parseFloat(form.purchase_price),
        category_id: parseInt(form.category_id, 10),
        location_id: form.location_id ? parseInt(form.location_id, 10) : undefined,
        useful_life_years: parseInt(form.useful_life_years, 10),
        salvage_percentage: parseFloat(form.salvage_percentage)
      };

      const res = await createAsset(payload);
      if (res.success) {
        showSuccess(`Unit [${res.data.asset_tag}] berhasil didaftarkan ke gudang inventaris!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      showError('Gagal menambahkan unit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 top-14 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Registrasi Perangkat IT Baru</h3>
              <p className="text-[11px] text-slate-500">Sistem otomatis membuat nomor Asset Tag unik & Kode QR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Kategori Hardware <span className="text-rose-500">*</span>
                </label>
                {onOpenManageMaster && (
                  <button
                    type="button"
                    onClick={onOpenManageMaster}
                    className="text-[10px] font-bold text-sky-600 hover:text-sky-700"
                  >
                    + Kelola Kategori
                  </button>
                )}
              </div>
              <select
                required
                value={form.category_id}
                onChange={handleCategoryChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.useful_life_years} Thn Masa Pakai)
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Lokasi / Gudang <span className="text-rose-500">*</span>
                </label>
                {onOpenManageMaster && (
                  <button
                    type="button"
                    onClick={onOpenManageMaster}
                    className="text-[10px] font-bold text-sky-600 hover:text-sky-700"
                  >
                    + Kelola Lokasi
                  </button>
                )}
              </div>
              <select
                value={form.location_id}
                onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.branch_name} - {loc.room_name}
                  </option>
                ))}
              </select>
            </div>


            {/* Model Name */}
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Model & Spesifikasi Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Lenovo ThinkPad T14 Gen 3 (Core i7 / 16GB / 512GB SSD)"
                value={form.model_name}
                onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Asset Tag & Serial with Auto Generate */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">
                  Asset Tag <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={autoGenerateTag}
                  className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto Tag
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="AST-NB-2024-1001"
                value={form.asset_tag}
                onChange={(e) => setForm({ ...form, asset_tag: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Nomor Seri (Serial Number) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="PF-4X998A-2024"
                value={form.serial_number}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Purchase Date & Price */}
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Harga Beli Awal (IDR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                placeholder="15000000"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
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
                  <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
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
                  <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                    <ImageIcon className="w-5 h-5" />
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


          {/* Real-time Depreciation Preview Box */}
          {priceNum > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-xs animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Simulasi Depresiasi Garis Lurus (Straight-Line)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-700 font-mono">
                <div>
                  <span className="text-slate-500 block">Nilai Residu ({form.salvage_percentage}%):</span>
                  <span className="font-bold text-slate-900">Rp {Number(salvageVal).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Depresiasi / Thn:</span>
                  <span className="font-bold text-slate-900">Rp {Number(annualDep).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Masa Manfaat:</span>
                  <span className="font-bold text-slate-900">{form.useful_life_years} Tahun</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-2 flex justify-end gap-2.5">
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
              <Package className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan & Buat QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

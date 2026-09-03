import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  QrCode,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  TrendingDown,
  UserCheck,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Cpu,
  Package,
  RotateCcw,
  Edit3,
  Image as ImageIcon
} from 'lucide-react';
import { getAssetById } from '../services/api';
import BastModal from './BastModal';
import QRCodeImage from './QRCodeImage';

export default function AssetDetailModal({
  isOpen,
  assetId,
  onClose,
  onPrintLabel,
  onCheckout,
  onCheckin,
  onMaintenance,
  onEdit
}) {

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'assignments', 'maintenance'
  const [showBast, setShowBast] = useState(false);

  useEffect(() => {
    if (isOpen && assetId) {
      loadAsset();
    }
  }, [isOpen, assetId]);

  const loadAsset = async () => {
    setLoading(true);
    try {
      const res = await getAssetById(assetId);
      if (res.success) {
        setAsset(res.data);
      }
    } catch (err) {
      console.error('Failed to load asset detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 top-14 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    {asset?.asset_tag || 'AST-XXXX'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    asset?.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    asset?.status === 'assigned' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {asset?.status === 'available' ? 'Tersedia di Gudang' : asset?.status === 'assigned' ? 'Sedang Dipinjam' : 'Dalam Servis'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-md mt-0.5">
                  {asset?.model_name || 'Lembar Spesifikasi Aset'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Spesifikasi & Depresiasi</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'assignments'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sirkulasi ({asset?.assignments?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-2.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'maintenance'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Servis ({asset?.maintenance_logs?.length || 0})</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs">Memuat data spesifikasi...</p>
              </div>
            ) : asset ? (
              <>
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Top Card: Photo, QR Visual & Hardware Tag */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      {/* Photo or QR */}
                      <div className="flex items-center gap-2 shrink-0">
                        {asset.image_url ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                            <img
                              src={asset.image_url.startsWith('http') ? asset.image_url : `http://localhost:5000${asset.image_url}`}
                              alt={asset.model_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="w-20 h-20 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center border border-slate-200 shadow-xs">
                          <QRCodeImage value={asset.asset_tag} size={72} />
                        </div>
                      </div>

                      <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-bold">
                          {asset.asset_tag}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base leading-snug">{asset.model_name}</h4>
                        <p className="text-xs text-slate-600 font-mono">
                          Nomor Seri: <strong className="text-slate-900">{asset.serial_number}</strong>
                        </p>
                        <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{asset.branch_name} - {asset.room_name}</span>
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(asset)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs justify-center"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Unit</span>
                          </button>
                        )}
                        <button
                          onClick={() => onPrintLabel && onPrintLabel(asset)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition justify-center"
                        >
                          <Printer className="w-3.5 h-3.5 text-sky-600" />
                          <span>Cetak Stiker</span>
                        </button>
                      </div>
                    </div>


                    {/* Financial & Depreciation Calculation Box */}
                    {asset.depreciation && (
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <div className="flex items-center gap-1.5">
                            <TrendingDown className="w-4 h-4 text-emerald-700" />
                            <h4 className="font-bold text-slate-900 text-xs">
                              Depresiasi Garis Lurus (Straight-Line)
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                            Masa Manfaat: {asset.useful_life_years} Tahun
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
                            <span className="text-slate-500 block text-[9px] sm:text-[10px] mb-0.5 truncate">Harga Beli Awal</span>
                            <span className="font-bold text-slate-900 text-[11px] sm:text-xs font-mono truncate block">
                              Rp {Number(asset.depreciation.cost).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
                            <span className="text-slate-500 block text-[9px] sm:text-[10px] mb-0.5 truncate">Nilai Sisa Residu</span>
                            <span className="font-bold text-slate-700 text-[11px] sm:text-xs font-mono truncate block">
                              Rp {Number(asset.depreciation.salvageValue).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
                            <span className="text-slate-500 block text-[9px] sm:text-[10px] mb-0.5 truncate">Akumulasi Penyusutan</span>
                            <span className="font-bold text-rose-600 text-[11px] sm:text-xs font-mono truncate block">
                              - Rp {Number(asset.depreciation.accumulatedDepreciation).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 shadow-xs min-w-0">
                            <span className="text-emerald-900 block text-[9px] sm:text-[10px] mb-0.5 font-bold truncate">Sisa Nilai Buku</span>
                            <span className="font-black text-emerald-900 text-xs sm:text-sm font-mono truncate block">
                              Rp {Number(asset.depreciation.currentBookValue).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ASSIGNMENTS */}
                {activeTab === 'assignments' && (
                  <div className="space-y-3">
                    {asset.assignments && asset.assignments.length > 0 ? (
                      asset.assignments.map((asg) => (
                        <div
                          key={asg.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{asg.employee_name} ({asg.employee_id_number})</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              asg.returned_at ? 'bg-slate-200 text-slate-600' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {asg.returned_at ? 'Selesai' : 'Aktif'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">Check-out: {new Date(asg.assigned_at).toLocaleDateString('id-ID')}</p>
                          <p className="text-[11px] text-slate-600">Kondisi: {asg.condition_on_checkout}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">Belum ada riwayat sirkulasi.</div>
                    )}
                  </div>
                )}

                {/* TAB 3: MAINTENANCE */}
                {activeTab === 'maintenance' && (
                  <div className="space-y-3">
                    {asset.maintenance_logs && asset.maintenance_logs.length > 0 ? (
                      asset.maintenance_logs.map((m) => (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{m.vendor_name}</span>
                            <span className="font-mono text-slate-800 font-bold">Rp {Number(m.cost).toLocaleString('id-ID')}</span>
                          </div>
                          <p className="text-slate-700 text-[11px]">{m.issue_description}</p>
                          <span className="text-[10px] text-slate-500">Tgl: {m.service_date}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">Tidak ada riwayat pemeliharaan fisik.</div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex gap-2">
              {asset?.status === 'available' && (
                <button
                  onClick={() => {
                    onClose();
                    if (onCheckout) onCheckout(asset);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Serah Terima
                </button>
              )}
              {asset?.status === 'assigned' && (
                <button
                  onClick={() => {
                    onClose();
                    if (onCheckin) onCheckin(asset);
                  }}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Kembalikan Unit
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(asset);
                  }}
                  className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data Unit</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

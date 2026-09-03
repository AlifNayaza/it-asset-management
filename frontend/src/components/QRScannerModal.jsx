// File: frontend/src/components/QRScannerModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  RotateCcw,
  Scan,
  Sparkles,
  Package,
  Zap
} from 'lucide-react';
import { getAssetQuickView } from '../services/api';

export default function QRScannerModal({ isOpen, onClose, onSelectAsset, onQuickCheckout, onQuickCheckin }) {
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  
  const html5QrCodeRef = useRef(null);

  // Instant high-pitch audio chime
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // AudioContext not allowed
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      setAssetData(null);
      setError(null);
      initCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const initCamera = async () => {
    try {
      setError(null);
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
        const chosenId = backCamera ? backCamera.id : devices[0].id;
        setSelectedCamera(chosenId);
        startScanner(chosenId);
      } else {
        setError('Kamera tidak terdeteksi pada perangkat Anda.');
      }
    } catch (err) {
      console.error('Camera Init Error:', err);
      setError('Gagal mengakses kamera. Izinkan akses kamera browser Anda.');
    }
  };

  const startScanner = async (cameraId) => {
    try {
      if (html5QrCodeRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      // Optimized for ultra-fast instant detection
      const config = {
        fps: 30, // 30 FPS for instant capture
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        disableFlip: false
      };

      await html5QrCode.start(
        cameraId,
        config,
        async (decodedText) => {
          playBeep();
          setScannedResult(decodedText);
          handleScannedTag(decodedText);
          await stopCamera();
        },
        () => {}
      );

      setScanning(true);
    } catch (err) {
      console.error('Start Scanner Error:', err);
      setError('Gagal mengaktifkan scanner: ' + err.message);
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Stop error:', e);
      }
    }
    setScanning(false);
  };

  const handleScannedTag = async (tagText) => {
    setLoading(true);
    setError(null);
    try {
      let cleanTag = tagText.trim();
      if (cleanTag.includes('/')) {
        const parts = cleanTag.split('/');
        cleanTag = parts[parts.length - 1];
      }

      const res = await getAssetQuickView(cleanTag);
      if (res.success && res.data) {
        setAssetData(res.data);
      } else {
        setError(`Aset [${cleanTag}] tidak ditemukan di database.`);
      }
    } catch (err) {
      setError(err.message || 'Data aset tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const restartScan = () => {
    setScannedResult(null);
    setAssetData(null);
    setError(null);
    if (selectedCamera) {
      startScanner(selectedCamera);
    } else {
      initCamera();
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
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Pemindai QR Cepat (30 FPS)</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" /> Turbo
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Arahkan kamera ke label stiker unit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3 bg-slate-50/50">
          {/* Camera Selection */}
          {cameras.length > 1 && !assetData && (
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-600 font-medium">Kamera:</span>
              <select
                value={selectedCamera}
                onChange={(e) => {
                  setSelectedCamera(e.target.value);
                  startScanner(e.target.value);
                }}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 font-bold outline-none"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Kamera ${c.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Camera Viewfinder */}
          {!assetData && (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-300 flex flex-col items-center justify-center min-h-[260px] shadow-xs">
              <div id="qr-reader" className="w-full h-full"></div>
            </div>
          )}

          {/* Manual Tag Input Quick Search */}
          {!assetData && (
            <div className="pt-1">
              <span className="text-[11px] text-slate-600 mb-1 block font-medium">
                Atau cari manual dengan nomor Asset Tag / Serial:
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = e.target.elements.manualTag.value;
                  if (val) handleScannedTag(val);
                }}
                className="flex gap-2"
              >
                <input
                  name="manualTag"
                  type="text"
                  placeholder="Misal: AST-NB-2024-1001"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Cari
                </button>
              </form>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
              <span className="text-xs font-medium">Mencocokkan data aset...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-bold">Aset Tidak Ditemukan</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
                <button
                  onClick={restartScan}
                  className="mt-1.5 text-xs font-bold text-rose-700 underline"
                >
                  Scan Ulang Kamera
                </button>
              </div>
            </div>
          )}

          {/* Scanned Result Card */}
          {assetData && (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs animate-scaleUp">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      {assetData.asset_tag}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      assetData.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      assetData.status === 'assigned' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {assetData.status === 'available' ? 'Tersedia di Gudang' : assetData.status === 'assigned' ? 'Sedang Dipinjam' : 'Dalam Servis'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{assetData.model_name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">S/N: {assetData.serial_number}</p>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 text-[10px]">Kategori & Lokasi:</span>
                  <p className="font-bold text-slate-800 text-[11px]">{assetData.category_name || 'Hardware'}</p>
                  <p className="text-slate-500 text-[10px]">{assetData.branch_name} - {assetData.room_name}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 text-[10px]">Pemegang Saat Ini:</span>
                  <p className="font-bold text-slate-800 text-[11px]">
                    {assetData.current_holder || <span className="text-slate-400 italic">Tersedia di Gudang</span>}
                  </p>
                  {assetData.active_assignment && (
                    <p className="text-sky-700 text-[10px] font-mono">NIP: {assetData.active_assignment.employee_id_number}</p>
                  )}
                </div>
                {assetData.depreciation && (
                  <div className="col-span-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 block text-[10px]">Sisa Nilai Buku:</span>
                      <span className="font-bold text-emerald-800 text-sm font-mono">
                        Rp {Number(assetData.depreciation.currentBookValue).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <span>Harga Awal: </span>
                      <span className="text-slate-800 font-mono font-semibold">
                        Rp {Number(assetData.purchase_price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap gap-2">
                {assetData.status === 'available' && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onQuickCheckout) onQuickCheckout(assetData);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Serah Terima
                  </button>
                )}

                {assetData.status === 'assigned' && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onQuickCheckin) onQuickCheckin(assetData);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Kembalikan Unit
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    if (onSelectAsset) onSelectAsset(assetData.id);
                  }}
                  className="flex items-center justify-center gap-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Detail
                </button>

                <button
                  onClick={restartScan}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
                  title="Scan aset lain"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

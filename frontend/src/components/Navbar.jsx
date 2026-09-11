// File: frontend/src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import {
  Package,
  Camera,
  Database,
  Menu,
  X,
  Plus,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getHealth, triggerSeed } from '../services/api';
import { useToast } from './Toast';

export default function Navbar({
  onOpenScanner,
  onOpenAddAsset,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) {
  const [health, setHealth] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const { showSuccess, showError } = useToast();

  const checkStatus = async () => {
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (e) {
      setHealth({ postgres_connected: false, status: 'offline' });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleReSeed = async () => {
    if (confirm('Muat ulang 20+ unit data perangkat IT nyata untuk demonstrasi portofolio?')) {
      setSeeding(true);
      try {
        await triggerSeed();
        showSuccess('Data demo 20+ unit perangkat kerja berhasil dimuat!');
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        showError('Gagal memuat data demo: ' + err.message);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center shadow-xs">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              aria-label="Menu"
            >
              {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black shadow-xs">
                <Package className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  IT Asset Manager
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Enterprise
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Database Status */}
            <button
              onClick={() => setShowDbModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 transition"
              title="Status Database PostgreSQL"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline text-[11px] font-medium">DB:</span>
              {health?.postgres_connected ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  PostgreSQL
                </span>
              ) : (
                <span className="text-sky-600 font-bold flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                  Demo Mode
                </span>
              )}
            </button>


            {/* Sync Demo Data */}
            <button
              onClick={handleReSeed}
              disabled={seeding}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
              title="Reset 20+ unit perangkat nyata"
            >
              <Sparkles className={`w-3 h-3 text-amber-500 ${seeding ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">{seeding ? 'Memuat...' : 'Reset Data'}</span>
            </button>

            {/* Scan QR Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition hover:scale-105 active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>Scan QR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Database Status Modal */}
      {showDbModal && (
        <div
          onClick={() => setShowDbModal(false)}
          className="fixed inset-0 z-40 top-14 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Koneksi Database PostgreSQL</h3>
                  <p className="text-xs text-slate-500">Laragon Local Engine Port 5432</p>
                </div>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Mode Sistem:</span>
                {health?.postgres_connected ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Fullstack (PostgreSQL)
                  </span>
                ) : (
                  <span className="text-sky-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Web Demo (Browser Storage)
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-600 border-t border-slate-200 pt-2">
                <span>Penyimpanan Data:</span>
                <span className="font-mono font-bold text-slate-800">
                  {health?.postgres_connected ? 'PostgreSQL (Port 5432)' : 'LocalStorage (Sandbox Mandiri)'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                {health?.postgres_connected
                  ? 'Sistem terhubung langsung ke basis data PostgreSQL lokal.'
                  : 'Mode demo aktif! Anda bebas mencoba menambah, mengedit, menghapus aset, scan QR, dan cetak BAST. Setiap pengunjung memiliki sesi data mandiri tanpa memerlukan server backend.'}
              </div>
            </div>


            <button
              onClick={() => setShowDbModal(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}

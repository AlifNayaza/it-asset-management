// File: frontend/src/components/Sidebar.jsx
import React from 'react';
import {
  LayoutDashboard,
  Package,
  UserCheck,
  Wrench,
  TrendingDown,
  ShieldAlert,
  Plus,
  Camera,
  X,
  Sparkles,
  HelpCircle,
  Database,
  FileText
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenAddAsset,
  onOpenScanner,
  isMobileOpen,
  onCloseMobile
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Beranda & Alur Kerja', icon: LayoutDashboard, desc: 'Ringkasan & panduan' },
    { id: 'assets', label: 'Semua Inventaris Aset', icon: Package, desc: 'Katalog & label QR' },
    { id: 'handover', label: 'Sirkulasi Serah Terima', icon: UserCheck, desc: 'Pinjam & kembalikan' },
    { id: 'maintenance', label: 'Perbaikan & Servis', icon: Wrench, desc: 'Catatan servis unit' },
    { id: 'depreciation', label: 'Laporan Depresiasi', icon: TrendingDown, desc: 'Nilai buku otomatis' },
    { id: 'audit', label: 'Catatan Audit Data', icon: ShieldAlert, desc: 'Log JSONB PostgreSQL' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-200">
          <span className="font-bold text-slate-900 text-sm">Menu Navigasi</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Menu Utama
          </span>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <span className="block text-xs sm:text-sm leading-tight">{item.label}</span>
                    <span className={`block text-[10px] mt-0.5 truncate ${isActive ? 'text-sky-600 font-medium' : 'text-slate-400'}`}>
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Operations Button */}
        <div className="pt-2 space-y-2 border-t border-slate-200">
          <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Aksi Cepat
          </span>
          <button
            onClick={() => {
              onOpenAddAsset();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>Tambah Perangkat</span>
          </button>
          <button
            onClick={() => {
              onOpenScanner();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition"
          >
            <Camera className="w-4 h-4 text-sky-600" />
            <span>Pindai QR Kamera</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400">
        <p className="px-2 text-[11px]">
          IT Asset & Inventory Management • Laragon Edition
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-[calc(100vh-53px)] shadow-xs">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 shadow-2xl z-50 animate-slideRight">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

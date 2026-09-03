// File: frontend/src/components/StatsWidget.jsx
import React from 'react';
import {
  Server,
  CheckCircle2,
  UserCheck,
  Wrench,
  DollarSign,
  TrendingDown,
  Cpu,
  HardDrive,
  Activity,
  Layers
} from 'lucide-react';

export default function StatsWidget({ stats = {}, financialSummary = {} }) {
  const safeStats = stats || {};
  const safeFinancial = financialSummary || {};

  const totalAssets = safeStats.total_assets || 0;
  const available = safeStats.available || 0;
  const assigned = safeStats.assigned || 0;
  const maintenance = safeStats.maintenance || 0;
  const totalCost = safeStats.total_acquisition_cost || safeFinancial.totalOriginalCost || 0;
  const currentBookVal = safeFinancial.totalCurrentBookValue || 0;
  const totalAccumulatedDep = safeFinancial.totalAccumulatedDepreciation || 0;

  const cards = [
    {
      label: 'Hardware Fleet',
      value: `${totalAssets} Units`,
      sub: 'Total Unit Terdaftar',
      icon: Server,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20 shadow-cyan-950/20',
      accent: 'from-cyan-500 to-blue-500'
    },
    {
      label: 'Available in Vault',
      value: `${available} Units`,
      sub: `${totalAssets > 0 ? ((available / totalAssets) * 100).toFixed(0) : 0}% Siap Dialokasikan`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-950/20',
      accent: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'In Active Custody',
      value: `${assigned} Units`,
      sub: 'Digunakan oleh Karyawan',
      icon: UserCheck,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20 shadow-blue-950/20',
      accent: 'from-blue-500 to-indigo-500'
    },
    {
      label: 'RMA / Maintenance',
      value: `${maintenance} Units`,
      sub: 'Reparasi & Klaim Garansi',
      icon: Wrench,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20 shadow-amber-950/20',
      accent: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Total Acquisition (Capex)',
      value: `Rp ${Number(totalCost).toLocaleString('id-ID')}`,
      sub: 'Harga Perolehan Awal',
      icon: DollarSign,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20 shadow-indigo-950/20',
      accent: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Current Book Value',
      value: `Rp ${Number(currentBookVal).toLocaleString('id-ID')}`,
      sub: `Penyusutan Rp ${Number(totalAccumulatedDep).toLocaleString('id-ID')}`,
      icon: TrendingDown,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20 shadow-teal-950/20',
      accent: 'from-teal-400 to-cyan-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-3xl border ${c.bg} bg-[#0d121d]/90 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-slate-600 flex flex-col justify-between shadow-xl relative overflow-hidden group`}
          >
            {/* Top gradient accent line */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${c.accent} opacity-80 group-hover:opacity-100 transition`}></div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono line-clamp-1">
                {c.label}
              </span>
              <div className={`p-2 rounded-2xl ${c.bg} ${c.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-lg lg:text-xl font-black text-white tracking-tight font-mono">
                {c.value}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium line-clamp-1">
                {c.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

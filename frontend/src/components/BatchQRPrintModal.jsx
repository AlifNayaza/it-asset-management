// File: frontend/src/components/BatchQRPrintModal.jsx
import React, { useRef } from 'react';
import { X, Printer, QrCode } from 'lucide-react';
import QRCodeImage from './QRCodeImage';

export default function BatchQRPrintModal({ isOpen, onClose, assets = [] }) {
  const printRef = useRef(null);

  if (!isOpen || assets.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 top-14 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Cetak Lembar Stiker Aset Massal ({assets.length} Label)
              </h3>
              <p className="text-[11px] text-slate-500">
                Render Instan 0ms • Format Kisi Stiker Kertas A4 (2 Kolom)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Grid Area */}
        <div className="p-5 overflow-y-auto bg-slate-100/70">
          <div
            id="printable-label-area"
            ref={printRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-300 print:border-none print:shadow-none print:p-0 print:grid-cols-2"
          >
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white text-slate-900 rounded-xl p-3 border-2 border-dashed border-slate-400 shadow-2xs flex flex-col gap-1.5 font-sans break-inside-avoid print:border-solid print:border-black"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <span className="font-black text-[9px] tracking-wider uppercase text-slate-900 font-mono">
                    IT ASSET INVENTORY
                  </span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase">
                    PROPERTY OF CORP
                  </span>
                </div>

                {/* Body */}
                <div className="flex items-center gap-2.5">
                  {/* High-res Instant QR Code */}
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-0.5 shrink-0 flex items-center justify-center">
                    <QRCodeImage value={asset.asset_tag} size={60} />
                  </div>
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    <span className="inline-block font-mono font-bold text-xs text-slate-950 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {asset.asset_tag}
                    </span>
                    <p className="font-bold text-[11px] text-slate-900 line-clamp-1 leading-tight">
                      {asset.model_name}
                    </p>
                    <p className="text-[9px] text-slate-600 font-mono">
                      S/N: {asset.serial_number}
                    </p>
                    <p className="text-[8px] text-slate-500 truncate">
                      {asset.category_name} • {asset.branch_name}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-0.5 flex items-center justify-between text-[7px] text-slate-500 font-mono">
                  <span>SCAN TO AUDIT</span>
                  <span>DO NOT REMOVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">
            Total {assets.length} label stiker siap cetak
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Batal
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Lembar A4</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

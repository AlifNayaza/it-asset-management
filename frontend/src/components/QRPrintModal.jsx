// File: frontend/src/components/QRPrintModal.jsx
import React, { useRef } from 'react';
import { X, Printer, QrCode, Shield, CheckCircle2 } from 'lucide-react';
import QRCodeImage from './QRCodeImage';

export default function QRPrintModal({ isOpen, onClose, asset, labelData }) {
  const printAreaRef = useRef(null);

  if (!isOpen || (!asset && !labelData)) return null;

  const tag = labelData?.assetTag || asset?.asset_tag || 'AST-XXXX';
  const model = labelData?.modelName || asset?.model_name || 'Hardware Model';
  const serial = labelData?.serialNumber || asset?.serial_number || '-';
  const category = labelData?.categoryName || asset?.category_name || 'IT Asset';
  const branch = asset?.branch_name || 'HQ Jakarta';

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
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Cetak Stiker Label Tag Aset</h3>
              <p className="text-[11px] text-slate-500">Stiker barcode fisik 70mm x 40mm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Label Studio Preview Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-50 space-y-3">
          <div
            id="printable-label-area"
            ref={printAreaRef}
            className="w-full max-w-[340px] bg-white text-slate-900 rounded-xl p-4 border-2 border-dashed border-slate-400 shadow-sm flex flex-col gap-2.5 font-sans print:border-solid print:border-black"
          >
            {/* Top Bar / Corporate Header */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-slate-900 text-sky-400 flex items-center justify-center font-black text-[10px] font-mono">
                  IT
                </div>
                <div>
                  <span className="font-black text-[10px] tracking-wider uppercase text-slate-900 font-mono block leading-none">
                    CORP INFRASTRUCTURE
                  </span>
                  <span className="text-[8px] text-slate-500 font-semibold uppercase block mt-0.5">
                    IT ASSET MANAGEMENT
                  </span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-800 px-1 py-0.5 rounded bg-slate-100 border border-slate-200 uppercase">
                PROPERTY OF CORP
              </span>
            </div>

            {/* QR Code & Information Grid */}
            <div className="flex items-center gap-3">
              {/* High-res Instant QR Code */}
              <div className="w-20 h-20 shrink-0 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                <QRCodeImage value={tag} size={72} />
              </div>

              {/* Hardware Specs Info */}
              <div className="flex-1 space-y-0.5 overflow-hidden">
                <div className="bg-slate-900 text-white rounded px-2 py-0.5 inline-block">
                  <span className="font-mono font-bold text-xs tracking-wide block">
                    {tag}
                  </span>
                </div>
                <p className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                  {model}
                </p>
                <div className="text-[10px] text-slate-600 font-mono pt-0.5">
                  <span className="text-slate-500">S/N: </span>
                  <span className="font-semibold text-slate-900">{serial}</span>
                </div>
                <div className="text-[9px] text-slate-500 truncate">
                  {branch} • {category}
                </div>
              </div>
            </div>

            {/* Footer Barcode line & Warning */}
            <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono">
              <span className="font-bold text-slate-700">SCAN FOR AUDIT</span>
              <span>DO NOT REMOVE</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Batal
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Stiker Label</span>
          </button>
        </div>
      </div>
    </div>
  );
}

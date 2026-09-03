// File: frontend/src/components/BastModal.jsx
import React, { useRef } from 'react';
import { X, Printer, FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export default function BastModal({ isOpen, onClose, assignmentData, assetData }) {
  const printRef = useRef(null);

  if (!isOpen || (!assignmentData && !assetData)) return null;

  const employeeName = assignmentData?.employee_name || 'Ahmad Fauzi';
  const employeeNip = assignmentData?.employee_id_number || 'EMP-IT-0042';
  const assignedDate = assignmentData?.assigned_at ? new Date(assignmentData.assigned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const assetTag = assetData?.asset_tag || assignmentData?.asset_tag || 'AST-NB-2024-1001';
  const modelName = assetData?.model_name || assignmentData?.model_name || 'Lenovo ThinkPad E14 Gen 4';
  const serialNumber = assetData?.serial_number || assignmentData?.serial_number || 'PF-4X998A-2024';
  const categoryName = assetData?.category_name || 'Laptop / Notebook';
  const condition = assignmentData?.condition_on_checkout || 'Kondisi 100% baik dan berfungsi normal';
  const officerName = assignmentData?.assigned_by || 'Petugas IT Asset';

  const docNumber = `BAST/IT-ASSET/${new Date().getFullYear()}/${assetTag.replace(/[^a-zA-Z0-9]/g, '')}`;

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
        className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Berita Acara Serah Terima (BAST) Digital
              </h3>
              <p className="text-[11px] text-slate-500">Pas 1 Halaman A4 • Siap Cetak / Simpan PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Document Content (Strict 1 Page Fit) */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/60">
          <div
            id="printable-label-area"
            ref={printRef}
            className="w-full bg-white rounded-xl p-6 border border-slate-300 shadow-xs space-y-3.5 text-slate-900 font-sans print:border-none print:shadow-none print:p-0 print:space-y-3"
          >
            {/* Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <div>
                <h2 className="font-black text-sm tracking-tight text-slate-900 uppercase">
                  PT INOVASI TEKNOLOGI NUSANTARA
                </h2>
                <p className="text-[10px] text-slate-600 font-medium leading-tight">
                  Divisi Information Technology & Infrastructure Operations
                </p>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Gedung Cyber 2 Lantai 12, Jl. HR Rasuna Said, Jakarta
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded border border-slate-300 inline-block">
                  FORMULIR BAST
                </span>
                <p className="text-[9px] text-slate-500 mt-0.5">{docNumber}</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-0.5 pt-0.5">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 underline decoration-1 underline-offset-2">
                BERITA ACARA SERAH TERIMA PERANGKAT KERJA (BAST)
              </h3>
              <p className="text-[10px] text-slate-600">
                Nomor: <span className="font-mono font-bold text-slate-900">{docNumber}</span>
              </p>
            </div>

            {/* Preamble */}
            <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
              Pada hari ini, tanggal <strong>{assignedDate}</strong>, bertempat di Kantor Operasional IT, telah dilaksanakan serah terima fasilitas perangkat kerja teknologi informasi dari Departemen IT kepada Karyawan:
            </p>

            {/* Parties Info Table */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="font-bold text-slate-900 block text-[9px] uppercase tracking-wide border-b border-slate-200 pb-0.5">
                  PIHAK PERTAMA (YANG MENYERAHKAN):
                </span>
                <p>Nama: <strong>{officerName}</strong></p>
                <p>Dept: <strong>IT Infrastructure Operations</strong></p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="font-bold text-slate-900 block text-[9px] uppercase tracking-wide border-b border-slate-200 pb-0.5">
                  PIHAK KEDUA (PENERIMA FASILITAS):
                </span>
                <p>Nama: <strong>{employeeName}</strong></p>
                <p>NIP: <strong className="font-mono">{employeeNip}</strong></p>
              </div>
            </div>

            {/* Hardware Specification Grid */}
            <div className="space-y-1 text-[11px]">
              <h4 className="font-bold text-slate-900 uppercase text-[9px] tracking-wide">
                Rincian Perangkat Keras yang Diserahterimakan:
              </h4>
              <table className="w-full border-collapse border border-slate-300 text-left text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="p-1.5 border-r border-slate-300">Asset Tag</th>
                    <th className="p-1.5 border-r border-slate-300">Model Perangkat</th>
                    <th className="p-1.5 border-r border-slate-300">Nomor Seri (S/N)</th>
                    <th className="p-1.5">Kondisi Fisik</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-300 font-mono">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-blue-700">{assetTag}</td>
                    <td className="p-1.5 font-sans font-medium border-r border-slate-300">{modelName}</td>
                    <td className="p-1.5 border-r border-slate-300 font-semibold">{serialNumber}</td>
                    <td className="p-1.5 font-sans text-emerald-700 font-semibold">{condition}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms */}
            <div className="space-y-0.5 text-[9px] text-slate-600 leading-tight bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-900">Ketentuan & Tanggung Jawab:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Pihak Kedua bertanggung jawab penuh atas pemeliharaan dan keamanan fisik perangkat selama penugasan.</li>
                <li>Perangkat tidak boleh dipindahtangankan kepada pihak ketiga tanpa izin resmi Departemen IT.</li>
                <li>Saat masa tugas/kerja berakhir, unit wajib dikembalikan ke Gudang IT dalam kondisi baik dan lengkap.</li>
              </ol>
            </div>

            {/* Signature Area (Compact) */}
            <div className="pt-2 grid grid-cols-2 gap-6 text-center text-[10px]">
              <div className="space-y-8">
                <p className="font-semibold text-slate-700">Yang Menyerahkan (IT Dept),</p>
                <div className="border-t border-slate-800 pt-0.5 mx-6 font-bold text-slate-900">
                  {officerName}
                </div>
              </div>
              <div className="space-y-8">
                <p className="font-semibold text-slate-700">Penerima Fasilitas,</p>
                <div className="border-t border-slate-800 pt-0.5 mx-6 font-bold text-slate-900">
                  {employeeName}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Format 1 Lembar A4 Portrait
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak BAST (1 Lembar)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

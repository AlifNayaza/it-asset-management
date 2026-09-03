// File: frontend/src/components/ImportCsvModal.jsx
import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2
} from 'lucide-react';
import { bulkImportAssets } from '../services/api';
import { useToast } from './Toast';

export default function ImportCsvModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [parsingError, setParsingError] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast();

  if (!isOpen) return null;

  // Download Sample CSV Template
  const downloadTemplate = () => {
    const headers = [
      'model_name',
      'serial_number',
      'asset_tag',
      'category_name',
      'branch_name',
      'room_name',
      'purchase_date',
      'purchase_price',
      'useful_life_years',
      'status'
    ];
    const sampleRows = [
      [
        'Lenovo ThinkPad X1 Carbon Gen 11',
        'SN-X1C-2024-001',
        'AST-NB-2026-9101',
        'Laptop / Notebook',
        'Head Office Jakarta',
        'IT Department Lt. 12',
        '2026-01-15',
        '24500000',
        '4',
        'available'
      ],
      [
        'Dell UltraSharp U2723QE 4K Monitor',
        'SN-MN-4K-8821',
        '',
        'Monitor',
        'Head Office Jakarta',
        'Design Studio Lt. 10',
        '2026-02-10',
        '9500000',
        '5',
        'available'
      ]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template_import_aset_it.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Template CSV berhasil diunduh!');
  };

  // Robust CSV parser supporting quotes and commas
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('File CSV kosong atau tidak memiliki baris data.');
    }

    const splitRow = (rowStr) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const header = splitRow(lines[0]).map(h => h.toLowerCase().replace(/[\s_-]/g, ''));

    const findIdx = (...possibleNames) => {
      return header.findIndex(h => possibleNames.some(p => h.includes(p)));
    };

    const idxModel = findIdx('model', 'nama');
    const idxSerial = findIdx('serial', 'sn');
    const idxTag = findIdx('tag', 'asset');
    const idxCategory = findIdx('category', 'kategori');
    const idxBranch = findIdx('branch', 'cabang');
    const idxRoom = findIdx('room', 'ruangan', 'lokasi');
    const idxDate = findIdx('date', 'tanggal', 'beli');
    const idxPrice = findIdx('price', 'harga', 'cost');
    const idxYears = findIdx('years', 'tahun', 'manfaat');
    const idxStatus = findIdx('status');

    if (idxModel === -1 || idxSerial === -1) {
      throw new Error('Kolom "model_name" dan "serial_number" wajib ada pada header CSV.');
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitRow(lines[i]);
      if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

      const model_name = idxModel !== -1 ? cells[idxModel] : '';
      const serial_number = idxSerial !== -1 ? cells[idxSerial] : '';

      if (!model_name && !serial_number) continue;

      rows.push({
        line: i + 1,
        model_name,
        serial_number,
        asset_tag: idxTag !== -1 ? cells[idxTag] : '',
        category_name: idxCategory !== -1 ? cells[idxCategory] : '',
        branch_name: idxBranch !== -1 ? cells[idxBranch] : '',
        room_name: idxRoom !== -1 ? cells[idxRoom] : '',
        purchase_date: idxDate !== -1 && cells[idxDate] ? cells[idxDate] : new Date().toISOString().split('T')[0],
        purchase_price: idxPrice !== -1 ? parseFloat(cells[idxPrice]) || 0 : 0,
        useful_life_years: idxYears !== -1 ? parseInt(cells[idxYears], 10) || 4 : 4,
        status: idxStatus !== -1 && cells[idxStatus] ? cells[idxStatus].toLowerCase() : 'available',
        isValid: Boolean(model_name && serial_number)
      });
    }

    return rows;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setParsingError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);
        setParsedData(parsed);
      } catch (err) {
        setParsingError(err.message);
        setParsedData([]);
      }
    };
    reader.onerror = () => {
      setParsingError('Gagal membaca file CSV.');
    };
    reader.readAsText(selected);
  };

  const handleImportSubmit = async () => {
    const validItems = parsedData.filter(d => d.isValid);
    if (validItems.length === 0) {
      return showError('Tidak ada data valid untuk diimpor.');
    }

    setImporting(true);
    try {
      const res = await bulkImportAssets(validItems);
      if (res.success) {
        showSuccess(`Berhasil mengimpor ${res.count} unit aset ke basis data!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      showError('Gagal mengimpor aset: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedData.filter(d => d.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 top-0 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Import Aset Massal (CSV / Excel)</h3>
              <p className="text-xs text-slate-500">Unggah berkas spreadsheet CSV untuk mendaftarkan banyak unit sekaligus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Step 1: Download Template */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-sky-50/60 border border-sky-200 gap-3">
            <div>
              <h4 className="font-bold text-sky-950 text-xs sm:text-sm">Gunakan Format Template Standar</h4>
              <p className="text-[11px] text-slate-600">
                Pastikan kolom berisi Model, Serial Number, Kategori, Lokasi, Tanggal, dan Harga Beli.
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-sky-700 font-bold rounded-xl text-xs border border-sky-300 shadow-xs transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template CSV</span>
            </button>
          </div>

          {/* Step 2: Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-sky-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                {file ? file.name : 'Klik untuk memilih file CSV atau seret ke sini'}
              </p>
              <p className="text-[11px] text-slate-500">Mendukung file .csv (UTF-8)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Parsing Error */}
          {parsingError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{parsingError}</span>
            </div>
          )}

          {/* Step 3: Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Pratinjau Data ({parsedData.length} baris terdeteksi):
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {validCount} Siap Import
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {invalidCount} Data Tidak Lengkap
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-56 overflow-y-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Serial Number</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3">Lokasi</th>
                      <th className="py-2 px-3">Harga Beli</th>
                      <th className="py-2 px-3 text-center">Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {parsedData.map((item, idx) => (
                      <tr key={idx} className={item.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="py-2 px-3 text-slate-400 font-sans">{item.line}</td>
                        <td className="py-2 px-3 font-sans font-bold text-slate-900">{item.model_name || '-'}</td>
                        <td className="py-2 px-3 text-slate-700">{item.serial_number || '-'}</td>
                        <td className="py-2 px-3 font-sans text-slate-600">{item.category_name || 'Default'}</td>
                        <td className="py-2 px-3 font-sans text-slate-600">{item.branch_name || '-'}</td>
                        <td className="py-2 px-3 text-slate-900 font-bold">
                          Rp {Number(item.purchase_price).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          {item.isValid ? (
                            <span className="text-emerald-600 font-bold text-[10px]">Valid</span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[10px]">Perlu Model & S/N</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setFile(null);
              setParsedData([]);
              setParsingError(null);
            }}
            disabled={parsedData.length === 0}
            className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 font-medium disabled:opacity-30"
          >
            Bersihkan
          </button>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              onClick={handleImportSubmit}
              disabled={importing || validCount === 0}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{importing ? 'Mengimpor Data...' : `Import ${validCount} Unit Aset`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

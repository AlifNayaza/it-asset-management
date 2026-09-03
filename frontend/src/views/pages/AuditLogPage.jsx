// File: frontend/src/views/pages/AuditLogPage.jsx
import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Database,
  Code,
  Filter,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  GitCommit,
  Terminal
} from 'lucide-react';
import { getAuditLogs } from '../../services/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadLogs();
  }, [tableFilter, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        table_name: tableFilter !== 'all' ? tableFilter : undefined,
        action_type: actionFilter !== 'all' ? actionFilter : undefined,
        limit: 100
      };
      const res = await getAuditLogs(params);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'INSERT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
            INSERT
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200 uppercase">
            UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
            DELETE
          </span>
        );
      default:
        return <span className="text-xs text-slate-600 font-mono">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            <span>Audit Trail Transaksional PostgreSQL JSONB</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rekam jejak perubahan data transaksional memanfaatkan snapshot JSONB dan kunci primer UUID
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold border border-slate-300 shadow-xs transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Tabel:</span>
            <select
              value={tableFilter}
              onChange={(e) => {
                setTableFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
            >
              <option value="all">Semua Tabel</option>
              <option value="assets">assets (Data Aset)</option>
              <option value="asset_assignments">asset_assignments (Sirkulasi)</option>
              <option value="maintenance_logs">maintenance_logs (Servis)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Aksi:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
            >
              <option value="all">Semua Operasi</option>
              <option value="INSERT">INSERT (Registrasi)</option>
              <option value="UPDATE">UPDATE (Mutasi / Status)</option>
              <option value="DELETE">DELETE (Penghapusan)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Total <strong>{logs.length}</strong> transaksi terekam
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Membaca riwayat ledger JSONB...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Terminal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Tidak ada log transaksi yang sesuai filter.</p>
          </div>
        ) : (
          logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition hover:border-slate-300"
              >
                {/* Log Row Header */}
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="mt-0.5 sm:mt-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action_type)}
                      <span className="font-mono font-bold text-xs text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {log.table_name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono truncate max-w-xs">
                      ID: <span className="text-slate-900 font-bold">{log.record_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pl-7 sm:pl-0">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{log.performed_by || log.changed_by || 'System'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(log.created_at || log.logged_at).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded JSONB Inspector */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Payload Before */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-rose-700 flex items-center gap-1.5 font-mono text-[11px]">
                          <span>Payload Before (Snapshot Sebelum):</span>
                        </span>
                        <pre className="p-4 rounded-2xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto max-h-64 shadow-xs">
                          {log.payload_before
                            ? JSON.stringify(
                                typeof log.payload_before === 'string'
                                  ? JSON.parse(log.payload_before)
                                  : log.payload_before,
                                null,
                                2
                              )
                            : '// NULL (Data Baru / INSERT)'}
                        </pre>
                      </div>

                      {/* Payload After */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-sky-700 flex items-center gap-1.5 font-mono text-[11px]">
                          <span>Payload After (Snapshot Sesudah):</span>
                        </span>
                        <pre className="p-4 rounded-2xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto max-h-64 shadow-xs">
                          {log.payload_after
                            ? JSON.stringify(
                                typeof log.payload_after === 'string'
                                  ? JSON.parse(log.payload_after)
                                  : log.payload_after,
                                null,
                                2
                              )
                            : '// NULL (Data Dihapus / DELETE)'}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Audit Log Pagination Navigation Bar */}
        {logs.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-3 rounded-2xl border border-slate-200 bg-white text-xs text-slate-600 shadow-xs">
            <span>Halaman <strong>{currentPage}</strong> dari <strong>{Math.ceil(logs.length / itemsPerPage)}</strong> (Total {logs.length} Log Audit)</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.ceil(logs.length / itemsPerPage) }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded-lg font-bold ${
                    currentPage === pg ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                disabled={currentPage === Math.ceil(logs.length / itemsPerPage)}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(logs.length / itemsPerPage)))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// File: frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for clear error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan pada server';
    return Promise.reject(new Error(message));
  }
);

// --- ASSETS API ---
export const getAssets = async (params = {}) => {
  const res = await api.get('/assets', { params });
  return res.data;
};

export const getAssetById = async (id) => {
  const res = await api.get(`/assets/${id}`);
  return res.data;
};

export const getAssetQuickView = async (tag) => {
  const res = await api.get(`/assets/${encodeURIComponent(tag)}/quick-view`);
  return res.data;
};

export const createAsset = async (assetData) => {
  const res = await api.post('/assets', assetData);
  return res.data;
};

export const updateAsset = async (id, assetData) => {
  const res = await api.put(`/assets/${id}`, assetData);
  return res.data;
};

export const deleteAsset = async (id, loggedBy = 'System Admin') => {
  const res = await api.delete(`/assets/${id}`, { data: { logged_by: loggedBy } });
  return res.data;
};

export const getAssetLabel = async (id) => {
  const res = await api.get(`/assets/${id}/label`);
  return res.data;
};

export const bulkImportAssets = async (items) => {
  const res = await api.post('/assets/bulk-import', { items });
  return res.data;
};

// --- ASSIGNMENTS (CHECKOUT / CHECKIN) API ---
export const getAssignments = async (params = {}) => {
  const res = await api.get('/assignments', { params });
  return res.data;
};

export const checkoutAsset = async (payload) => {
  const res = await api.post('/assignments/checkout', payload);
  return res.data;
};

export const checkinAsset = async (id, payload) => {
  const res = await api.put(`/assignments/${id}/checkin`, payload);
  return res.data;
};

// --- MAINTENANCE API ---
export const getMaintenanceLogs = async (params = {}) => {
  const res = await api.get('/maintenance', { params });
  return res.data;
};

export const createMaintenanceLog = async (payload) => {
  const res = await api.post('/maintenance', payload);
  return res.data;
};

export const completeMaintenanceLog = async (id, payload) => {
  const res = await api.put(`/maintenance/${id}/complete`, payload);
  return res.data;
};

// --- REPORTS & FINANCIAL DEPRECIATION API ---
export const getDepreciationReport = async () => {
  const res = await api.get('/reports/depreciation');
  return res.data;
};

export const getDashboardSummary = async () => {
  const res = await api.get('/reports/summary');
  return res.data;
};

// --- CATEGORIES & LOCATIONS ---
export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const createCategory = async (payload) => {
  const res = await api.post('/categories', payload);
  return res.data;
};

export const getLocations = async () => {
  const res = await api.get('/locations');
  return res.data;
};

export const createLocation = async (payload) => {
  const res = await api.post('/locations', payload);
  return res.data;
};

// --- AUDIT TRAIL API ---
export const getAuditLogs = async (params = {}) => {
  const res = await api.get('/audit-logs', { params });
  return res.data;
};

// --- HEALTH & SEED ---
export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const triggerSeed = async () => {
  const res = await api.post('/seed');
  return res.data;
};

// --- FILE UPLOAD ---
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export default api;

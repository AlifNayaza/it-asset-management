// File: frontend/src/services/api.js
import axios from 'axios';
import * as mock from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan pada server';
    return Promise.reject(new Error(message));
  }
);

// --- DEMO MODE STATE ---
let demoModeActive =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && (
    window.__DEMO_MODE__ === true ||
    localStorage.getItem('it_asset_force_demo_mode') === 'true' ||
    (!import.meta.env.VITE_API_URL &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1')
  ));

export const isDemoActive = () => demoModeActive;

export const activateDemoMode = () => {
  demoModeActive = true;
  if (typeof window !== 'undefined') {
    window.__DEMO_MODE__ = true;
    localStorage.setItem('it_asset_force_demo_mode', 'true');
  }
};

export const resetDemoData = () => {
  mock.resetMockStorage();
};

// Seamless runner: calls real backend; if server unreachable or in demo mode, falls back to browser mock
const executeWithFallback = async (realCall, mockCall) => {
  if (demoModeActive) {
    return await mockCall();
  }
  try {
    return await realCall();
  } catch (err) {
    const isNetworkError =
      !err.response ||
      err.code === 'ERR_NETWORK' ||
      err.message?.includes('Network Error') ||
      err.message?.includes('timeout');

    if (isNetworkError) {
      console.warn('Backend server offline. Automatically switched to interactive Demo Mode.', err.message);
      activateDemoMode();
      return await mockCall();
    }
    throw err;
  }
};

// --- ASSETS API ---
export const getAssets = async (params = {}) => {
  return executeWithFallback(
    async () => (await api.get('/assets', { params })).data,
    async () => await mock.mockGetAssets(params)
  );
};

export const getAssetById = async (id) => {
  return executeWithFallback(
    async () => (await api.get(`/assets/${id}`)).data,
    async () => await mock.mockGetAssetById(id)
  );
};

export const getAssetQuickView = async (tag) => {
  return executeWithFallback(
    async () => (await api.get(`/assets/${encodeURIComponent(tag)}/quick-view`)).data,
    async () => await mock.mockGetAssetQuickView(tag)
  );
};

export const createAsset = async (assetData) => {
  return executeWithFallback(
    async () => (await api.post('/assets', assetData)).data,
    async () => await mock.mockCreateAsset(assetData)
  );
};

export const updateAsset = async (id, assetData) => {
  return executeWithFallback(
    async () => (await api.put(`/assets/${id}`, assetData)).data,
    async () => await mock.mockUpdateAsset(id, assetData)
  );
};

export const deleteAsset = async (id, loggedBy = 'System Admin') => {
  return executeWithFallback(
    async () => (await api.delete(`/assets/${id}`, { data: { logged_by: loggedBy } })).data,
    async () => await mock.mockDeleteAsset(id, loggedBy)
  );
};

export const getAssetLabel = async (id) => {
  return executeWithFallback(
    async () => (await api.get(`/assets/${id}/label`)).data,
    async () => await mock.mockGetAssetLabel(id)
  );
};

export const bulkImportAssets = async (items) => {
  return executeWithFallback(
    async () => (await api.post('/assets/bulk-import', { items })).data,
    async () => await mock.mockBulkImportAssets(items)
  );
};

// --- ASSIGNMENTS (CHECKOUT / CHECKIN) API ---
export const getAssignments = async (params = {}) => {
  return executeWithFallback(
    async () => (await api.get('/assignments', { params })).data,
    async () => await mock.mockGetAssignments(params)
  );
};

export const checkoutAsset = async (payload) => {
  return executeWithFallback(
    async () => (await api.post('/assignments/checkout', payload)).data,
    async () => await mock.mockCheckoutAsset(payload)
  );
};

export const checkinAsset = async (id, payload = {}) => {
  return executeWithFallback(
    async () => (await api.put(`/assignments/${id}/checkin`, payload)).data,
    async () => await mock.mockCheckinAsset({ asset_id: id, ...payload })
  );
};

// --- MAINTENANCE API ---
export const getMaintenanceLogs = async (params = {}) => {
  return executeWithFallback(
    async () => (await api.get('/maintenance', { params })).data,
    async () => await mock.mockGetMaintenanceList(params)
  );
};

export const createMaintenanceLog = async (payload) => {
  return executeWithFallback(
    async () => (await api.post('/maintenance', payload)).data,
    async () => await mock.mockCreateMaintenance(payload)
  );
};

export const completeMaintenanceLog = async (id, payload = {}) => {
  return executeWithFallback(
    async () => (await api.put(`/maintenance/${id}/complete`, payload)).data,
    async () => await mock.mockCompleteMaintenance(id, payload)
  );
};

// --- REPORTS & FINANCIAL DEPRECIATION API ---
export const getDepreciationReport = async () => {
  return executeWithFallback(
    async () => (await api.get('/reports/depreciation')).data,
    async () => await mock.mockGetDepreciationReport()
  );
};

export const getDashboardSummary = async () => {
  return executeWithFallback(
    async () => (await api.get('/reports/summary')).data,
    async () => await mock.mockGetDashboardSummary()
  );
};

// --- CATEGORIES & LOCATIONS ---
export const getCategories = async () => {
  return executeWithFallback(
    async () => (await api.get('/categories')).data,
    async () => await mock.mockGetCategories()
  );
};

export const createCategory = async (payload) => {
  return executeWithFallback(
    async () => (await api.post('/categories', payload)).data,
    async () => await mock.mockCreateCategory(payload)
  );
};

export const getLocations = async () => {
  return executeWithFallback(
    async () => (await api.get('/locations')).data,
    async () => await mock.mockGetLocations()
  );
};

export const createLocation = async (payload) => {
  return executeWithFallback(
    async () => (await api.post('/locations', payload)).data,
    async () => await mock.mockCreateLocation(payload)
  );
};

// --- AUDIT TRAIL API ---
export const getAuditLogs = async (params = {}) => {
  return executeWithFallback(
    async () => (await api.get('/audit-logs', { params })).data,
    async () => await mock.mockGetAuditLogs()
  );
};

// --- HEALTH & SEED ---
export const getHealth = async () => {
  return executeWithFallback(
    async () => (await api.get('/health')).data,
    async () => ({ success: true, status: 'ok', mode: 'demo' })
  );
};

export const triggerSeed = async () => {
  return executeWithFallback(
    async () => (await api.post('/seed')).data,
    async () => {
      mock.resetMockStorage();
      return { success: true, message: 'Data demo berhasil di-reset ke data awal' };
    }
  );
};

// --- FILE UPLOAD ---
export const uploadFile = async (file) => {
  return executeWithFallback(
    async () => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    async () => await mock.mockUploadFile(file)
  );
};

export default api;

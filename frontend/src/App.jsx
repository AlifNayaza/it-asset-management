// File: frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QRScannerModal from './components/QRScannerModal';
import QRPrintModal from './components/QRPrintModal';
import AssetDetailModal from './components/AssetDetailModal';
import AddAssetModal from './components/AddAssetModal';
import EditAssetModal from './components/EditAssetModal';
import ManageMasterModal from './components/ManageMasterModal';
import { ToastProvider, useToast } from './components/Toast';

// Pages
import Dashboard from './views/pages/Dashboard';
import AssetList from './views/pages/AssetList';
import HandoverPage from './views/pages/HandoverPage';
import MaintenanceLogPage from './views/pages/MaintenanceLogPage';
import DepreciationReportPage from './views/pages/DepreciationReportPage';
import AuditLogPage from './views/pages/AuditLogPage';

import { getHealth } from './services/api';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [health, setHealth] = useState(null);

  // Poll health status regularly
  const checkHealthStatus = async () => {
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (e) {
      setHealth({ postgres_connected: false, status: 'offline' });
    }
  };

  useEffect(() => {
    checkHealthStatus();
    const interval = setInterval(checkHealthStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Modal States
  const [scannerOpen, setScannerOpen] = useState(false);
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [printAsset, setPrintAsset] = useState(null);
  const [editingAssetTarget, setEditingAssetTarget] = useState(null);
  const [showMasterModal, setShowMasterModal] = useState(false);

  // Cross-page state transfers
  const [checkoutAssetTarget, setCheckoutAssetTarget] = useState(null);
  const [checkinAssetTarget, setCheckinAssetTarget] = useState(null);
  const [maintenanceAssetTarget, setMaintenanceAssetTarget] = useState(null);

  // Global Keyboard Shortcuts (Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K -> Focus / Switch to Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
      // Escape -> Close modals
      if (e.key === 'Escape') {
        setScannerOpen(false);
        setAddAssetOpen(false);
        setSelectedAssetId(null);
        setPrintAsset(null);
        setEditingAssetTarget(null);
        setShowMasterModal(false);
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickCheckout = (asset) => {
    setSelectedAssetId(null);
    setScannerOpen(false);
    setCheckoutAssetTarget(asset);
    setCheckinAssetTarget(null);
    setActiveTab('handover');
  };

  const handleQuickCheckin = (asset) => {
    setSelectedAssetId(null);
    setScannerOpen(false);
    setCheckinAssetTarget(asset);
    setCheckoutAssetTarget(null);
    setActiveTab('handover');
  };

  const handleQuickMaintenance = (asset) => {
    setSelectedAssetId(null);
    setScannerOpen(false);
    setMaintenanceAssetTarget(asset);
    setActiveTab('maintenance');
  };

  const handleOpenPrintLabel = (asset) => {
    setSelectedAssetId(null);
    setScannerOpen(false);
    setPrintAsset(asset);
  };

  const handleOpenEditAsset = (asset) => {
    setSelectedAssetId(null);
    setPrintAsset(null);
    setEditingAssetTarget(asset);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* Top Header Navbar */}
      <Navbar
        health={health}
        onRefreshHealth={checkHealthStatus}
        onOpenScanner={() => {
          setSelectedAssetId(null);
          setPrintAsset(null);
          setScannerOpen(true);
        }}
        onOpenAddAsset={() => {
          setSelectedAssetId(null);
          setPrintAsset(null);
          setAddAssetOpen(true);
        }}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Single Unified Sidebar (Desktop Rail & Mobile/Split Drawer) */}
        <Sidebar
          health={health}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddAsset={() => {
            setSelectedAssetId(null);
            setPrintAsset(null);
            setAddAssetOpen(true);
          }}
          onOpenScanner={() => {
            setSelectedAssetId(null);
            setPrintAsset(null);
            setScannerOpen(true);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-12 bg-slate-50/50 min-h-0">
          <div className="max-w-7xl mx-auto space-y-6">

            {activeTab === 'dashboard' && (
              <Dashboard
                onOpenScanner={() => {
                  setSelectedAssetId(null);
                  setPrintAsset(null);
                  setScannerOpen(true);
                }}
                onOpenAddAsset={() => {
                  setSelectedAssetId(null);
                  setPrintAsset(null);
                  setAddAssetOpen(true);
                }}
                onSelectAsset={(id) => {
                  setPrintAsset(null);
                  setSelectedAssetId(id);
                }}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'assets' && (
              <AssetList
                onSelectAsset={(id) => {
                  setPrintAsset(null);
                  setSelectedAssetId(id);
                }}
                onPrintLabel={handleOpenPrintLabel}
                onOpenAddAsset={() => setAddAssetOpen(true)}
                onOpenScanner={() => setScannerOpen(true)}
                onCheckout={handleQuickCheckout}
                onCheckin={handleQuickCheckin}
                onMaintenance={handleQuickMaintenance}
              />
            )}

            {activeTab === 'handover' && (
              <HandoverPage
                initialCheckoutAsset={checkoutAssetTarget}
                initialCheckinAsset={checkinAssetTarget}
                onClearInitial={() => {
                  setCheckoutAssetTarget(null);
                  setCheckinAssetTarget(null);
                }}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceLogPage
                initialAsset={maintenanceAssetTarget}
                onClearInitial={() => setMaintenanceAssetTarget(null)}
              />
            )}

            {activeTab === 'depreciation' && (
              <DepreciationReportPage />
            )}

            {activeTab === 'audit' && (
              <AuditLogPage />
            )}
          </div>
        </main>
      </div>

      {/* Modals - Mutually Exclusive */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSelectAsset={(id) => {
          setScannerOpen(false);
          setSelectedAssetId(id);
        }}
        onQuickCheckout={handleQuickCheckout}
        onQuickCheckin={handleQuickCheckin}
      />

      <QRPrintModal
        isOpen={!!printAsset}
        asset={printAsset}
        onClose={() => setPrintAsset(null)}
      />

      <AssetDetailModal
        isOpen={!!selectedAssetId && !printAsset}
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
        onPrintLabel={handleOpenPrintLabel}
        onCheckout={handleQuickCheckout}
        onCheckin={handleQuickCheckin}
        onMaintenance={handleQuickMaintenance}
        onEdit={handleOpenEditAsset}
      />

      <AddAssetModal
        isOpen={addAssetOpen}
        onClose={() => setAddAssetOpen(false)}
        onSuccess={() => {
          setActiveTab('assets');
        }}
        onOpenManageMaster={() => setShowMasterModal(true)}
      />

      {/* Global Edit Asset Modal */}
      {editingAssetTarget && (
        <EditAssetModal
          isOpen={!!editingAssetTarget}
          asset={editingAssetTarget}
          onClose={() => setEditingAssetTarget(null)}
          onSuccess={() => {
            setEditingAssetTarget(null);
            // Reopen detail or stay on active tab
            if (activeTab === 'assets') {
              // Trigger reload if needed
            }
          }}
        />
      )}

      {/* Global Manage Master Modal */}
      {showMasterModal && (
        <ManageMasterModal
          isOpen={showMasterModal}
          onClose={() => setShowMasterModal(false)}
          onMasterUpdated={() => {
            // master updated
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}




import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Truck, 
  Users, 
  Package, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShoppingCart,
  ClipboardList,
  Box,
  Settings as SettingsIcon,
  LogOut,
  BookOpen,
  ArrowLeft,
  Wallet,
  Code
} from 'lucide-react';
import { storage } from './services/storage';

// Pages
import Dashboard from './pages/Dashboard';
import InvoiceGenerator from './pages/InvoiceGenerator';
import EWayBillGenerator from './pages/EWayBillGenerator';
import Masters from './pages/Masters';
import InvoiceList from './pages/InvoiceList';
import PurchaseEntry from './pages/PurchaseEntry';
import PurchaseList from './pages/PurchaseList';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Reports from './pages/Reports';
import VoucherEntry from './pages/VoucherEntry';
import Ledger from './pages/Ledger';
import QuotationGenerator from './pages/QuotationGenerator';
import QuotationList from './pages/QuotationList';
import TermsAndConditions from './pages/TermsAndConditions';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false); // New State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to Dark Mode
  const [editId, setEditId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [firmName, setFirmName] = useState("GST & INVOICE MANAGER");

  useEffect(() => {
    // Check Auth
    if (storage.isAuthenticated()) {
      const user = storage.getCurrentUsername();
      setIsAuthenticated(true);
      setCurrentUser(user);
      
      // Check Terms Acceptance
      if (storage.hasAcceptedTerms(user)) {
          setIsTermsAccepted(true);
      } else {
          setIsTermsAccepted(false);
      }
    }

    // Check Theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load Firm Name
    const details = storage.getFirmDetails();
    if(details && details.name) {
        setFirmName(details.name);
    }
  }, [darkMode]);

  const handleLogin = () => {
    const user = storage.getCurrentUsername();
    setIsAuthenticated(true);
    setCurrentUser(user);
    // Check Terms on Login
    if (storage.hasAcceptedTerms(user)) {
        setIsTermsAccepted(true);
    } else {
        setIsTermsAccepted(false);
    }
  };

  const handleAcceptTerms = () => {
      storage.acceptTerms(currentUser);
      setIsTermsAccepted(true);
  };

  const handleLogout = () => {
    storage.logout();
    setIsAuthenticated(false);
    setIsTermsAccepted(false);
    setActiveTab('dashboard');
    setHistory([]);
  };

  const changeTab = (tab: string, id: string | null = null) => {
    setHistory(prev => [...prev, activeTab]);
    setActiveTab(tab);
    setEditId(id);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleBack = () => {
      setHistory(prev => {
          const newHistory = [...prev];
          const lastTab = newHistory.pop();
          if(lastTab) {
              setActiveTab(lastTab);
              setEditId(null); // Reset edit state on back
          }
          return newHistory;
      });
  };

  // Callback for Settings page to refresh app state without reload
  const handleSettingsComplete = () => {
      const details = storage.getFirmDetails();
      if(details && details.name) {
          setFirmName(details.name);
      }
      setActiveTab('dashboard');
      setHistory([]); // Reset history for a fresh start
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  // 1. Login Screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Terms & Conditions Screen (Blocks Dashboard until accepted)
  if (!isTermsAccepted) {
      return <TermsAndConditions onAccept={handleAcceptTerms} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard changeTab={changeTab} />;
      case 'create-invoice': return <InvoiceGenerator onSave={() => changeTab('invoice-list')} editId={editId} />;
      case 'invoice-list': return <InvoiceList onEdit={(id) => changeTab('create-invoice', id)} />;
      case 'create-quotation': return <QuotationGenerator onSave={() => changeTab('quotation-list')} editId={editId} />;
      case 'quotation-list': return <QuotationList onEdit={(id) => changeTab('create-quotation', id)} />;
      case 'eway-bill': return <EWayBillGenerator />;
      case 'customers': return <Masters type="customers" />;
      case 'suppliers': return <Masters type="suppliers" />;
      case 'products': return <Masters type="products" />;
      case 'purchase-entry': return <PurchaseEntry onSave={() => changeTab('purchase-list')} editId={editId} />;
      case 'purchase-list': return <PurchaseList onEdit={(id) => changeTab('purchase-entry', id)} />;
      case 'inventory': return <Inventory />;
      case 'voucher-entry': return <VoucherEntry onSave={() => changeTab('ledger')} />;
      case 'ledger': return <Ledger />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings onComplete={handleSettingsComplete} />;
      default: return <Dashboard changeTab={changeTab} />;
    }
  };

  // Nav Item Component
  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => changeTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-primary-600/20 text-primary-500 border-r-2 border-primary-500 rounded-r-none' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const NavGroup = ({ title, children }: any) => (
      <div className="mb-4">
          <h3 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
          <div className="space-y-1">
              {children}
          </div>
      </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white truncate max-w-[140px]" title={firmName}>
                {firmName}
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Overview" />
          
          <div className="my-4 border-t border-white/10"></div>

          <NavGroup title="Sales">
            <NavItem id="create-invoice" icon={FileText} label="New Invoice" />
            <NavItem id="invoice-list" icon={ClipboardList} label="Invoice History" />
            <NavItem id="create-quotation" icon={FileText} label="New Quotation" />
            <NavItem id="quotation-list" icon={ClipboardList} label="Quotation History" />
            <NavItem id="eway-bill" icon={Truck} label="E-Way Bill" />
            <NavItem id="customers" icon={Users} label="Customers" />
          </NavGroup>

          <NavGroup title="Purchase">
             <NavItem id="purchase-entry" icon={ShoppingCart} label="Purchase Entry" />
             <NavItem id="purchase-list" icon={ClipboardList} label="Purchase History" />
             <NavItem id="suppliers" icon={Users} label="Suppliers" />
          </NavGroup>

          <NavGroup title="Accounts">
             <NavItem id="voucher-entry" icon={Wallet} label="Voucher Entry" />
             <NavItem id="ledger" icon={BookOpen} label="Ledger Book" />
          </NavGroup>

          <NavGroup title="Inventory">
             <NavItem id="inventory" icon={Box} label="Stock Status" />
             <NavItem id="products" icon={Package} label="Product Master" />
          </NavGroup>

          <div className="my-4 border-t border-white/10"></div>

          <NavItem id="reports" icon={BookOpen} label="Reports" />
          <NavItem id="settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                        {currentUser.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{currentUser}</p>
                        <p className="text-xs text-slate-400">Admin</p>
                    </div>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
            >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-300 mr-4">
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Back Button Logic - Only show if not on dashboard */}
            {activeTab !== 'dashboard' && history.length > 0 && (
                <button 
                    onClick={handleBack} 
                    className="mr-4 p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
                    title="Go Back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}

            <h2 className="text-lg font-semibold text-slate-200 capitalize hidden sm:block">
                {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1">
             {renderContent()}
          </div>
          
          {/* Professional Footer */}
          <footer className="mt-8 pt-6 pb-2 text-center border-t border-white/10">
              <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                      <Code className="w-4 h-4 text-primary-500" />
                      <span>Developed by <span className="text-slate-700 dark:text-slate-200 font-semibold hover:text-primary-500 transition-colors">Binod Kumar Sahoo</span></span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      Mob-9658618291
                  </p>
              </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;

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
  Database,
  ShoppingCart,
  ClipboardList,
  Box,
  Settings as SettingsIcon,
  LogOut,
  BookOpen
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [firmName, setFirmName] = useState('GST & INVOICE MANAGER');

  useEffect(() => {
    // Check auth status
    const isAuth = storage.isAuthenticated();
    setIsAuthenticated(isAuth);
    if(isAuth) {
        setCurrentUser(storage.getCurrentUsername());
    }
    
    // Load Firm Name
    const details = storage.getFirmDetails();
    if(details && details.name && details.name !== "Your Firm Name") {
        setFirmName(details.name);
    } else {
        setFirmName('GST & INVOICE MANAGER');
    }

    setIsLoading(false);

    // Force dark mode initially
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLoginSuccess = () => {
      setIsAuthenticated(true);
      setCurrentUser(storage.getCurrentUsername());
      // Refresh firm name on login in case it changed
      const details = storage.getFirmDetails();
      if(details && details.name && details.name !== "Your Firm Name") {
          setFirmName(details.name);
      } else {
          setFirmName('GST & INVOICE MANAGER');
      }
  };

  const handleLogout = () => {
      storage.logout();
      setIsAuthenticated(false);
      setCurrentUser('');
  };

  const handleEditInvoice = (id: string) => {
      setEditId(id);
      setActiveTab('create-invoice');
  };

  const handleEditPurchase = (id: string) => {
      setEditId(id);
      setActiveTab('purchase-entry');
  };

  // Function to handle completion of settings (Save -> Continue)
  const handleSettingsComplete = () => {
      // 1. Refresh Firm Name immediately from storage
      const details = storage.getFirmDetails();
      if(details && details.name && details.name !== "Your Firm Name") {
          setFirmName(details.name);
      }
      // 2. Switch to Dashboard
      setActiveTab('dashboard');
  };

  // Reset editId when switching to list or other tabs
  const changeTab = (tab: string) => {
      if(tab !== 'create-invoice' && tab !== 'purchase-entry') {
          setEditId(null);
      }
      setActiveTab(tab);
      if (window.innerWidth < 768) setSidebarOpen(false);
  }

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => changeTab(id)}
      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mb-1 ${
        activeTab === id
          ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 mr-3" />
      {label}
    </button>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 py-2 mt-4 mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </div>
  );

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;

  if (!isAuthenticated) {
      return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 shadow-2xl transform transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent truncate" title={firmName}>
            {firmName}
          </span>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          
          <SectionLabel label="Sales" />
          <NavItem id="create-invoice" icon={FileText} label="New Invoice" />
          <NavItem id="invoice-list" icon={ClipboardList} label="Invoice History" />
          <NavItem id="eway-bill" icon={Truck} label="E-Way Bill" />
          <NavItem id="customers" icon={Users} label="Customers" />

          <SectionLabel label="Purchase" />
          <NavItem id="purchase-entry" icon={ShoppingCart} label="Purchase Entry" />
          <NavItem id="purchase-list" icon={ClipboardList} label="Purchase History" />
          <NavItem id="suppliers" icon={Users} label="Suppliers" />

          <SectionLabel label="Inventory" />
          <NavItem id="inventory" icon={Box} label="Stock Status" />
          <NavItem id="products" icon={Package} label="Product Master" />
          <NavItem id="reports" icon={BookOpen} label="Daily Reports" />

          <SectionLabel label="System" />
          <NavItem id="settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20 space-y-2">
           <button 
             onClick={() => storage.backupData()}
             className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-primary-400 hover:bg-white/5 border border-white/10 rounded transition-colors"
           >
             <Database className="w-4 h-4 mr-2" /> Backup Data
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-black/40 backdrop-blur-xl border-b border-white/10 z-10">
          <button onClick={toggleSidebar} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
             <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold uppercase">
                {currentUser.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:block text-slate-200">{currentUser}</span>
              <button onClick={handleLogout} title="Logout" className="ml-2 text-slate-400 hover:text-red-400">
                 <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 text-slate-100">
          {activeTab === 'dashboard' && <Dashboard changeTab={changeTab} />}
          
          {/* Sales */}
          {activeTab === 'create-invoice' && <InvoiceGenerator onSave={() => changeTab('invoice-list')} editId={editId} />}
          {activeTab === 'invoice-list' && (
              <InvoiceList /> 
          )}
          {activeTab === 'eway-bill' && <EWayBillGenerator />}
          {activeTab === 'customers' && <Masters type="customers" />}
          
          {/* Purchase */}
          {activeTab === 'purchase-entry' && <PurchaseEntry onSave={() => changeTab('purchase-list')} editId={editId} />}
          {activeTab === 'purchase-list' && <PurchaseList />}
          {activeTab === 'suppliers' && <Masters type="suppliers" />}

          {/* Inventory */}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'products' && <Masters type="products" />}
          {activeTab === 'reports' && <Reports />}
          
          {/* System */}
          {activeTab === 'settings' && <Settings onComplete={handleSettingsComplete} />}
        </main>
      </div>
    </div>
  );
}

export default App;


import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Users, AlertCircle, ShoppingCart, Settings, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';
import { FIRM_DETAILS as DEFAULT_FIRM_DETAILS } from '../constants';
import { Invoice, FirmDetails } from '../types';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

interface DashboardProps {
    changeTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ changeTab }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [firmDetails, setFirmDetails] = useState<FirmDetails>(DEFAULT_FIRM_DETAILS);

  useEffect(() => {
    const inv = storage.getInvoices();
    const cust = storage.getCustomers();
    const prods = storage.getProducts();
    const firm = storage.getFirmDetails();

    if(firm) {
        setFirmDetails(firm);
    }
    
    setInvoices(inv);
    setCustomersCount(cust.length);
    setLowStockCount(prods.filter(p => (p.stock || 0) < 10).length);

    // Calculate monthly sales
    const currentMonth = new Date().getMonth();
    const total = inv
      .filter(i => new Date(i.date).getMonth() === currentMonth)
      .reduce((sum, i) => sum + i.grandTotal, 0);
    setMonthlySales(total);
  }, []);

  // Only show alert if the name is still the default placeholder.
  // We ignore GSTIN checks here so optional GSTIN doesn't trigger the alert.
  const isSetupRequired = firmDetails.name === "Your Firm Name";

  return (
    <div className="space-y-6">
      
      {/* Setup Alert for New Users */}
      {isSetupRequired && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/20 text-amber-500 rounded-lg">
                      <Settings className="w-6 h-6" />
                  </div>
                  <div>
                      <h2 className="text-lg font-bold text-amber-500 mb-1">Setup Your Business</h2>
                      <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                          It looks like you haven't configured your Firm Name yet. 
                          Please update your settings to generate professional invoices.
                      </p>
                  </div>
              </div>
              <button 
                onClick={() => changeTab('settings')}
                className="whitespace-nowrap flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                  Go to Settings <ArrowRight className="w-4 h-4 ml-2" />
              </button>
          </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">
            {isSetupRequired ? "Welcome! Let's get started." : `Welcome back to ${firmDetails.name}`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Invoices" 
          value={invoices.length} 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Monthly Sales" 
          value={`₹${monthlySales.toLocaleString('en-IN')}`} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Customers" 
          value={customersCount} 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockCount} 
          icon={AlertCircle} 
          color={lowStockCount > 0 ? "bg-red-500" : "bg-gray-400"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Invoices</h2>
            <button onClick={() => changeTab('invoice-list')} className="text-sm text-primary-600 hover:text-primary-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {invoices.slice(0, 5).map(inv => (
                  <tr key={inv.id} className="text-slate-700 dark:text-slate-300">
                    <td className="px-6 py-4 text-sm font-medium">{inv.invoiceNo}</td>
                    <td className="px-6 py-4 text-sm">{inv.date}</td>
                    <td className="px-6 py-4 text-sm">{inv.customerName}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">₹{inv.grandTotal.toLocaleString()}</td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No invoices generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => changeTab('create-invoice')} className="p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg flex flex-col items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/40 transition">
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">New Invoice</span>
                </button>
                 <button onClick={() => changeTab('purchase-entry')} className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg flex flex-col items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                    <ShoppingCart className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">Add Purchase</span>
                </button>
            </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Firm Details</h2>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="font-semibold text-slate-800 dark:text-white">{firmDetails.name}</p>
                <p className="mt-1">{firmDetails.address || "Address not set"}</p>
                </div>
                <div className="flex justify-between border-b dark:border-slate-700 py-2">
                <span>GSTIN:</span>
                <span className="font-medium">{firmDetails.gstin}</span>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

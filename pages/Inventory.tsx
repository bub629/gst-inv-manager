
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search } from 'lucide-react';
import { storage } from '../services/storage';
import { Product } from '../types';

const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setProducts(storage.getProducts());
    }, []);

    // Valuation based on Purchase Price (Cost)
    const totalValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.purchasePrice || 0)), 0);
    const lowStockItems = products.filter(p => (p.stock || 0) < 10);

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.hsnCode.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory Status</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        placeholder="Search Product..." 
                        className="pl-10 pr-4 py-2 border rounded-full w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Products</p>
                            <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">{products.length}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inventory Value (Cost Basis)</p>
                            <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">₹{totalValue.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                            <span className="font-bold">₹</span>
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Low Stock Items</p>
                            <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">{lowStockItems.length}</p>
                        </div>
                        <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-4 text-xs font-medium uppercase">Product Name</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase">HSN</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Avg Cost</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Selling Price</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Stock</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filtered.map(p => {
                            const stock = p.stock || 0;
                            const isLow = stock < 10;
                            return (
                                <tr key={p.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium">{p.name}</td>
                                    <td className="px-6 py-4 text-sm">{p.hsnCode}</td>
                                    <td className="px-6 py-4 text-right text-sm">₹{p.purchasePrice || 0}</td>
                                    <td className="px-6 py-4 text-right text-sm">₹{p.salePrice1 || p.price || 0}</td>
                                    <td className="px-6 py-4 text-right font-bold">
                                        <span className={isLow ? "text-red-500" : "text-green-600"}>{stock} {p.unit}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-slate-500">₹{(stock * (p.purchasePrice || 0)).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                         {filtered.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No products found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;

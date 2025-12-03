
import React, { useState, useEffect } from 'react';
import { Trash2, Search, Edit } from 'lucide-react';
import { storage } from '../services/storage';
import { PurchaseInvoice } from '../types';

interface PurchaseListProps {
    onEdit?: (id: string) => void;
}

const PurchaseList: React.FC<PurchaseListProps> = ({ onEdit }) => {
    const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setPurchases(storage.getPurchases());
    }, []);

    const handleDelete = (id: string) => {
        if(confirm("Deleting this purchase will reverse the stock (decrease quantity). Are you sure?")) {
            storage.deletePurchase(id);
            setPurchases(storage.getPurchases());
        }
    }

    const filtered = purchases.filter(p => 
        p.invoiceNo.toLowerCase().includes(search.toLowerCase()) || 
        p.supplierName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Purchase History</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        placeholder="Search Supplier or Invoice..." 
                        className="pl-10 pr-4 py-2 border rounded-full w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-4 text-xs font-medium uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase">Ref No</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase">Supplier</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Items</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Amount</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filtered.map(purchase => (
                            <tr key={purchase.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 text-sm">{purchase.date}</td>
                                <td className="px-6 py-4 font-medium text-sm">{purchase.invoiceNo}</td>
                                <td className="px-6 py-4 text-sm">{purchase.supplierName}</td>
                                <td className="px-6 py-4 text-right text-sm">{purchase.items.length}</td>
                                <td className="px-6 py-4 text-right font-semibold text-sm">₹{purchase.totalAmount.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {onEdit && (
                                        <button onClick={() => onEdit(purchase.id)} title="Edit Purchase" className="p-1 text-slate-500 hover:text-blue-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(purchase.id)} title="Delete" className="p-1 text-slate-500 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filtered.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No purchases recorded.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchaseList;

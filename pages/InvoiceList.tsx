import React, { useState, useEffect } from 'react';
import { Download, Trash2, Search, Eye } from 'lucide-react';
import { storage } from '../services/storage';
import { generateInvoicePDF } from '../services/pdfGenerator';
import { Invoice } from '../types';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setInvoices(storage.getInvoices());
    }, []);

    const handleDelete = (id: string) => {
        if(confirm("Are you sure you want to delete this invoice?")) {
            storage.deleteInvoice(id);
            setInvoices(storage.getInvoices());
        }
    }

    const filtered = invoices.filter(inv => 
        inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) || 
        inv.customerName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Invoice History</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        placeholder="Search Invoice or Customer..." 
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
                            <th className="px-6 py-4 text-xs font-medium uppercase">Invoice No</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Amount</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filtered.map(inv => (
                            <tr key={inv.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 text-sm">{inv.date}</td>
                                <td className="px-6 py-4 font-medium text-sm">{inv.invoiceNo}</td>
                                <td className="px-6 py-4 text-sm">{inv.customerName}</td>
                                <td className="px-6 py-4 text-right font-semibold text-sm">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Generated</span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => generateInvoicePDF(inv)} title="Download PDF" className="p-1 text-slate-500 hover:text-primary-600">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(inv.id)} title="Delete" className="p-1 text-slate-500 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filtered.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No invoices found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceList;
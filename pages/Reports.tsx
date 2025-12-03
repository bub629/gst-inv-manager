import React, { useState, useEffect } from 'react';
import { Download, Calendar, Search, FileText, ShoppingCart } from 'lucide-react';
import { storage } from '../services/storage';
import { Invoice, PurchaseInvoice } from '../types';
import { generateDailyRegisterPDF } from '../services/pdfGenerator';

interface DailySummary {
    date: string;
    salesCount: number;
    salesTotal: number;
    purchaseCount: number;
    purchaseTotal: number;
    invoices: Invoice[];
    purchases: PurchaseInvoice[];
}

const Reports = () => {
    const [summaries, setSummaries] = useState<DailySummary[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const invoices = storage.getInvoices();
        const purchases = storage.getPurchases();

        // Collect all unique dates
        const allDates = new Set([
            ...invoices.map(i => i.date),
            ...purchases.map(p => p.date)
        ]);

        const summaryData: DailySummary[] = [];

        allDates.forEach(date => {
            const dayInvoices = invoices.filter(i => i.date === date);
            const dayPurchases = purchases.filter(p => p.date === date);

            summaryData.push({
                date,
                salesCount: dayInvoices.length,
                salesTotal: dayInvoices.reduce((sum, i) => sum + i.grandTotal, 0),
                purchaseCount: dayPurchases.length,
                purchaseTotal: dayPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
                invoices: dayInvoices,
                purchases: dayPurchases
            });
        });

        // Sort by date descending
        summaryData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSummaries(summaryData);
    }, []);

    const filtered = summaries.filter(s => s.date.includes(searchTerm));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-primary-600" />
                    Daily Registers
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="month"
                        placeholder="Filter by Month..." 
                        className="pl-10 pr-4 py-2 border rounded-full w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-white text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filtered.map(summary => (
                    <div key={summary.date} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            
                            {/* Date Section */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{summary.date}</h3>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex-1 grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded border border-green-100 dark:border-green-900/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">SALES</span>
                                    </div>
                                    <p className="text-lg font-bold text-green-700 dark:text-green-300">₹{summary.salesTotal.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-green-600 dark:text-green-500">{summary.salesCount} Invoices</p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">PURCHASE</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">₹{summary.purchaseTotal.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-500">{summary.purchaseCount} Bills</p>
                                </div>
                            </div>

                            {/* Action */}
                            <button 
                                onClick={() => generateDailyRegisterPDF(summary.date, summary.invoices, summary.purchases)}
                                className="flex items-center px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm w-full md:w-auto justify-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Register
                            </button>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No transactions found for the selected period.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
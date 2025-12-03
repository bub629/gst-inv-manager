
import React, { useState, useEffect } from 'react';
import { Search, Download, BookOpen } from 'lucide-react';
import { storage } from '../services/storage';
import { Customer, Supplier, LedgerEntry } from '../types';
import { generateLedgerPDF } from '../services/pdfGenerator';

const Ledger = () => {
    const [viewType, setViewType] = useState<'Customer' | 'Supplier'>('Customer');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedPartyId, setSelectedPartyId] = useState('');
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    
    useEffect(() => {
        setCustomers(storage.getCustomers());
        setSuppliers(storage.getSuppliers());
    }, []);

    useEffect(() => {
        if(selectedPartyId) {
            const data = storage.getPartyLedger(selectedPartyId, viewType);
            setLedgerEntries(data);
        } else {
            setLedgerEntries([]);
        }
    }, [selectedPartyId, viewType]);

    const handleDownload = () => {
        if(!selectedPartyId) return;
        const partyName = viewType === 'Customer' 
            ? customers.find(c => c.id === selectedPartyId)?.name 
            : suppliers.find(s => s.id === selectedPartyId)?.name;
        
        if(partyName) {
            generateLedgerPDF(partyName, viewType, ledgerEntries);
        }
    };

    const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;
    const isDebit = finalBalance > 0; // For Customer: + is Debit (Receivable). For Supplier: + is Payable (Credit in storage logic)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-primary-600" />
                    Ledger Book (Khata)
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Type Selector */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Party Type</label>
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded">
                         <button
                            className={`flex-1 py-1 text-sm rounded transition-colors ${viewType === 'Customer' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                            onClick={() => { setViewType('Customer'); setSelectedPartyId(''); }}
                        >
                            Customer
                        </button>
                        <button
                            className={`flex-1 py-1 text-sm rounded transition-colors ${viewType === 'Supplier' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                            onClick={() => { setViewType('Supplier'); setSelectedPartyId(''); }}
                        >
                            Supplier
                        </button>
                    </div>
                </div>

                {/* Party Selector */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Select Party</label>
                    <select 
                        value={selectedPartyId}
                        onChange={(e) => setSelectedPartyId(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900"
                    >
                        <option value="">-- Select --</option>
                        {viewType === 'Customer' 
                            ? customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            : suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                        }
                    </select>
                </div>
            </div>

            {selectedPartyId && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div>
                             <h2 className="text-lg font-bold text-slate-800 dark:text-white">Statement of Account</h2>
                             <p className="text-sm text-slate-500">
                                 Current Balance: 
                                 <span className={`font-bold ml-2 ${finalBalance < 0 ? 'text-green-500' : 'text-red-500'}`}>
                                     ₹{Math.abs(finalBalance).toLocaleString()} 
                                     {viewType === 'Customer' 
                                        ? (finalBalance > 0 ? ' Dr (Receivable)' : ' Cr (Advance)') 
                                        : (finalBalance > 0 ? ' Cr (Payable)' : ' Dr (Advance Paid)')
                                     }
                                 </span>
                             </p>
                        </div>
                        <button 
                            onClick={handleDownload}
                            className="flex items-center px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded hover:bg-slate-900"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium uppercase">Date</th>
                                    <th className="px-6 py-3 text-xs font-medium uppercase">Ref No</th>
                                    <th className="px-6 py-3 text-xs font-medium uppercase">Type</th>
                                    <th className="px-6 py-3 text-xs font-medium uppercase">Description</th>
                                    <th className="px-6 py-3 text-xs font-medium uppercase text-right">Debit</th>
                                    <th className="px-6 py-3 text-xs font-medium uppercase text-right">Credit</th>
                                    <th className="px-6 py-3 text-xs font-medium uppercase text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {ledgerEntries.map((entry, idx) => (
                                    <tr key={idx} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">{entry.date}</td>
                                        <td className="px-6 py-4 text-sm">{entry.refNo}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                entry.type.includes('Invoice') || entry.type.includes('Bill') 
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                {entry.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{entry.description}</td>
                                        <td className="px-6 py-4 text-right text-sm">{entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}</td>
                                        <td className="px-6 py-4 text-right text-sm">{entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-sm">
                                            ₹{Math.abs(entry.balance).toLocaleString()} {entry.balance < 0 ? 'Cr' : 'Dr'}
                                        </td>
                                    </tr>
                                ))}
                                {ledgerEntries.length === 0 && (
                                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">No transactions found for this party.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledger;

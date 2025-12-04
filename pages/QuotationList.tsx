import React, { useState, useEffect } from 'react';
import { Download, Trash2, Search, Edit, FileText } from 'lucide-react';
import { storage } from '../services/storage';
import { generateQuotationPDF } from '../services/pdfGenerator';
import { Quotation } from '../types';

interface Props {
    onEdit?: (id: string) => void;
}

const QuotationList: React.FC<Props> = ({ onEdit }) => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setQuotations(storage.getQuotations());
    }, []);

    const handleDelete = (id: string) => {
        if(confirm("Are you sure you want to delete this quotation?")) {
            storage.deleteQuotation(id);
            setQuotations(storage.getQuotations());
        }
    }

    const filtered = quotations.filter(q => 
        q.quotationNo.toLowerCase().includes(search.toLowerCase()) || 
        q.customerName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-blue-600" />
                    Quotation History
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        placeholder="Search..." 
                        className="pl-10 pr-4 py-2 border rounded-full w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-white text-slate-900"
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
                            <th className="px-6 py-4 text-xs font-medium uppercase">Quotation No</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Amount</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filtered.map(q => (
                            <tr key={q.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 text-sm">{q.date}</td>
                                <td className="px-6 py-4 font-medium text-sm">{q.quotationNo}</td>
                                <td className="px-6 py-4 text-sm">{q.customerName}</td>
                                <td className="px-6 py-4 text-right font-semibold text-sm">₹{q.grandTotal.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => generateQuotationPDF(q)} title="Download PDF" className="p-1 text-slate-500 hover:text-blue-600">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    {onEdit && (
                                        <button onClick={() => onEdit(q.id)} title="Edit" className="p-1 text-slate-500 hover:text-blue-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(q.id)} title="Delete" className="p-1 text-slate-500 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filtered.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No quotations found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotationList;
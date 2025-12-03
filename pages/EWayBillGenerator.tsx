import React, { useState } from 'react';
import { Truck, Download } from 'lucide-react';
import { FIRM_DETAILS } from '../constants';
import { EWayBill } from '../types';
import { generateEWayBillPDF } from '../services/pdfGenerator';

const EWayBillGenerator = () => {
    const [bill, setBill] = useState<Partial<EWayBill>>({
        transactionType: 'Supply',
        documentType: 'Invoice',
        mode: 'Road',
        fromGstin: FIRM_DETAILS.gstin,
        documentDate: new Date().toISOString().split('T')[0]
    });

    const handleChange = (field: string, value: any) => {
        setBill({ ...bill, [field]: value });
    };

    const handleGenerate = () => {
        if(!bill.toGstin || !bill.documentNo) {
            alert("Please fill mandatory fields");
            return;
        }
        // Save to storage (mocked here, in real app add to storage service)
        const newBill = { ...bill, id: Date.now().toString() } as EWayBill;
        generateEWayBillPDF(newBill, FIRM_DETAILS);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center">
                <Truck className="w-6 h-6 mr-3 text-primary-600" />
                Generate E-Way Bill
            </h1>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm space-y-6">
                
                {/* Part A */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200 border-b pb-2">Part A: Transaction Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Transaction Type</label>
                             <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.transactionType} onChange={(e) => handleChange('transactionType', e.target.value)}>
                                 <option>Supply</option><option>Export</option><option>Job Work</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Document Type</label>
                             <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.documentType} onChange={(e) => handleChange('documentType', e.target.value)}>
                                 <option>Invoice</option><option>Bill of Supply</option><option>Challan</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Document No</label>
                             <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.documentNo || ''} onChange={(e) => handleChange('documentNo', e.target.value)} />
                        </div>
                         <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">To GSTIN</label>
                             <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Recipient GSTIN" value={bill.toGstin || ''} onChange={(e) => handleChange('toGstin', e.target.value)} />
                        </div>
                         <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Pincode (To)</label>
                             <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                </div>

                {/* Part B */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200 border-b pb-2">Part B: Transporter Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Mode</label>
                             <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.mode} onChange={(e) => handleChange('mode', e.target.value)}>
                                 <option>Road</option><option>Rail</option><option>Air</option><option>Ship</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Vehicle No</label>
                             <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.vehicleNo || ''} onChange={(e) => handleChange('vehicleNo', e.target.value)} />
                        </div>
                        <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Approx Distance (km)</label>
                             <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.approxDistance || ''} onChange={(e) => handleChange('approxDistance', Number(e.target.value))} />
                        </div>
                         <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Transporter Name</label>
                             <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.transporterName || ''} onChange={(e) => handleChange('transporterName', e.target.value)} />
                        </div>
                        <div>
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Transporter ID</label>
                             <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={bill.transporterId || ''} onChange={(e) => handleChange('transporterId', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleGenerate} className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold shadow-lg">
                        <Download className="w-5 h-5 mr-2" />
                        Generate & Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EWayBillGenerator;
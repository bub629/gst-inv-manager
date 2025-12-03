
import React, { useState, useEffect } from 'react';
import { Save, ArrowRightLeft } from 'lucide-react';
import { storage } from '../services/storage';
import { Customer, Supplier, Voucher } from '../types';

interface Props {
    onSave: () => void;
}

const VoucherEntry: React.FC<Props> = ({ onSave }) => {
    const [voucherType, setVoucherType] = useState<'Receipt' | 'Payment'>('Receipt');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    
    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [partyId, setPartyId] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [mode, setMode] = useState<'Cash' | 'Bank' | 'UPI' | 'Cheque'>('Cash');
    const [referenceNo, setReferenceNo] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        setCustomers(storage.getCustomers());
        setSuppliers(storage.getSuppliers());
    }, []);

    const handleSubmit = () => {
        if (!partyId || amount <= 0) {
            alert("Please select a party and enter a valid amount.");
            return;
        }

        let partyName = '';
        if (voucherType === 'Receipt') {
            const c = customers.find(x => x.id === partyId);
            partyName = c ? c.name : 'Unknown';
        } else {
            const s = suppliers.find(x => x.id === partyId);
            partyName = s ? s.name : 'Unknown';
        }

        const voucher: Voucher = {
            id: Date.now().toString(),
            date,
            type: voucherType,
            partyId,
            partyName,
            partyType: voucherType === 'Receipt' ? 'Customer' : 'Supplier',
            amount: Number(amount),
            mode,
            referenceNo,
            notes
        };

        storage.saveVoucher(voucher);
        onSave();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center">
                <ArrowRightLeft className="w-6 h-6 mr-3 text-primary-600" />
                Voucher Entry
            </h1>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                
                {/* Toggle Type */}
                <div className="flex mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                            voucherType === 'Receipt' 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        onClick={() => { setVoucherType('Receipt'); setPartyId(''); }}
                    >
                        Receipt (Money In)
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                            voucherType === 'Payment' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        onClick={() => { setVoucherType('Payment'); setPartyId(''); }}
                    >
                        Payment (Money Out)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                            {voucherType === 'Receipt' ? 'Select Customer' : 'Select Supplier'}
                        </label>
                        <select 
                            value={partyId} 
                            onChange={(e) => setPartyId(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900"
                        >
                            <option value="">-- Select Party --</option>
                            {voucherType === 'Receipt' 
                                ? customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                : suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900"
                        />
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Amount</label>
                         <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(Number(e.target.value))} 
                            placeholder="0.00"
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900 font-bold"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Payment Mode</label>
                         <select 
                            value={mode} 
                            onChange={(e) => setMode(e.target.value as any)} 
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900"
                        >
                            <option>Cash</option>
                            <option>Bank</option>
                            <option>UPI</option>
                            <option>Cheque</option>
                         </select>
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ref No (Optional)</label>
                         <input 
                            type="text" 
                            value={referenceNo} 
                            onChange={(e) => setReferenceNo(e.target.value)} 
                            placeholder="Cheque No / UPI ID"
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900"
                         />
                    </div>

                     <div className="md:col-span-2">
                         <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                         <input 
                            type="text" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            placeholder="Narration..."
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900"
                         />
                    </div>
                </div>

                <div className="mt-8">
                    <button 
                        onClick={handleSubmit}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-lg"
                    >
                        <Save className="w-4 h-4 inline mr-2" /> Save Voucher
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherEntry;

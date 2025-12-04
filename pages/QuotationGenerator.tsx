import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, Sparkles, ChevronDown } from 'lucide-react';
import { storage } from '../services/storage';
import { generateQuotationPDF } from '../services/pdfGenerator';
import { FIRM_DETAILS, TAX_RATES } from '../constants';
import { Quotation, InvoiceItem, Customer, Product, FirmDetails } from '../types';
import { suggestHSN } from '../services/geminiService';

const numToWords = (n: number) => {
    const a = [
        '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
    ];
    const b = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const num = Math.floor(n);
    if (num === 0) return 'Zero';

    const inWords = (num: number): string => {
        if ((num = num.toString().length > 9 ? parseFloat(num.toString().substring(0, 9)) : num) < 20) return a[num];
        if (num < 100) return b[Math.floor(num / 10)] + ' ' + a[num % 10];
        if (num < 1000) return a[Math.floor(num / 100)] + 'Hundred ' + inWords(num % 100);
        if (num < 100000) return inWords(Math.floor(num / 1000)) + 'Thousand ' + inWords(num % 1000);
        if (num < 10000000) return inWords(Math.floor(num / 100000)) + 'Lakh ' + inWords(num % 100000);
        return inWords(Math.floor(num / 10000000)) + 'Crore ' + inWords(num % 10000000);
    };

    return `Rupees ${inWords(num)}Only`;
};

interface Props {
  onSave: () => void;
  editId?: string | null;
}

const QuotationGenerator: React.FC<Props> = ({ onSave, editId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [firmDetails, setFirmDetails] = useState<FirmDetails | null>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quotationNo, setQuotationNo] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerDetails, setCustomerDetails] = useState<Partial<Customer>>({});
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [freight, setFreight] = useState(0);
  const [freightTaxRate, setFreightTaxRate] = useState(0);
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    const loadedCustomers = storage.getCustomers();
    setCustomers(loadedCustomers);
    setProducts(storage.getProducts());
    setFirmDetails(storage.getFirmDetails());

    if(editId) {
        const qtns = storage.getQuotations();
        const found = qtns.find(q => q.id === editId);
        if(found) {
            setQuotationNo(found.quotationNo);
            setDate(found.date);
            setSelectedCustomerId(found.customerId);
            setCustomerDetails({
                name: found.customerName,
                gstin: found.customerGstin,
                billingAddress: found.billingAddress,
                shippingAddress: found.shippingAddress,
                state: found.placeOfSupply,
                stateCode: found.stateCode || loadedCustomers.find(c => c.id === found.customerId)?.stateCode
            });
            setItems(found.items);
            setFreight(found.freightCharges);
            setFreightTaxRate(found.freightTaxRate || 0);
            setLoading(found.loadingCharges);
        }
    } else {
        setQuotationNo(storage.getNextQuotationNumber());
    }
  }, [editId]);

  const currentFirmStateCode = firmDetails?.stateCode || FIRM_DETAILS.stateCode;
  const isInterState = customerDetails.stateCode ? customerDetails.stateCode !== currentFirmStateCode : false;

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedCustomerId(cid);
    const cust = customers.find(c => c.id === cid);
    if (cust) {
      setCustomerDetails(cust);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      hsnCode: '',
      quantity: 1,
      unit: 'NOS',
      rate: 0,
      discount: 0,
      taxableValue: 0,
      taxRate: 18,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        let val = value;
        if (['quantity', 'rate', 'discount', 'taxRate'].includes(field)) {
            val = Number(value);
        }

        let updatedItem = { ...item, [field]: val };
        
        if (field === 'productId') {
          const prod = products.find(p => p.id === value);
          if (prod) {
            updatedItem.productName = prod.name;
            updatedItem.rate = prod.salePrice1 || prod.price || 0;
            updatedItem.hsnCode = prod.hsnCode;
            updatedItem.taxRate = prod.taxRate;
            updatedItem.unit = prod.unit;
          }
        }
        
        const quantity = Number(updatedItem.quantity);
        const rate = Number(updatedItem.rate);
        const discount = Number(updatedItem.discount);
        const taxRate = Number(updatedItem.taxRate);

        const baseVal = quantity * rate;
        const discVal = baseVal * (discount / 100);
        const taxable = baseVal - discVal;
        
        const taxAmount = taxable * (taxRate / 100);
        
        updatedItem.taxableValue = taxable;
        if (isInterState) {
          updatedItem.igstAmount = taxAmount;
          updatedItem.cgstAmount = 0;
          updatedItem.sgstAmount = 0;
        } else {
          updatedItem.igstAmount = 0;
          updatedItem.cgstAmount = taxAmount / 2;
          updatedItem.sgstAmount = taxAmount / 2;
        }
        
        updatedItem.totalAmount = taxable + taxAmount;
        
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  useEffect(() => {
    setItems(prev => prev.map(item => {
      const taxAmount = item.taxableValue * (item.taxRate / 100);
      if (isInterState) {
        return { ...item, igstAmount: taxAmount, cgstAmount: 0, sgstAmount: 0, totalAmount: item.taxableValue + taxAmount };
      } else {
        return { ...item, igstAmount: 0, cgstAmount: taxAmount / 2, sgstAmount: taxAmount / 2, totalAmount: item.taxableValue + taxAmount };
      }
    }));
  }, [isInterState]);

  const subTotal = items.reduce((acc, i) => acc + i.taxableValue, 0);
  const itemsTaxTotal = items.reduce((acc, i) => acc + i.cgstAmount + i.sgstAmount + i.igstAmount, 0);
  const freightTaxAmount = freight * (freightTaxRate / 100);

  const totalBeforeRound = subTotal + itemsTaxTotal + freight + freightTaxAmount + loading;
  const grandTotal = Math.round(totalBeforeRound);
  const roundOff = grandTotal - totalBeforeRound;

  const handleSave = () => {
    if (!selectedCustomerId || items.length === 0) {
      alert("Please select a customer and add at least one item.");
      return;
    }

    const quotation: Quotation = {
      id: editId || Date.now().toString(),
      quotationNo,
      date,
      customerId: selectedCustomerId,
      customerName: customerDetails.name || '',
      customerGstin: customerDetails.gstin || '',
      billingAddress: customerDetails.billingAddress || '',
      shippingAddress: customerDetails.shippingAddress || '',
      placeOfSupply: customerDetails.state || '',
      stateCode: customerDetails.stateCode,
      items,
      subTotal,
      freightCharges: freight,
      freightTaxRate,
      loadingCharges: loading,
      roundOff,
      grandTotal,
      totalInWords: numToWords(grandTotal),
      isInterState
    };

    storage.saveQuotation(quotation);
    generateQuotationPDF(quotation);
    onSave();
  };

  const handleGeminiSuggest = async (itemId: string, productName: string) => {
      const hsn = await suggestHSN(productName);
      if(hsn && hsn !== "Error") updateItem(itemId, 'hsnCode', hsn);
  }

  const applyPrice = (itemId: string, price: number) => {
      updateItem(itemId, 'rate', price);
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {editId ? 'Edit Quotation' : 'New Quotation'}
        </h1>
        <button 
             onClick={handleSave}
             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            <Download className="w-4 h-4 mr-2" /> Save & Print
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Customer</label>
            <select 
              value={selectedCustomerId}
              onChange={handleCustomerSelect}
              className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900"
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
            <input 
              disabled 
              value={customerDetails.state || ''} 
              className="w-full p-2 border rounded-md bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-400" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 w-24">HSN</th>
                <th className="px-4 py-2 w-24">Qty</th>
                <th className="px-4 py-2 w-36">Rate</th>
                <th className="px-4 py-2 w-24">Disc %</th>
                <th className="px-4 py-2 w-24">Tax %</th>
                <th className="px-4 py-2 w-32 text-right">Total</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                <tr key={item.id}>
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-1">
                        <select 
                        value={item.productId}
                        onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                        className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                        <option value="">Custom Item</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock || 0})</option>
                        ))}
                        </select>
                        {!item.productId && (
                            <div className="flex gap-1">
                                <input 
                                    placeholder="Item Name"
                                    value={item.productName}
                                    onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                                    className="w-full p-1 border rounded text-sm mt-1 bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                <button onClick={() => handleGeminiSuggest(item.id, item.productName)} title="Suggest HSN" className="mt-1 p-1 bg-purple-100 text-purple-600 rounded">
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                     <input value={item.hsnCode} onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)} className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </td>
                  <td className="px-4 py-2 relative">
                    <div className="flex">
                        <input type="number" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} className="w-full p-1 border rounded-l text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        {product && (
                            <div className="relative group">
                                <button className="px-1 bg-slate-200 dark:bg-slate-600 border-y border-r border-slate-300 dark:border-slate-500 rounded-r h-full flex items-center">
                                    <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                </button>
                                <div className="absolute top-full left-0 z-10 hidden group-hover:block bg-white dark:bg-slate-800 shadow-lg border dark:border-slate-600 rounded min-w-[120px]">
                                    <div onClick={() => applyPrice(item.id, product.salePrice1 || product.price || 0)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs">Sale 1: ₹{product.salePrice1 || product.price || 0}</div>
                                    <div onClick={() => applyPrice(item.id, product.salePrice2 || 0)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs">Sale 2: ₹{product.salePrice2 || 0}</div>
                                    <div onClick={() => applyPrice(item.id, product.salePrice3 || 0)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs">Sale 3: ₹{product.salePrice3 || 0}</div>
                                </div>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={item.discount} onChange={(e) => updateItem(item.id, 'discount', e.target.value)} className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </td>
                  <td className="px-4 py-2">
                    <select value={item.taxRate} onChange={(e) => updateItem(item.id, 'taxRate', e.target.value)} className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-slate-800 dark:text-white">{item.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              )}})}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} className="mt-4 flex items-center text-primary-600 hover:text-primary-700 font-medium"><Plus className="w-4 h-4 mr-2" /> Add Item</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="space-y-3">
            <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 gap-2">
              <span className="whitespace-nowrap">Freight Charges</span>
              <div className="flex gap-2 items-center w-1/2">
                <input type="number" value={freight} onChange={(e) => setFreight(Number(e.target.value))} className="w-full p-1 border rounded text-right bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Amount"/>
                <select value={freightTaxRate} onChange={(e) => setFreightTaxRate(Number(e.target.value))} className="w-20 p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Loading Charges</span>
              <input type="number" value={loading} onChange={(e) => setLoading(Number(e.target.value))} className="w-32 p-1 border rounded text-right bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div className="border-t dark:border-slate-700 my-2 pt-2">
                {isInterState ? (
                     <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>IGST</span><span>₹{(items.reduce((acc, i) => acc + i.igstAmount, 0) + (freight * freightTaxRate / 100)).toFixed(2)}</span></div>
                ) : (
                    <>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>CGST</span><span>₹{(items.reduce((acc, i) => acc + i.cgstAmount, 0) + (freight * freightTaxRate / 200)).toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>SGST</span><span>₹{(items.reduce((acc, i) => acc + i.sgstAmount, 0) + (freight * freightTaxRate / 200)).toFixed(2)}</span></div>
                    </>
                )}
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Round Off</span><span>{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span></div>
            <div className="flex justify-between text-xl font-bold text-slate-800 dark:text-white pt-3 border-t-2 border-slate-200 dark:border-slate-600"><span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
            <div className="text-xs text-slate-500 text-right italic">
                {numToWords(grandTotal)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationGenerator;
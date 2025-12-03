
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { storage } from '../services/storage';
import { PurchaseInvoice, InvoiceItem, Supplier, Product } from '../types';
import { TAX_RATES } from '../constants';

interface Props {
    onSave: () => void;
    editId?: string | null;
}

const PurchaseEntry: React.FC<Props> = ({ onSave, editId }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [originalPurchase, setOriginalPurchase] = useState<PurchaseInvoice | null>(null);

  useEffect(() => {
    setSuppliers(storage.getSuppliers());
    setProducts(storage.getProducts());

    if(editId) {
        const purchases = storage.getPurchases();
        const found = purchases.find(p => p.id === editId);
        if(found) {
            setOriginalPurchase(found);
            setInvoiceNo(found.invoiceNo);
            setDate(found.date);
            setSelectedSupplierId(found.supplierId);
            setItems(found.items);
        }
    }
  }, [editId]);

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
        // Force numeric type for number fields to avoid string concatenation issues
        let val = value;
        if (['quantity', 'rate', 'discount', 'taxRate'].includes(field)) {
            val = Number(value);
        }
        
        let updatedItem = { ...item, [field]: val };
        
        // Auto-fill product details
        if (field === 'productId') {
          const prod = products.find(p => p.id === value);
          if (prod) {
            updatedItem.productName = prod.name;
            updatedItem.hsnCode = prod.hsnCode;
            updatedItem.taxRate = prod.taxRate;
            updatedItem.unit = prod.unit;
            // Default to Purchase Price
            updatedItem.rate = prod.purchasePrice || 0;
          }
        }
        
        const quantity = Number(updatedItem.quantity);
        const rate = Number(updatedItem.rate);
        const taxRate = Number(updatedItem.taxRate);

        const taxable = quantity * rate;
        const taxAmount = taxable * (taxRate / 100);
        
        updatedItem.taxableValue = taxable;
        updatedItem.cgstAmount = taxAmount / 2; // Simplified for display
        updatedItem.sgstAmount = taxAmount / 2;
        updatedItem.totalAmount = taxable + taxAmount;
        
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, i) => acc + i.totalAmount, 0);

  const handleSave = () => {
    if (!selectedSupplierId || !invoiceNo || items.length === 0) {
      alert("Please fill all fields and add items.");
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);

    const purchase: PurchaseInvoice = {
      id: editId || Date.now().toString(),
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || '',
      invoiceNo,
      date,
      items,
      totalAmount,
      stockAdjusted: originalPurchase?.stockAdjusted || true
    };

    // Save Purchase
    storage.savePurchase(purchase);

    // Update Inventory Stock Logic
    if(!originalPurchase?.stockAdjusted) {
        // New Purchase: Add Stock
        items.forEach(item => {
            if(item.productId) storage.updateProductStock(item.productId, Number(item.quantity));
        });
    } else {
        // Editing: Reverse old, add new
         originalPurchase.items.forEach(item => {
             if(item.productId) storage.updateProductStock(item.productId, -Number(item.quantity)); // Remove old
         });
         items.forEach(item => {
             if(item.productId) storage.updateProductStock(item.productId, Number(item.quantity)); // Add new
         });
    }
    
    onSave();
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {editId ? 'Edit Purchase Entry' : 'New Purchase Entry'}
        </h1>
        <button 
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-md"
        >
            <Save className="w-4 h-4 mr-2" /> Save Purchase
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Supplier & Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Supplier</label>
            <select 
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full p-2 border rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier Invoice No</label>
            <input 
              type="text" 
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full p-2 border rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Items Received</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 w-24">HSN</th>
                <th className="px-4 py-2 w-24">Qty</th>
                <th className="px-4 py-2 w-28">Buy Rate</th>
                <th className="px-4 py-2 w-24">Tax %</th>
                <th className="px-4 py-2 w-32 text-right">Total</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((item, idx) => (
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
                            <input 
                                placeholder="Item Name"
                                value={item.productName}
                                onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                                className="w-full p-1 border rounded text-sm mt-1 bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                     <input 
                       value={item.hsnCode}
                       onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                       className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                     />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                      className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select 
                      value={item.taxRate}
                      onChange={(e) => updateItem(item.id, 'taxRate', e.target.value)}
                      className="w-full p-1 border rounded text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-slate-800 dark:text-white">
                    {item.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-4">
            <button 
            onClick={addItem}
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
            <Plus className="w-4 h-4 mr-2" /> Add Item
            </button>
            <div className="text-xl font-bold text-slate-800 dark:text-white">
                Total: ₹{totalAmount.toLocaleString()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntry;

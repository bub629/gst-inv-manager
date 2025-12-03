
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { storage } from '../services/storage';
import { INDIAN_STATES, TAX_RATES, UNITS } from '../constants';

interface MastersProps {
  type: 'customers' | 'products' | 'suppliers';
}

const Masters: React.FC<MastersProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    refreshData();
  }, [type]);

  const refreshData = () => {
    if (type === 'customers') setData(storage.getCustomers());
    else if (type === 'suppliers') setData(storage.getSuppliers());
    else setData(storage.getProducts());
  };

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    if (item) {
      // Migrate legacy price if needed
      setFormData({ 
          ...item,
          salePrice1: item.salePrice1 || item.price || 0,
          purchasePrice: item.purchasePrice || 0,
          salePrice2: item.salePrice2 || 0,
          salePrice3: item.salePrice3 || 0
      });
    } else {
      // Defaults
      if (type === 'customers') {
        setFormData({ name: '', gstin: '', billingAddress: '', shippingAddress: '', state: 'Odisha', stateCode: '21', phone: '' });
      } else if (type === 'suppliers') {
        setFormData({ name: '', gstin: '', address: '', state: 'Odisha', phone: '', email: '' });
      } else {
        setFormData({ 
            name: '', hsnCode: '', unit: 'KGS', taxRate: 18, stock: 0,
            purchasePrice: 0, salePrice1: 0, salePrice2: 0, salePrice3: 0
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const id = editingItem ? editingItem.id : Date.now().toString();
    const payload = { ...formData, id };
    
    if (type === 'customers') storage.saveCustomer(payload);
    else if (type === 'suppliers') storage.saveSupplier(payload);
    else storage.saveProduct(payload);
    
    setIsModalOpen(false);
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      if (type === 'customers') storage.deleteCustomer(id);
      else if (type === 'suppliers') storage.deleteSupplier(id);
      else storage.deleteProduct(id);
      refreshData();
    }
  };

  const getTitle = () => {
      if(type === 'customers') return 'Manage Customers';
      if(type === 'suppliers') return 'Manage Suppliers';
      return 'Product Master';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold capitalize text-slate-800 dark:text-white">{getTitle()}</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            <tr>
              {type !== 'products' ? (
                <>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Name</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">GSTIN</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Phone</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Location</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Name</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">HSN</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Purchase Price</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Sale Price (1)</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase">Stock</th>
                </>
              )}
              <th className="px-6 py-3 text-xs font-medium uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.map(item => (
              <tr key={item.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                {type !== 'products' ? (
                    <>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">{item.gstin}</td>
                    <td className="px-6 py-4">{item.phone}</td>
                    <td className="px-6 py-4">{item.state}</td>
                    </>
                ) : (
                    <>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">{item.hsnCode}</td>
                    <td className="px-6 py-4">₹{item.purchasePrice || 0}</td>
                    <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{item.salePrice1 || item.price || 0}</td>
                    <td className="px-6 py-4 font-semibold text-primary-600 dark:text-primary-400">{item.stock || 0} {item.unit}</td>
                    </>
                )}
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700 mr-3"><Edit className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
             {data.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{editingItem ? 'Edit' : 'Add'} {type === 'customers' ? 'Customer' : type === 'suppliers' ? 'Supplier' : 'Product'}</h2>
            
            <div className="space-y-4">
              {type === 'customers' || type === 'suppliers' ? (
                <>
                  <input placeholder="Name" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input placeholder="GSTIN" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} />
                  <textarea placeholder="Address" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.address || formData.billingAddress} onChange={e => setFormData({...formData, address: e.target.value, billingAddress: e.target.value, shippingAddress: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.stateCode || '21'} onChange={e => {
                        const s = INDIAN_STATES.find(st => st.code === e.target.value);
                        setFormData({...formData, stateCode: e.target.value, state: s?.name});
                    }}>
                        {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                    <input placeholder="Phone" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                   {/* Product Form */}
                   <input placeholder="Product Name" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   
                   <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-700">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Pricing Details</label>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-xs text-slate-500">Purchase Price</label>
                                <input type="number" placeholder="Purchase Price" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Tax Rate</label>
                                <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: Number(e.target.value)})}>
                                    {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-xs text-slate-500">Sale Price 1</label>
                                <input type="number" placeholder="Sale 1" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.salePrice1} onChange={e => setFormData({...formData, salePrice1: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Sale Price 2</label>
                                <input type="number" placeholder="Sale 2" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.salePrice2} onChange={e => setFormData({...formData, salePrice2: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Sale Price 3</label>
                                <input type="number" placeholder="Sale 3" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.salePrice3} onChange={e => setFormData({...formData, salePrice3: Number(e.target.value)})} />
                            </div>
                        </div>
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                        <input placeholder="HSN Code" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} />
                        <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                   </div>
                   
                   {!editingItem && (
                       <div>
                           <label className="text-xs text-slate-500">Opening Stock</label>
                           <input type="number" placeholder="0" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                       </div>
                   )}
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masters;

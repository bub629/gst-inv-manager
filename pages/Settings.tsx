
import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Lock, Upload, Database, Download } from 'lucide-react';
import { storage } from '../services/storage';
import { FirmDetails } from '../types';
import { INDIAN_STATES } from '../constants';

const Settings = () => {
    const [details, setDetails] = useState<FirmDetails | null>(null);
    const [currentUsername, setCurrentUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [backupFile, setBackupFile] = useState<File | null>(null);

    // Default empty structure to ensure no field is undefined
    const defaultDetails: FirmDetails = {
        name: "",
        address: "",
        city: "",
        district: "",
        state: "Odisha",
        pincode: "",
        gstin: "",
        stateCode: "21",
        contact: "",
        bankName: "",
        accountNo: "",
        ifsc: ""
    };

    useEffect(() => {
        try {
            const data = storage.getFirmDetails();
            setCurrentUsername(storage.getCurrentUsername());

            if (data) {
                // Merge saved data with default structure to prevent undefined values for new fields
                setDetails({ ...defaultDetails, ...data });
            } else {
                setDetails(defaultDetails);
            }
        } catch (e) {
            console.error("Error loading settings", e);
            setDetails(defaultDetails);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if(!details) return;
        setDetails({
            ...details,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        try {
            if(details) {
                // Basic Validation
                if(!details.name.trim()) {
                    alert("Firm Name is required.");
                    return;
                }
                
                // Save to storage
                storage.saveFirmDetails(details);
                
                // Success Message
                alert("Settings Saved Successfully! The app will reload to apply changes.");
                window.location.reload();
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save settings. Please check your browser storage permissions.");
        }
    };

    const handleSecurityUpdate = () => {
        if (newPassword.length < 4) {
            alert("Password must be at least 4 characters long.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (storage.updateCurrentUserPassword(newPassword)) {
            alert("Password updated successfully! Please login again.");
            storage.logout();
            window.location.reload();
        } else {
            alert("Failed to update password.");
        }
    };

    const handleRestore = async () => {
        if(!backupFile) {
            alert("Please select a file first");
            return;
        }
        try {
            await storage.restoreData(backupFile);
            alert("Data restored successfully! The page will now reload.");
            window.location.reload();
        } catch(e) {
            alert("Failed to restore data. Please ensure the file is a valid backup JSON.");
        }
    };

    if(!details) return <div className="p-8 text-center">Loading Settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>

            {/* Firm Details Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 border-b dark:border-slate-700 pb-2">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Firm Details</h2>
                    <Save className="w-5 h-5 text-slate-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Firm Name *</label>
                        <input name="name" placeholder="Enter your Business Name" value={details.name || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                        <input name="address" placeholder="Building, Street, Area" value={details.address || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                        <input name="city" placeholder="City" value={details.city || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">District</label>
                        <input name="district" placeholder="District" value={details.district || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                         <select name="stateCode" value={details.stateCode || '21'} onChange={(e) => {
                             const s = INDIAN_STATES.find(st => st.code === e.target.value);
                             setDetails({...details, stateCode: e.target.value, state: s?.name || ''});
                         }} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900">
                             {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                         </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                        <input name="pincode" placeholder="000000" value={details.pincode || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
                        <input name="gstin" placeholder="Enter GSTIN (Optional)" value={details.gstin || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact No</label>
                        <input name="contact" placeholder="Phone Number" value={details.contact || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                </div>
            </div>

            {/* Bank Details Section */}
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 border-b dark:border-slate-700 pb-2">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Bank Details (For Invoice)</h2>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                        <input name="bankName" value={details.bankName || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                        <input name="accountNo" value={details.accountNo || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
                        <input name="ifsc" value={details.ifsc || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                 </div>
             </div>

             <div className="flex justify-end">
                 <button onClick={handleSave} className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition-colors">
                     <Save className="w-5 h-5 mr-2" /> Save Settings
                 </button>
             </div>

             {/* Security Section */}
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 border-b dark:border-slate-700 pb-2">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Change Password / Username</h2>
                    <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                     <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded mb-4 text-sm text-slate-600 dark:text-slate-400">
                         Logged in as: <span className="font-bold text-slate-800 dark:text-white">{currentUsername}</span>
                     </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmNewPassword} 
                            onChange={e => setConfirmNewPassword(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" 
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button onClick={handleSecurityUpdate} className="px-6 py-2 bg-slate-800 text-white dark:bg-slate-600 rounded hover:bg-slate-900 dark:hover:bg-slate-500">
                            Update Password
                        </button>
                    </div>
                </div>
             </div>

            {/* Data Management Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 border-b dark:border-slate-700 pb-2">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Data Management</h2>
                    <Database className="w-5 h-5 text-slate-400" />
                </div>
                
                <div className="space-y-6">
                    {/* Backup Section */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-100 dark:border-emerald-900/40">
                         <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-1">Backup Data</h3>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">Download all your app data (Invoices, Customers, Products) to a file.</p>
                            </div>
                            <button 
                                onClick={() => storage.backupData()} 
                                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm shadow-sm"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download Backup
                            </button>
                         </div>
                    </div>

                    {/* Restore Section */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/40">
                        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Restore Data</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">Upload a previously downloaded backup JSON file to restore your data.</p>
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                accept=".json"
                                onChange={(e) => setBackupFile(e.target.files ? e.target.files[0] : null)}
                                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                            <button onClick={handleRestore} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                <Upload className="w-4 h-4 mr-2" /> Restore
                            </button>
                        </div>
                    </div>
                </div>
            </div>

             {/* Danger Zone */}
             <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-6 border border-red-200 dark:border-red-900/30 mt-8">
                 <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
                     <AlertTriangle className="w-5 h-5 mr-2" />
                     Danger Zone
                 </h2>
                 <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                     Clearing data will remove all Invoices, Customers, Products, and Purchase history from this browser. This action cannot be undone.
                 </p>
                 <button 
                    onClick={() => {
                        if(confirm("CRITICAL WARNING: This will delete ALL your app data. Are you absolutely sure?")) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                 >
                     Reset All Data
                 </button>
             </div>
        </div>
    );
};

export default Settings;

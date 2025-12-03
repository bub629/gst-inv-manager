
import React, { useState, useEffect } from 'react';
import { Save, Lock, Upload, Database, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { storage } from '../services/storage';
import { FirmDetails } from '../types';
import { INDIAN_STATES } from '../constants';

interface SettingsProps {
    onComplete?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onComplete }) => {
    const [details, setDetails] = useState<FirmDetails | null>(null);
    const [currentUsername, setCurrentUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successType, setSuccessType] = useState<'save' | 'restore'>('save');

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
            const uname = storage.getCurrentUsername();
            setCurrentUsername(uname);
            setNewUsername(uname); // Pre-fill current username

            if (data) {
                // Merge saved data with default structure to prevent undefined values
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
                
                // Show Success Screen
                setSuccessType('save');
                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save settings. Please check your browser storage permissions.");
        }
    };

    const handleContinue = () => {
        if (onComplete) {
            onComplete();
        } else {
            // Fallback if prop is missing
            window.location.reload();
        }
    };

    const handleSecurityUpdate = () => {
        let usernameUpdated = false;
        let passwordUpdated = false;
        let needsLogout = false;

        // 1. Update Username if changed
        if (newUsername && newUsername !== currentUsername) {
            // Placeholder for username update logic
            alert("Username update requires re-login.");
            needsLogout = true;
        }

        // 2. Update Password
        if (newPassword) {
            if (newPassword.length < 4) {
                alert("Password must be at least 4 characters long.");
                return;
            }
            if (newPassword !== confirmNewPassword) {
                alert("Passwords do not match.");
                return;
            }
            
            if(storage.updateCurrentUserPassword(newPassword)) {
                passwordUpdated = true;
                needsLogout = true;
            } else {
                alert("Failed to update password.");
                return;
            }
        }

        if (passwordUpdated || needsLogout) {
            alert("Security settings updated. Please login again.");
            storage.logout();
            window.location.reload();
        } else {
            alert("No changes made to security settings.");
        }
    };

    const handleRestore = async () => {
        if(!backupFile) {
            alert("Please select a file first");
            return;
        }
        try {
            await storage.restoreData(backupFile);
            setSuccessType('restore');
            setShowSuccess(true);
        } catch(e) {
            alert("Failed to restore data. Please ensure the file is a valid backup JSON.");
        }
    };

    // --- SUCCESS SCREEN ---
    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-in fade-in zoom-in duration-300">
                <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                    <CheckCircle className="w-24 h-24 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                    {successType === 'restore' ? "Data Restored Successfully" : "Document Saved Successfully"}
                </h2>
                <p className="text-slate-500 mb-8">
                    {successType === 'restore' 
                        ? "Your backup has been successfully imported." 
                        : "Your firm details have been updated."}
                </p>
                <button 
                    type="button"
                    onClick={handleContinue}
                    className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold shadow-lg transition-transform hover:scale-105 flex items-center"
                >
                    {successType === 'restore' ? "Return to Dashboard" : "Continue to Dashboard"}
                </button>
            </div>
        );
    }

    if(!details) return <div className="p-8 text-center text-white">Loading Settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>

            {/* General Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center">
                    <Save className="w-5 h-5 mr-2 text-primary-500" />
                    Business Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Firm Name *</label>
                        <input name="name" value={details.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" placeholder="Enter Business Name" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Address</label>
                        <input name="address" value={details.address} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" placeholder="Street Address" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">City</label>
                        <input name="city" value={details.city} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">District</label>
                        <input name="district" value={details.district} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">State</label>
                         <select name="stateCode" value={details.stateCode} onChange={(e) => {
                             const st = INDIAN_STATES.find(s => s.code === e.target.value);
                             setDetails({ ...details, stateCode: e.target.value, state: st?.name || '' });
                         }} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900">
                             {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                         </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Pincode</label>
                        <input name="pincode" value={details.pincode} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">GSTIN</label>
                        <input name="gstin" value={details.gstin} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" placeholder="GST Number (Optional)" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Contact No</label>
                        <input name="contact" value={details.contact} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                </div>
            </div>

            {/* Bank Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center">
                    <Save className="w-5 h-5 mr-2 text-primary-500" />
                    Bank Information (Optional)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Bank Name</label>
                        <input name="bankName" value={details.bankName || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Account No</label>
                        <input name="accountNo" value={details.accountNo || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">IFSC Code</label>
                        <input name="ifsc" value={details.ifsc || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSave}
                className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-md flex items-center justify-center"
            >
                <Save className="w-4 h-4 mr-2" /> Save Settings
            </button>

            {/* Security Section */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                    <Lock className="w-6 h-6 mr-2 text-primary-500" />
                    Security
                </h2>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Current Username</label>
                            <input 
                                disabled 
                                value={currentUsername} 
                                className="w-full p-2 border rounded bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400" 
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">New Password</label>
                             <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 4 chars"
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" 
                             />
                        </div>
                         <div>
                             <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Confirm Password</label>
                             <input 
                                type="password" 
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white text-slate-900" 
                             />
                        </div>
                    </div>
                    <button 
                        onClick={handleSecurityUpdate}
                        className="mt-4 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded hover:bg-slate-900 dark:hover:bg-slate-600"
                    >
                        Update Password
                    </button>
                </div>
            </div>

            {/* Data Management Section */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                    <Database className="w-6 h-6 mr-2 text-primary-500" />
                    Data Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Backup Data</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Download a copy of all your data (Invoices, Customers, Products) to your device.
                        </p>
                        <button 
                            onClick={() => storage.backupData()}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download Backup File
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Restore Data</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Restore data from a previously saved backup file. Warning: This will overwrite current data.
                        </p>
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                accept=".json"
                                onChange={(e) => setBackupFile(e.target.files ? e.target.files[0] : null)}
                                className="text-sm text-slate-500 dark:text-slate-400"
                            />
                            <button 
                                onClick={handleRestore}
                                className="flex items-center px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900"
                            >
                                <Upload className="w-4 h-4 mr-2" /> Restore
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;


import React from 'react';
import { ShieldAlert, HardDrive, WifiOff, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
    onAccept: () => void;
}

const TermsAndConditions: React.FC<Props> = ({ onAccept }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black/90 text-slate-200">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Terms of Use & Liability Disclaimer</h1>
                    <p className="text-slate-400 mt-2 text-sm">Please read carefully before proceeding.</p>
                </div>

                <div className="space-y-6 text-sm text-slate-300">
                    
                    {/* Primary/Beta Warning */}
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                        <h3 className="text-blue-400 font-bold flex items-center mb-2">
                            <AlertTriangle className="w-4 h-4 mr-2" /> Primary Application Status
                        </h3>
                        <p>
                            This is a <strong>Primary/Beta Version</strong> application. While every effort has been made to ensure accuracy in GST calculations and data management, the software is provided "as-is" without warranty of any kind. Use this application with caution and verify important invoices manually.
                        </p>
                    </div>

                    {/* Data Storage */}
                    <div className="flex gap-4">
                        <HardDrive className="w-6 h-6 text-slate-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-white font-bold">1. Data Storage & Privacy</h3>
                            <p className="mt-1">
                                This application works on a <strong>Local Storage</strong> basis. Your data (Invoices, Customers, Products) is stored <strong>exclusively on your device's browser</strong>. We (the developers) do not have access to your data, nor is it stored on any cloud server automatically.
                            </p>
                        </div>
                    </div>

                    {/* Data Loss & Backup */}
                    <div className="flex gap-4">
                        <WifiOff className="w-6 h-6 text-slate-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-white font-bold">2. Data Loss & Backup Responsibility</h3>
                            <p className="mt-1">
                                You are solely responsible for your data. <span className="text-amber-400">If you clear your browser cache, uninstall the browser, or if your device crashes/gets stolen, your data will be permanently lost.</span>
                            </p>
                            <p className="mt-2 text-slate-400 italic">
                                <strong>Requirement:</strong> You must regularly use the "Backup Data" option in Settings to download your data file to a safe location (Email, Google Drive, or Pen Drive). The developer is not responsible for any data loss caused by failure to backup.
                            </p>
                        </div>
                    </div>

                    {/* Machine/Internet Fault */}
                    <div className="flex gap-4">
                        <ShieldAlert className="w-6 h-6 text-slate-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-white font-bold">3. Limitation of Liability</h3>
                            <p className="mt-1">
                                <strong>Binod Kumar Sahoo</strong> (Developer) shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                                <li>Machine/Device failure or crash.</li>
                                <li>Internet connectivity issues preventing PDF generation or updates.</li>
                                <li>Calculation errors due to incorrect user input.</li>
                                <li>Business losses incurred due to software bugs or downtime.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-xs">
                        By clicking "I Agree & Continue", you acknowledge that you have read, understood, and accepted these terms. You agree to use the software at your own risk and accept full responsibility for data backups.
                    </div>

                </div>

                <div className="mt-8">
                    <button 
                        onClick={onAccept}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        I Agree & Continue
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TermsAndConditions;

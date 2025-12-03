
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Lock, User, ArrowRight, UserPlus } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [hasUsers, setHasUsers] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const usersExist = storage.hasUsers();
        setHasUsers(usersExist);
        // If no users exist (fresh app), default to Register mode
        if (!usersExist) {
            setIsRegistering(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isRegistering) {
            // Validation
            if (username.length < 3) {
                setError("Username must be at least 3 characters");
                return;
            }
            if (password.length < 4) {
                setError("Password must be at least 4 characters");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            // Attempt Register
            if (storage.registerUser(username, password)) {
                onLogin();
            } else {
                setError("Username already exists. Please choose another.");
            }

        } else {
            // Attempt Login
            if (storage.login(username, password)) {
                onLogin();
            } else {
                setError('Invalid username or password');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary-900/30 border border-primary-500/30 rounded-full flex items-center justify-center mb-4">
                        {isRegistering ? (
                             <UserPlus className="w-8 h-8 text-primary-400" />
                        ) : (
                             <Lock className="w-8 h-8 text-primary-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">GST & INVOICE MANAGER</h2>
                    <p className="text-slate-400 mt-2">
                        {isRegistering 
                            ? (!hasUsers ? "Welcome! Set up Admin Account" : "Create New User Account") 
                            : "Secure Business Management System"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 w-full p-2.5 bg-white text-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-500"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full p-2.5 bg-white text-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-500"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    {isRegistering && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 w-full p-2.5 bg-white text-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-500"
                                    placeholder="Confirm your password"
                                    required={isRegistering}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        {isRegistering ? "Create Account" : "Sign In"} 
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                </form>

                {/* Toggle between Login and Register (only if users exist) */}
                {hasUsers && (
                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setUsername('');
                                setPassword('');
                                setConfirmPassword('');
                            }}
                            className="text-sm text-primary-400 hover:text-primary-300 underline"
                        >
                            {isRegistering 
                                ? "Already have an account? Sign In" 
                                : "Create a new user account"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;

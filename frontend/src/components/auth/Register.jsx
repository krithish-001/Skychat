import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const [credentials, setCredentials] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const res = await register(credentials.username, credentials.email, credentials.password);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80')] opacity-5 mix-blend-overlay pointer-events-none"></div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden transform transition-all">
                    
                    <div className="p-8 pb-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 mb-6 shadow-lg shadow-sky-500/20 backdrop-blur-sm">
                            <User size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
                        <p className="text-sky-200/80 font-medium">Join SkyChat today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-200 animate-pulse">
                                <AlertCircle size={20} className="shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-200/50 group-focus-within:text-sky-400 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Username"
                                    className="w-full pl-11 pr-4 py-3.5 bg-sky-950/30 border border-sky-800/40 rounded-xl outline-none text-white placeholder:text-sky-400/30 focus:border-sky-500/50 focus:bg-sky-950/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-medium block"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-200/50 group-focus-within:text-sky-400 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="Email Address"
                                    className="w-full pl-11 pr-4 py-3.5 bg-sky-950/30 border border-sky-800/40 rounded-xl outline-none text-white placeholder:text-sky-400/30 focus:border-sky-500/50 focus:bg-sky-950/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-medium block"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-200/50 group-focus-within:text-sky-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="Password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-sky-950/30 border border-sky-800/40 rounded-xl outline-none text-white placeholder:text-sky-400/30 focus:border-sky-500/50 focus:bg-sky-950/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-medium block"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl text-white font-semibold text-sm shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center space-x-2 ${
                                isLoading 
                                ? 'bg-sky-600/50 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98]'
                            }`}
                        >
                            <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="bg-sky-950/30 border-t border-white/5 p-6 text-center">
                        <p className="text-sky-200/70 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Register;

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUserSellerAdmin, loginWithGoogle } from '../services/LoginService';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [googleStatus, setGoogleStatus] = useState('loading');
    const navigate = useNavigate();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const googleInitRef = useRef(false);
    const googleButtonRef = useRef(null);

    const handleRoleRedirect = (data) => {
        if (data.role === 'admin') {
            navigate('/admin/adminDashboard');
        } else if (data.role === 'seller') {
            navigate('/seller/dashboard');
        } else if (data.role === 'user') {
            navigate('/userDashboard');
        } else {
            setError('Unexpected user role received from server.');
        }
    };

    useEffect(() => {
        if (!googleClientId) {
            setGoogleStatus('missing-config');
            return undefined;
        }

        let attempts = 0;
        const maxAttempts = 40;

        const renderGoogleButton = async (response) => {
            setError('');
            setIsLoading(true);
            const result = await loginWithGoogle(response.credential);
            setIsLoading(false);

            if (!result.success) {
                setError(
                    result.message ||
                        'Google sign-in failed. Ensure VITE_GOOGLE_CLIENT_ID matches Railway GOOGLE_CLIENT_ID and your Vercel URL is in Google OAuth JavaScript origins.'
                );
                return;
            }

            handleRoleRedirect(result.data);
        };

        const tryInitializeGoogle = () => {
            attempts += 1;

            if (!window.google?.accounts?.id || !googleButtonRef.current) {
                if (attempts >= maxAttempts) {
                    setGoogleStatus('script-failed');
                    return true;
                }
                return false;
            }

            try {
                if (!googleInitRef.current) {
                    window.google.accounts.id.initialize({
                        client_id: googleClientId,
                        callback: renderGoogleButton,
                    });
                    googleInitRef.current = true;
                }

                googleButtonRef.current.innerHTML = '';
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: 320,
                    text: 'continue_with',
                    shape: 'pill',
                });
                setGoogleStatus('ready');
                return true;
            } catch (googleError) {
                console.error('Google button render failed:', googleError);
                setGoogleStatus('render-failed');
                return true;
            }
        };

        if (tryInitializeGoogle()) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            if (tryInitializeGoogle()) {
                window.clearInterval(intervalId);
            }
        }, 250);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [googleClientId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const data = await loginUserSellerAdmin({ email, password });
        setIsLoading(false);

        if (!data) {
            setError('Invalid email or password. Please try again.');
            return;
        }

        handleRoleRedirect(data);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050611] via-[#100a28] to-[#230d48] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-6xl rounded-3xl overflow-hidden border border-violet-400/20 shadow-[0_24px_80px_rgba(31,8,78,0.55)] bg-[#090c1b]/90 backdrop-blur-sm">
                <div className="grid lg:grid-cols-2">
                    <section className="p-8 sm:p-12">
                        <p className="font-display text-lg font-bold text-white tracking-tight">
                            Movie<span className="text-cyan-400">Hub</span>
                        </p>
                        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mt-4 tracking-tight">Welcome back</h2>
                        <p className="text-slate-300 mt-3">Enter your details to continue to your dashboard.</p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm text-slate-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#11172d] text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm text-slate-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#11172d] text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    required
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-red-300 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                                    {error}
                                </p>
                            )}
                            <button type="submit" disabled={isLoading} className="w-full mh-btn-primary py-3.5 px-8 rounded-xl disabled:opacity-55">
                                {isLoading ? 'Signing In...' : 'Login'}
                            </button>
                        </form>

                        {googleClientId && (
                            <div className="mt-6">
                                <div className="relative my-5">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/15" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
                                        <span className="bg-[#090c1b] px-3">Or continue with</span>
                                    </div>
                                </div>
                                <div ref={googleButtonRef} id="googleSignInButton" className="flex justify-center min-h-[44px]" />
                                {googleStatus !== 'ready' && (
                                    <p className="mt-3 text-center text-sm text-amber-300">
                                        Google sign-in is not available yet. Current status: {googleStatus}. Make sure `http://localhost:5173` is added in your Google OAuth client under Authorized JavaScript origins.
                                    </p>
                                )}
                            </div>
                        )}

                        <p className="text-center text-slate-300 mt-8">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                className="text-violet-300 font-semibold hover:underline"
                                onClick={() => navigate('/signup')}
                            >
                                Sign up
                            </button>
                        </p>
                    </section>

                    <aside className="hidden lg:flex relative min-h-[620px] overflow-hidden bg-[#060b24]">
                        <img
                            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80"
                            alt="Movie themed background"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070b24]/95 via-[#0b1340]/75 to-[#0a1c4f]/40" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(129,84,255,0.35),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.25),transparent_35%)]" />
                        <div className="relative z-10 p-10 self-end">
                            <p className="text-xs text-violet-200 uppercase tracking-[0.2em]">Secure Access</p>
                            <h3 className="text-3xl font-extrabold text-white mt-3">Stream smarter with MovieHub</h3>
                            <p className="text-slate-200/90 mt-3 leading-relaxed">
                                Discover trending movies, manage subscriptions, and track your watchlist with a premium dashboard experience.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default Login;

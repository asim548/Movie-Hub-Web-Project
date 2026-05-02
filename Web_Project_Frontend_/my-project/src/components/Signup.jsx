import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { registerUserOrSeller } from "../services/SignUpService";
import { loginWithGoogle } from "../services/LoginService";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleStatus, setGoogleStatus] = useState("loading");
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleInitRef = useRef(false);
  const googleButtonRef = useRef(null);
  const agreeRef = useRef(agree);

  useEffect(() => {
    agreeRef.current = agree;
  }, [agree]);

  useEffect(() => {
    if (!googleClientId) {
      setGoogleStatus("missing-config");
      return undefined;
    }

    let attempts = 0;
    const maxAttempts = 40;

    const handleGoogleSignup = async (response) => {
      setError("");
      if (!agreeRef.current) {
        setError("Please agree to the terms and conditions before using Google sign up.");
        return;
      }

      setIsLoading(true);
      const data = await loginWithGoogle(response.credential);
      setIsLoading(false);

      if (!data) {
        setError("Google sign-up failed. Please verify the Google OAuth configuration.");
        return;
      }

      navigate("/userDashboard");
    };

    const tryInitializeGoogle = () => {
      attempts += 1;

      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        if (attempts >= maxAttempts) {
          setGoogleStatus("script-failed");
          return true;
        }
        return false;
      }

      try {
        if (!googleInitRef.current) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSignup,
          });
          googleInitRef.current = true;
        }

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signup_with",
          shape: "pill",
        });

        setGoogleStatus("ready");
        return true;
      } catch (googleError) {
        console.error("Google sign-up button render failed:", googleError);
        setGoogleStatus("render-failed");
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

  const handleData = async (e) => {
    e.preventDefault();
    setError("");
    if (!agree) {
      setError("You must agree to the terms and conditions.");
      return;
    }
    const userOrSeller = { name, email, password, role };
    setIsLoading(true);
    const signupResult = await registerUserOrSeller(userOrSeller);
    setIsLoading(false);

    if (signupResult.ok) {
      navigate("/login");
    } else {
      setError(signupResult.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050611] via-[#100a28] to-[#230d48] px-4 py-8">
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden border border-violet-400/20 shadow-[0_24px_80px_rgba(31,8,78,0.55)] bg-[#090c1b]/90 backdrop-blur-sm">
        <div className="grid lg:grid-cols-2">
          <section className="p-8 sm:p-12">
            <p className="font-display text-lg font-bold text-white tracking-tight">
              Movie<span className="text-cyan-400">Hub</span>
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mt-4 tracking-tight">Create account</h2>
            <p className="text-slate-300 mt-3">Join as user, seller, or admin and start managing your movie world.</p>

            <form onSubmit={handleData} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-[#11172d] text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[#11172d] text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 bg-[#11172d] text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <span className="text-slate-300 text-sm">Role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full px-4 py-3 bg-[#11172d] text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="w-4 h-4 text-violet-500 border-gray-300 rounded focus:ring-violet-500"
                />
                <label htmlFor="agree" className="ml-2 text-slate-300 text-sm">
                  I agree to the{" "}
                  <button type="button" onClick={() => navigate('/termsAndConditions')}
                    className="text-violet-300 hover:underline cursor-pointer">
                    Terms and Conditions
                  </button>
                </label>
              </div>
              {error && (
                <p className="text-sm text-red-300 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button type="submit" disabled={isLoading} className="w-full mh-btn-primary py-3.5 px-8 rounded-xl disabled:opacity-55">
                {isLoading ? "Creating Account..." : "Sign Up"}
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
                <div ref={googleButtonRef} id="googleSignupButton" className="flex justify-center min-h-[44px]" />
                <p className="mt-3 text-center text-xs text-slate-400">
                  Google sign-up currently creates a standard user account.
                </p>
                {googleStatus !== "ready" && (
                  <p className="mt-2 text-center text-sm text-amber-300">
                    Google sign-up is not available yet. Current status: {googleStatus}. Make sure `http://localhost:5173` is added in your Google OAuth client under Authorized JavaScript origins.
                  </p>
                )}
              </div>
            )}

            <p className="text-center text-slate-300 mt-8">
              Already have an account?{" "}
              <button
                type="button"
                className="text-violet-300 font-semibold hover:underline"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            </p>
          </section>

          <aside className="hidden lg:flex relative min-h-[700px] overflow-hidden bg-[#060b24]">
            <img
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80"
              alt="Cinema inspired background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b24]/95 via-[#101542]/75 to-[#0f1a55]/40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(129,84,255,0.35),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(56,189,248,0.24),transparent_35%)]" />
            <div className="relative z-10 p-10 self-end">
              <p className="text-xs text-violet-200 uppercase tracking-[0.2em]">Start Your Journey</p>
              <h3 className="text-3xl font-extrabold text-white mt-3">Build your MovieHub identity</h3>
              <p className="text-slate-200/90 mt-3 leading-relaxed">
                Create your account to unlock personalized recommendations, seller tools, and powerful admin controls.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Signup;

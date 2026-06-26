'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, redirect } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import {
  ArrowLeftIcon,
  ShieldIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  EyeIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@/components/ui/emoji-icons';

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';

const previewProducts = [
  { name: 'Sony WH-1000XM5', price: '$349', match: 98, gradient: 'from-violet-500/30 to-fuchsia-500/30', top: '18%', left: '18%', rotate: -4, delay: '0s' },
  { name: 'Apple Watch Ultra 2', price: '$799', match: 95, gradient: 'from-blue-500/30 to-cyan-500/30', top: '48%', left: '55%', rotate: 3, delay: '-2s' },
  { name: 'MacBook Air M3', price: '$1,099', match: 92, gradient: 'from-amber-500/30 to-orange-500/30', top: '65%', left: '12%', rotate: -2, delay: '-4s' },
  { name: 'Nordace Siena Pro', price: '$89', match: 96, gradient: 'from-emerald-500/30 to-teal-500/30', top: '28%', left: '60%', rotate: 5, delay: '-1.5s' },
];

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, googleLogin } = useAuth();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);

  if (isAuthenticated) {
    redirect('/dashboard');
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'At least 8 characters required';
    if (!confirmPassword) errs.confirm = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoogleSuccess = async (tokenResponse: { access_token?: string }) => {
    if (!tokenResponse.access_token) return;
    setLoading(true);
    try {
      await googleLogin(tokenResponse.access_token);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {},
    flow: 'implicit',
  });

  const handleGitHubLogin = useCallback(() => {
    if (!GITHUB_CLIENT_ID) {
      toast.error('GitHub OAuth is not configured');
      return;
    }
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('github_oauth_state', state);
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email&state=${state}`;
    const popup = window.open(url, 'github-oauth', 'width=600,height=700');
    if (!popup) {
      toast.error('Popup blocked. Please allow popups for this site.');
    }
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.source !== 'cognicart-github-oauth') return;
      if (event.data.type === 'auth_success') {
        const { access_token, refresh_token } = event.data.payload;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        authApi.getMe().then(({ data }) => {
          setAuth(data, access_token, refresh_token);
          toast.success('Welcome to CogniCart!');
          router.push('/dashboard');
        });
      } else if (event.data.type === 'auth_error') {
        toast.error(event.data.error || 'GitHub sign in failed');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [router, setAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email, password, name, phone || undefined);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `glass-input ${errors[field] ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`;

  return (
    <div className="relative min-h-screen neural-grid overflow-hidden">
      <div className="fixed inset-0 mesh-bg pointer-events-none" />

      {/* Decorative aurora glass spheres */}
      <div className="absolute top-[12%] left-[8%] w-80 h-80 rounded-full bg-gradient-to-br from-[--primary]/10 via-[--primary]/5 to-transparent blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[18%] right-[12%] w-64 h-64 rounded-full bg-gradient-to-br from-[--secondary]/8 via-[--secondary]/3 to-transparent blur-3xl animate-float pointer-events-none" />

      <div className="flex min-h-screen">
        {/* ──── LEFT COLUMN ──── */}
        <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center relative z-10 px-4 md:px-8 py-8">
          {/* Back to Home */}
          <Link href="/" className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-2 text-sm text-[--muted] hover:text-white transition-colors group">
            <ArrowLeftIcon size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          {/* Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="glass-strong rounded-3xl p-8 md:p-10 animate-scale-in">
              {/* Logo + Title */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-[--primary]/25 animate-float mb-5"
                >
                  <InfinityLoopIcon size={22} />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-2xl font-bold font-space text-gradient-primary"
                >
                  Create Account
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-sm text-[--muted] mt-1.5 font-sans"
                >
                  Join CogniCart AI Shopping
                </motion.p>
              </div>

              {/* Social Login */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={() => googleLoginHandler()}
                  disabled={loading}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  disabled={loading}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </button>
                <div className="relative group">
                  <button type="button" disabled className="btn-secondary w-full text-sm opacity-40 cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Continue with Apple
                  </button>
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full bg-[--secondary]/20 text-[--secondary] border border-[--secondary]/30">
                    Coming Soon
                  </span>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-center gap-3 my-6"
              >
                <div className="flex-1 h-px bg-[--glass-border]" />
                <span className="text-xs text-[--muted] font-sans tracking-wide">or continue with email</span>
                <div className="flex-1 h-px bg-[--glass-border]" />
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                >
                  <label className="text-xs text-[--muted] mb-2 block font-sans tracking-wide">Full Name</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--muted] pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors({}); }}
                      className={`${inputClass('name')} pl-10`}
                      placeholder="Alex Johnson"
                      required
                    />
                  </div>
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 mt-1.5 font-sans">
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <label className="text-xs text-[--muted] mb-2 block font-sans tracking-wide">Email</label>
                  <div className="relative">
                    <MailIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--muted] pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                      className={`${inputClass('email')} pl-10`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 mt-1.5 font-sans">
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                >
                  <label className="text-xs text-[--muted] mb-2 block font-sans tracking-wide">Phone (optional)</label>
                  <div className="relative">
                    <PhoneIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--muted] pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="glass-input pl-10"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <label className="text-xs text-[--muted] mb-2 block font-sans tracking-wide">Password</label>
                  <div className="relative">
                    <LockIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--muted] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                      className={`${inputClass('password')} w-full pl-10 pr-11`}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[--muted] hover:text-white transition-colors"
                    >
                      <EyeIcon size={18} />
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 mt-1.5 font-sans">
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65, duration: 0.5 }}
                >
                  <label className="text-xs text-[--muted] mb-2 block font-sans tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <LockIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--muted] pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
                      className={`${inputClass('confirm')} w-full pl-10 pr-11`}
                      placeholder="Re-enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[--muted] hover:text-white transition-colors"
                    >
                      <EyeIcon size={18} />
                    </button>
                  </div>
                  {errors.confirm && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 mt-1.5 font-sans">
                      {errors.confirm}
                    </motion.p>
                  )}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </motion.button>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="mt-4 text-[10px] text-[--muted] text-center font-sans tracking-wide"
              >
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-8 text-center text-xs text-[--muted] font-sans"
              >
                Already have an account?{' '}
                <Link href="/login" className="text-[--secondary] hover:text-white transition-colors font-medium">
                  Sign in
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-5 mt-8 text-xs text-[--muted]"
          >
            <span className="flex items-center gap-1.5">
              <LockIcon size={14} />
              256-bit encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldIcon size={14} />
              SOC 2 compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon size={14} />
              Verified by Stripe
            </span>
          </motion.div>
        </div>

        {/* ──── RIGHT COLUMN - AI Preview ──── */}
        <div className="hidden lg:flex w-1/2 min-h-screen relative items-center justify-center overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[--primary]/5 via-transparent to-[--secondary]/5 pointer-events-none" />

          <div className="relative w-full h-full flex items-center justify-center">
            {/* Preview Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="inline-flex items-center gap-2 text-sm text-[--muted]">
                <SparklesIcon size={16} className="text-[--secondary]" />
                <span>Your AI Shopping Preview</span>
              </div>
            </motion.div>

            {/* Floating Product Cards */}
            {previewProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.6, ease: 'easeOut' }}
                className="absolute"
                style={{ top: product.top, left: product.left, transform: `rotate(${product.rotate}deg)` }}
              >
                <motion.div
                  className="glass rounded-2xl p-3 w-56 cursor-default"
                  animate={{ y: [0, -8, 4, 0] }}
                  transition={{
                    duration: 6 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                  whileHover={{ scale: 1.05, y: -6 }}
                >
                  {/* Product thumbnail */}
                  <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${product.gradient} mb-3 flex items-center justify-center`}>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <SparklesIcon size={18} className="text-white/80" />
                    </div>
                  </div>
                  {/* Product info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-lg font-bold text-gradient-primary mt-0.5">{product.price}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[--primary]/20 text-[10px] font-semibold text-[--primary]">
                      <SparklesIcon size={10} />
                      {product.match}%
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <GoogleOAuthProvider clientId="830436724171-7ekqdg8pj86r3j8u16v7q1bsksd7oo95.apps.googleusercontent.com">
      <RegisterForm />
    </GoogleOAuthProvider>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

function ForgotPasswordContent() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Invalid email address';
    return '';
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('Reset code sent to your email');
      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = Array(6).fill('');
    for (let i = 0; i < data.length; i++) newOtp[i] = data[i];
    setOtp(newOtp);
    const next = Math.min(data.length, 5);
    inputsRef.current[next]?.focus();
  }, []);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.verifyResetOtp(email, code);
      toast.success('Code verified');
      router.push(`/reset-password?token=${data.reset_token}&email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      await authApi.resendOtp(email, 'password_reset');
      toast.success('New code sent');
      setTimer(60);
      setCanResend(false);
      setOtp(Array(6).fill(''));
      setError('');
      inputsRef.current[0]?.focus();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 mesh-bg overflow-hidden">
      <div className="neural-grid absolute inset-0 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8 md:p-10 animate-scale-in">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-[--primary]/25 group-hover:shadow-[--primary]/40 transition-shadow animate-float">C</div>
            </Link>
            {step === 'email' && (
              <>
                <h1 className="text-2xl font-bold font-space text-gradient-primary">Forgot Password</h1>
                <p className="text-sm text-[--muted] mt-1.5 font-sans">Enter your email to receive a reset code</p>
              </>
            )}
            {step === 'otp' && (
              <>
                <h1 className="text-2xl font-bold font-space text-gradient-primary">Reset Code</h1>
                <p className="text-sm text-[--muted] mt-1.5 font-sans">Enter the 6-digit code sent to</p>
                <p className="text-sm font-medium text-white mt-0.5">{email}</p>
              </>
            )}
            {step === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[--primary]/20 to-[--secondary]/20 flex items-center justify-center animate-scale-in">
                  <svg className="w-8 h-8 text-[--secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold font-space text-gradient-primary">Check Your Email</h1>
                <p className="text-sm text-[--muted] mt-1.5 font-sans">We sent a password reset code to</p>
                <p className="text-sm font-medium text-white mt-0.5">{email}</p>
              </>
            )}
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="text-xs text-[--muted] mb-2 block font-sans tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`glass-input ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
                  placeholder="you@example.com"
                  required
                />
                {error && <p className="text-xs text-red-400 mt-1.5 font-sans">{error}</p>}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </motion.button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="flex items-center justify-center gap-3 mb-6">
                {otp.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    whileFocus={{ scale: 1.05 }}
                    className={`w-12 h-14 text-center text-lg font-bold glass-input !p-0
                      ${error ? 'border-red-500/50' : ''}`}
                  />
                ))}
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 text-center mb-4 font-sans"
                >
                  {error}
                </motion.p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full mb-4"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </motion.button>
              <div className="text-center text-xs text-[--muted] font-sans">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[--secondary] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend code'}
                  </button>
                ) : (
                  <span>Resend code in <span className="text-white font-medium">{timer}s</span></span>
                )}
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-[--muted] font-sans">
            <Link href="/login" className="text-[--secondary] hover:text-white transition-colors">Back to login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center mesh-bg">
        <div className="neural-grid absolute inset-0 pointer-events-none" />
        <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin glow-primary" />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}

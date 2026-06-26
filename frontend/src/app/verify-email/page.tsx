'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, verifyLoginOtp, isAuthenticated } = useAuth();

  const mode = searchParams.get('mode') || 'registration';
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const isLoginMode = mode === 'login';

  useEffect(() => {
    if (isAuthenticated && !isLoginMode) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoginMode, router]);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');

    try {
      let ok: boolean;
      if (isLoginMode) {
        ok = await verifyLoginOtp(emailParam, code);
      } else {
        ok = await verifyEmail(emailParam, code);
      }
      if (ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      const purpose = isLoginMode ? 'login' : mode;
      await authApi.resendOtp(emailParam, purpose);
      toast.success('New code sent to your email');
      setTimer(60);
      setCanResend(false);
      setOtp(Array(6).fill(''));
      setError('');
      inputsRef.current[0]?.focus();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const title = isLoginMode ? 'Login Verification' : 'Verify Your Email';
  const subtitle = isLoginMode
    ? 'A verification code has been sent to your email for secure login'
    : 'We\'ve sent a verification code to';

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
            {!success ? (
              <>
                <h1 className="text-2xl font-bold font-space text-gradient-primary">{title}</h1>
                <p className="text-sm text-[--muted] mt-1.5 font-sans">{subtitle}</p>
                {emailParam && !isLoginMode && (
                  <p className="text-sm font-medium text-white mt-0.5">{emailParam}</p>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[--primary]/20 to-[--secondary]/20 flex items-center justify-center animate-scale-in">
                  <svg className="w-8 h-8 text-[--secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold font-space text-gradient-primary">Verified!</h1>
                <p className="text-sm text-[--muted] mt-1.5 font-sans">Redirecting to dashboard...</p>
              </>
            )}
          </div>

          {!success ? (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-center gap-3 mb-6">
                {otp.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
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
                {loading ? 'Verifying...' : 'Verify'}
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
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full"
                >
                  Go to Dashboard
                </motion.button>
              </Link>
            </motion.div>
          )}

          {!isLoginMode && (
            <div className="mt-8 text-center text-xs text-[--muted] font-sans">
              <Link href="/login" className="text-[--secondary] hover:text-white transition-colors">Back to login</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center mesh-bg">
        <div className="neural-grid absolute inset-0 pointer-events-none" />
        <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin glow-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

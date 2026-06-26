'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, logout: storeLogout, setUser } = useAuthStore();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const storeTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }, []);

  const login = useCallback(async (email: string, password: string, requireOtp: boolean = false) => {
    try {
      if (requireOtp) {
        const { data } = await authApi.login({ email, password });
        storeTokens(data.access_token, data.refresh_token);
        await authApi.sendLoginOtp(email);
        setUnverifiedEmail(email);
        router.push(`/verify-email?mode=login&email=${encodeURIComponent(email)}`);
        toast.success('Verification code sent to your email');
        return;
      }

      const { data } = await authApi.login({ email, password });
      storeTokens(data.access_token, data.refresh_token);
      const userData = (await authApi.getMe()).data;
      setAuth(userData, data.access_token, data.refresh_token);
      toast.success('Welcome back to CogniCart!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const message = err.response?.data?.detail || 'Login failed';

      if (message.toLowerCase().includes('email not verified')) {
        router.push(`/verify-email?mode=registration&email=${encodeURIComponent(email)}`);
        toast.error('Please verify your email first');
        return;
      }

      toast.error(message);
      throw error;
    }
  }, [router, setAuth, storeTokens]);

  const googleLogin = useCallback(async (token: string) => {
    try {
      const { data } = await authApi.googleLogin(token);
      storeTokens(data.access_token, data.refresh_token);
      const userData = (await authApi.getMe()).data;
      setAuth(userData, data.access_token, data.refresh_token);
      toast.success('Welcome to CogniCart!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Google login failed');
      throw error;
    }
  }, [router, setAuth, storeTokens]);

  const githubLogin = useCallback(async (token: string) => {
    try {
      const { data } = await authApi.githubLogin(token);
      storeTokens(data.access_token, data.refresh_token);
      const userData = (await authApi.getMe()).data;
      setAuth(userData, data.access_token, data.refresh_token);
      toast.success('Welcome to CogniCart!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'GitHub login failed');
      throw error;
    }
  }, [router, setAuth, storeTokens]);

  const register = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data } = await authApi.register({ email, password, full_name: fullName, phone });
      storeTokens(data.access_token, data.refresh_token);
      setUnverifiedEmail(email);
      toast.success('Account created! Please verify your email.');
      router.push(`/verify-email?mode=registration&email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const message = err.response?.data?.detail || 'Registration failed';
      toast.error(message);
      throw error;
    }
  }, [router, setAuth, storeTokens]);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    try {
      await authApi.verifyEmail(email, otp);
      const userData = (await authApi.getMe()).data;
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (accessToken && refreshToken) {
        setAuth(userData, accessToken, refreshToken);
      }
      toast.success('Email verified successfully!');
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const message = err.response?.data?.detail || 'Verification failed';
      toast.error(message);
      return false;
    }
  }, [setAuth]);

  const verifyLoginOtp = useCallback(async (email: string, otp: string) => {
    try {
      const { data } = await authApi.verifyLoginOtp(email, otp);
      storeTokens(data.access_token, data.refresh_token);
      const userData = (await authApi.getMe()).data;
      setAuth(userData, data.access_token, data.refresh_token);
      toast.success('Welcome back to CogniCart!');
      router.push('/dashboard');
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const message = err.response?.data?.detail || 'Verification failed';
      toast.error(message);
      return false;
    }
  }, [router, setAuth, storeTokens]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      storeLogout();
      router.push('/login');
      toast.success('Logged out successfully');
    }
  }, [router, storeLogout]);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data);
      return data;
    } catch {
      storeLogout();
      return null;
    }
  }, [setUser, storeLogout]);

  return {
    user, isAuthenticated, unverifiedEmail,
    login, googleLogin, githubLogin, register, verifyEmail, verifyLoginOtp, logout, fetchUser,
    setUnverifiedEmail
  };
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function GitHubCallbackPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Completing GitHub sign in...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code received from GitHub.');
      return;
    }

    authApi
      .githubExchangeCode(code)
      .then(({ data }) => {
        setMessage('Sign in successful!');
        if (window.opener) {
          window.opener.postMessage(
            {
              source: 'cognicart-github-oauth',
              type: 'auth_success',
              payload: {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
              },
            },
            window.location.origin
          );
          window.close();
        } else {
          setMessage('Redirecting...');
          window.location.href = '/dashboard';
        }
      })
      .catch((err: unknown) => {
        const detail =
          (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'GitHub OAuth failed';
        setError(detail);
        if (window.opener) {
          window.opener.postMessage(
            { source: 'cognicart-github-oauth', type: 'auth_error', error: detail },
            window.location.origin
          );
        }
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen neural-grid flex items-center justify-center">
      <div className="glass-strong rounded-3xl p-10 max-w-md w-full mx-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-[--primary]/25 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
        {error ? (
          <>
            <h1 className="text-xl font-bold text-red-400 mb-2">Authentication Failed</h1>
            <p className="text-sm text-[--muted]">{error}</p>
            <button
              onClick={() => window.close()}
              className="btn-primary mt-6"
            >
              Close Window
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gradient-primary mb-2">GitHub Sign In</h1>
            <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[--muted]">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Login Page
 * Clean, professional login UI matching Figma design
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tokens } from '@/lib/design-tokens';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export default function LoginPage() {
  const { login, isAuthenticated, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('auth') === 'success';
    
    if (errorParam) {
      setError(errorParam);
    }
    
    if (successParam) {
      setAuthSuccess(true);
      // Refresh user data after successful auth
      setTimeout(() => {
        refreshUser();
        window.location.href = '/chat';
      }, 1000);
    }
  }, [searchParams, refreshUser]);

  useEffect(() => {
    // If already authenticated, redirect to chat
    if (isAuthenticated) {
      window.location.href = '/chat';
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = () => {
    login();
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: tokens.colors.background.primary,
        padding: tokens.spacing[6],
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[6],
          alignItems: 'center',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[4],
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.brand[500],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="chat" size={36} color={tokens.colors.text.neutral.white} />
          </div>
          <h1
            style={{
              ...tokens.typography.styles.subheadlineSemibold,
              color: tokens.colors.text.neutral.main,
              textAlign: 'center',
            }}
          >
            Welcome to Shipper
          </h1>
          <p
            style={{
              ...tokens.typography.styles.paragraphSmall,
              color: tokens.colors.text.neutral.sub,
              textAlign: 'center',
            }}
          >
            Sign in to continue to your chat
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              width: '100%',
              padding: tokens.spacing[3],
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: tokens.borderRadius.base,
              color: '#dc2626',
              ...tokens.typography.styles.paragraphSmall,
              textAlign: 'center',
            }}
          >
            {error === 'auth_failed' && 'Authentication failed. Please try again.'}
            {error === 'server_error' && 'Server error. Please try again later.'}
            {!['auth_failed', 'server_error'].includes(error) && 'An error occurred. Please try again.'}
          </div>
        )}

        {/* Success Message */}
        {authSuccess && (
          <div
            style={{
              width: '100%',
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.background.brandPrimary,
              border: `1px solid ${tokens.colors.border.brand}`,
              borderRadius: tokens.borderRadius.base,
              color: tokens.colors.text.state.success,
              ...tokens.typography.styles.paragraphSmall,
              textAlign: 'center',
            }}
          >
            Authentication successful! Redirecting...
          </div>
        )}

        {/* Login Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: tokens.colors.surface.default,
            borderRadius: tokens.borderRadius['2xl'],
            padding: tokens.spacing[8],
            boxShadow: '0px 4px 32px 0px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[6],
          }}
        >
          <Button
            variant="primary"
            size="md"
            onClick={handleGoogleLogin}
            className="w-full"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[3],
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              width: '100%',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: tokens.colors.border.primary,
              }}
            />
            <span
              style={{
                ...tokens.typography.styles.paragraphXSmall,
                color: tokens.colors.text.placeholder,
                padding: `0 ${tokens.spacing[2]}`,
              }}
            >
              Secure authentication
            </span>
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: tokens.colors.border.primary,
              }}
            />
          </div>

          <p
            style={{
              ...tokens.typography.styles.paragraphXSmall,
              color: tokens.colors.text.placeholder,
              textAlign: 'center',
              lineHeight: '1.5',
            }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

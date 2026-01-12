/**
 * Authentication Context
 * Clean, professional auth state management
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api-client';
import { socketClient } from '@/lib/socket-client';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Check for OAuth callback success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Small delay to ensure cookie is set
      setTimeout(() => {
        checkAuth();
      }, 500);
    }
  }, []);

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Small delay to ensure cookie is available and REST API has confirmed auth
        setTimeout(() => {
          socketClient.connect();
        }, 500);
      } else {
        socketClient.disconnect();
      }
    }
  }, [user, loading]);

  // Handle page visibility for online/offline status (smart detection)
  useEffect(() => {
    if (!user) return;

    let visibilityTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (!socketClient.isConnected()) return;

      // Clear any pending timeout
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }

      if (document.hidden) {
        // Page is hidden - set offline after short delay (to handle quick tab switches)
        visibilityTimeout = setTimeout(() => {
          if (document.hidden && socketClient.isConnected()) {
            socketClient.emit('presence:offline', {});
          }
        }, 2000); // 2 second delay to avoid flickering on quick tab switches
      } else {
        // Page is visible - immediately set online
        socketClient.emit('presence:online', {});
      }
    };

    // Handle when page becomes visible/hidden
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const login = () => {
    const authUrl = authApi.getGoogleAuthUrl();
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      // Disconnect WebSocket first
      socketClient.disconnect();
      await authApi.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if API call fails
      socketClient.disconnect();
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data as User);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

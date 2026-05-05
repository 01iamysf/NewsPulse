'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
  bio: string;
  avatar: string;
  coverImage: string;
  location: string;
  website: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };
}

interface UserStats {
  followersCount: number;
  followingCount: number;
  totalLikesReceived: number;
  totalViewsReceived: number;
  articlesPublished: number;
}

interface Monetization {
  isEnabled: boolean;
  isEligible: boolean;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnAmount: number;
  monetizationEnabledAt: string | null;
}

interface PaymentInfo {
  paypalEmail: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile: UserProfile;
  stats: UserStats;
  monetization: Monetization;
  paymentInfo: PaymentInfo;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    setUser(data.user);
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

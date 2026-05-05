'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, UserCheck } from 'lucide-react';
import styles from './SubscribeButton.module.css';

interface SubscribeButtonProps {
  creatorId: string;
  size?: 'small' | 'medium' | 'large';
}

export default function SubscribeButton({ creatorId, size = 'medium' }: SubscribeButtonProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
    // If no user, no need to check — just leave loading false
  }, [user, creatorId]);

  const checkSubscription = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/users/check-subscription/${creatorId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      showToast('Please sign in to subscribe', 'error');
      return;
    }

    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/users/subscribe/${creatorId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      setIsSubscribed(data.subscribed);
      showToast(data.message, data.subscribed ? 'success' : 'info');
    } catch (err) {
      showToast('Failed to update subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  // For non-authenticated users, show a plain subscribe button that prompts sign-in
  if (!user) {
    return (
      <button
        onClick={() => showToast('Please sign in to subscribe', 'error')}
        className={`${styles.button} ${styles[size]}`}
      >
        <UserPlus size={size === 'small' ? 16 : 18} />
        <span>Subscribe</span>
      </button>
    );
  }

  if (loading) {
    return (
      <button className={`${styles.button} ${styles[size]} ${styles.loading}`} disabled>
        <div className={styles.spinner} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      className={`${styles.button} ${styles[size]} ${isSubscribed ? styles.subscribed : ''}`}
    >
      {isSubscribed ? (
        <>
          <UserCheck size={size === 'small' ? 16 : 18} />
          <span>Subscribed</span>
        </>
      ) : (
        <>
          <UserPlus size={size === 'small' ? 16 : 18} />
          <span>Subscribe</span>
        </>
      )}
    </button>
  );
}

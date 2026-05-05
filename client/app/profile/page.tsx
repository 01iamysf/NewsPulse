'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// /profile redirects to /profile/[currentUserId]
export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user._id || user.id}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="loading-spinner" />
    </div>
  );
}

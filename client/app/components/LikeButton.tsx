'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart } from 'lucide-react';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  newsId: string;
  initialLikes: number;
  initialLiked: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function LikeButton({
  newsId,
  initialLikes,
  initialLiked,
  size = 'medium'
}: LikeButtonProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      showToast('Please sign in to like articles', 'error');
      return;
    }

    if (loading) return;

    setLoading(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/news/${newsId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }
    } catch (err) {
      setLiked(!newLiked);
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
      showToast('Failed to update like', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`${styles.button} ${styles[size]} ${liked ? styles.liked : ''}`}
      disabled={loading}
    >
      <Heart size={size === 'small' ? 16 : size === 'large' ? 24 : 20} fill={liked ? 'currentColor' : 'none'} />
      <span className={styles.count}>{likesCount}</span>
    </button>
  );
}

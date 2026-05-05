'use client';

import Link from 'next/link';
import { Clock, Eye, Zap, Crown, Users, Heart } from 'lucide-react';
import styles from './NewsCard.module.css';
import { resolveImageUrl } from '../../lib/imageUrl';

interface Author {
  _id: string;
  name: string;
  profile?: {
    avatar?: string;
  };
  stats?: {
    followersCount?: number;
  };
}

interface NewsCardProps {
  news: {
    _id: string;
    title: string;
    excerpt: string;
    content?: string;
    imageUrl: string;
    category: string;
    isBreaking?: boolean;
    isPremium?: boolean;
    views?: number;
    likesCount?: number;
    author?: Author;
    createdAt: string;
    isLocked?: boolean;
    isLiked?: boolean;
  };
  featured?: boolean;
}

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  const categoryClass = `badge badge-${news.category.toLowerCase()}`;
  const readTime = Math.ceil((news.content?.split(' ').length || 0) / 200) || 3;
  const date = new Date(news.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (featured) {
    return (
      <div className={styles.featuredCard}>
        <Link href={`/news/${news._id}`} className={styles.featuredImage}>
          <img src={resolveImageUrl(news.imageUrl)} alt={news.title} />
          <div className={styles.featuredOverlay} />
        </Link>
        <div className={styles.featuredContent}>
          <div className={styles.badges}>
            <span className={categoryClass}>{news.category}</span>
            {news.isBreaking && <span className="badge badge-breaking">Breaking</span>}
            {news.isPremium && <span className="badge badge-premium"><Crown size={12} /> Premium</span>}
          </div>
          <Link href={`/news/${news._id}`}>
            <h1 className={styles.featuredTitle}>{news.title}</h1>
          </Link>
          <p className={styles.featuredExcerpt}>{news.excerpt}</p>
          <div className={styles.featuredMeta}>
            <span><Clock size={14} /> {readTime} min read</span>
            <span><Eye size={14} /> {news.views || 0} views</span>
            {news.author && typeof news.author === 'object' && news.author._id && (
              <Link href={`/profile/${news.author._id}`} className={styles.authorLink}>
                <span>By {news.author.name}</span>
                {news.author.stats?.followersCount !== undefined && (
                  <span className={styles.followerCount}>
                    <Users size={12} /> {news.author.stats.followersCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <Link href={`/news/${news._id}`} className={styles.imageWrapper}>
        <img src={resolveImageUrl(news.imageUrl)} alt={news.title} className={styles.image} />
        <div className={styles.imageOverlay} />
        <div className={styles.topBadges}>
          <span className={categoryClass}>{news.category}</span>
          {news.isBreaking && <span className="badge badge-breaking animate-glow"><Zap size={10} /> LIVE</span>}
        </div>
        {news.isPremium && (
          <div className={styles.premiumBadge}>
            <Crown size={14} />
          </div>
        )}
      </Link>
      <div className={styles.content}>
        <Link href={`/news/${news._id}`}>
          <h3 className={styles.title}>{news.title}</h3>
        </Link>
        <p className={styles.excerpt}>{news.excerpt}</p>
        <div className={styles.meta}>
          {news.author && typeof news.author === 'object' && news.author._id && (
            <Link href={`/profile/${news.author._id}`} className={styles.authorSection}>
              <div className={styles.authorAvatar}>
                {news.author.profile?.avatar ? (
                  <img src={resolveImageUrl(news.author.profile.avatar)} alt={news.author.name} />
                ) : (
                  <span>{news.author.name[0]}</span>
                )}
              </div>
              <span className={styles.authorName}>{news.author.name}</span>
              {news.author.stats?.followersCount !== undefined && (
                <span className={styles.followerCount}>
                  <Users size={12} /> {news.author.stats.followersCount}
                </span>
              )}
            </Link>
          )}
          <div className={styles.metaRight}>
            <span className={styles.date}>{date}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.readTime}><Clock size={12} /> {readTime} min</span>
            {news.likesCount !== undefined && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.likes}><Heart size={12} /> {news.likesCount}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

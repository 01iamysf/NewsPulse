'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import NewsCard from '../../components/NewsCard';
import AdCard from '../../components/AdCard';
import LikeButton from '../../components/LikeButton';
import SubscribeButton from '../../components/SubscribeButton';
import { useAuth } from '../../context/AuthContext';
import { api, Ad } from '../../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Clock, Eye, Calendar, ArrowLeft, Share2, Bookmark, Lock, Users, Edit, Trash2, Heart } from 'lucide-react';
import styles from './news.module.css';
import { resolveImageUrl } from '../../../lib/imageUrl';

interface Author {
  _id: string;
  name: string;
  profile?: {
    avatar?: string;
    bio?: string;
  };
  stats?: {
    followersCount: number;
  };
  monetization?: {
    isEnabled: boolean;
  };
}

interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
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
}

export default function NewsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [randomAd, setRandomAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchNews(params.id as string);
    }
  }, [params.id, user]);

  const fetchNews = async (id: string) => {
    setLoading(true);
    try {
      const [data, adData] = await Promise.all([
        api.news.get(id),
        api.ads.random().catch(() => null)
      ]);
      
      setNews(data);
      setRandomAd(adData);
      setBookmarked(data.bookmarked || false);

      const relatedData = await api.news.list({ category: data.category, limit: 4 });
      setRelatedNews((relatedData.news || []).filter((n: NewsItem) => n._id !== id));
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: news?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      showToast('Please sign in to save articles', 'error');
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/users/bookmarks/${news?._id}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      setBookmarked(data.bookmarked);
      showToast(data.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks', 'success');
    } catch (err) {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    setDeleting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/news/${news?._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete');

      showToast('Article deleted successfully', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast('Failed to delete article', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && (user._id === news?.author?._id || user.id === news?.author?._id);
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!news) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.notFound}>
            <h1>News Not Found</h1>
            <p>This article may have been removed or the link is incorrect.</p>
            <Link href="/" className="btn btn-primary">
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const readTime = Math.ceil((news.content?.split(' ').length || 0) / 200) || 5;
  const date = new Date(news.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Header />
      <main className={styles.main}>
        <article className={styles.article}>
          <div className={styles.heroImage}>
            <img src={resolveImageUrl(news.imageUrl)} alt={news.title} />
            <div className={styles.heroOverlay} />
          </div>

          <div className={styles.content}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={18} />
              Back to News
            </Link>

            <div className={styles.meta}>
              <span className={`badge badge-${news.category?.toLowerCase() || 'general'}`}>
                {news.category}
              </span>
              {news.isBreaking && (
                <span className="badge badge-breaking">Breaking News</span>
              )}
            </div>

            <h1 className={styles.title}>{news.title}</h1>

            <div className={styles.authorSection}>
              <Link href={`/profile/${news.author?._id}`} className={styles.authorInfo}>
                <div className={styles.authorAvatar}>
                  {news.author?.profile?.avatar ? (
                    <img src={resolveImageUrl(news.author.profile.avatar)} alt={news.author.name} />
                  ) : (
                    <span>{news.author?.name?.[0] || 'A'}</span>
                  )}
                </div>
                <div>
                  <span className={styles.authorName}>{news.author?.name || 'Anonymous'}</span>
                  {news.author?.stats?.followersCount !== undefined && (
                    <span className={styles.authorFollowers}>
                      <Users size={14} /> {news.author.stats.followersCount} followers
                    </span>
                  )}
                </div>
              </Link>
              {news.author && (
                <SubscribeButton creatorId={news.author._id} size="small" />
              )}
            </div>

            <div className={styles.subMeta}>
              <span><Calendar size={16} /> {date}</span>
              <span><Clock size={16} /> {readTime} min read</span>
              <span><Eye size={16} /> {news.views || 0} views</span>
              {news.likesCount !== undefined && (
                <span><Heart size={16} /> {news.likesCount} likes</span>
              )}
            </div>

            {news.isLocked && !user ? (
              <div className={styles.lockedContent}>
                <div className={styles.lockedBox}>
                  <Lock size={48} />
                  <h2>Premium Content</h2>
                  <p>Register for free to read this article and access all premium content on NewsPulse.</p>
                  <Link href="/signup" className="btn btn-primary btn-lg">
                    Create Free Account
                  </Link>
                  <p className={styles.loginPrompt}>
                    Already have an account? <Link href="/login">Sign in</Link>
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.excerpt}>{news.excerpt}</div>
                <div className={styles.body}>
                  {news.content?.split('\n').map((paragraph, i) => (
                    paragraph.trim() && <p key={i}>{paragraph}</p>
                  )) || <p>No content available.</p>}
                </div>
              </>
            )}

            <div className={styles.actions}>
              <LikeButton
                newsId={news._id}
                initialLikes={news.likesCount || 0}
                initialLiked={news.isLiked || false}
              />
              <button onClick={handleShare} className="btn btn-secondary">
                <Share2 size={18} />
                Share
              </button>
              <button
                onClick={handleBookmark}
                className={`btn btn-secondary ${bookmarked ? 'active' : ''}`}
              >
                <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                {bookmarked ? 'Saved' : 'Save'}
              </button>
              {(isOwner || isAdmin) && (
                <>
                  <Link href={`/news/${news._id}/edit`} className="btn btn-secondary">
                    <Edit size={18} />
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="btn btn-danger"
                    disabled={deleting}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}
            </div>
            
            {randomAd && (
              <div className={styles.sponsoredSection}>
                <div className={styles.sponsoredLabel}>Sponsored Content</div>
                <AdCard ad={randomAd} />
              </div>
            )}
          </div>
        </article>

        {relatedNews.length > 0 && (
          <section className={styles.related}>
            <h2>Related Stories</h2>
            <div className={styles.relatedGrid}>
              {relatedNews.map(item => (
                <NewsCard key={item._id} news={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

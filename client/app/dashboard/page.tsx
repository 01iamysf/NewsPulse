'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsCard from '../components/NewsCard';
import SubscribeButton from '../components/SubscribeButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resolveImageUrl } from '../../lib/imageUrl';
import { Bookmark, Clock, User, Crown, ChevronRight, Users, Heart, Eye, FileText, Plus, DollarSign, TrendingUp } from 'lucide-react';
import styles from './dashboard.module.css';

interface Author {
  _id: string;
  name: string;
  profile?: {
    avatar?: string;
  };
  stats?: {
    followersCount: number;
    articlesPublished: number;
    totalLikesReceived: number;
    totalViewsReceived: number;
  };
  monetization?: {
    isEnabled: boolean;
    totalEarnings: number;
  };
}

interface NewsItem {
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
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'feed' | 'bookmarks' | 'subscriptions'>('feed');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [bookmarks, setBookmarks] = useState<NewsItem[]>([]);
  const [subscriptionNews, setSubscriptionNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const [feedRes, bookmarksRes, subscriptionRes] = await Promise.all([
        fetch(`${API_BASE}/news?limit=20`),
        fetch(`${API_BASE}/users/bookmarks`, { credentials: 'include' }),
        fetch(`${API_BASE}/news/subscriptions?limit=20`, { credentials: 'include' })
      ]);

      const feedData = await feedRes.json();
      const bookmarksData = await bookmarksRes.json();
      const subscriptionData = subscriptionRes.ok ? await subscriptionRes.json() : { news: [] };

      setNews(feedData.news || []);
      setBookmarks(bookmarksData || []);
      setSubscriptionNews(subscriptionData.news || []);
    } catch (err) {
      showToast('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (newsId: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/users/bookmarks/${newsId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.bookmarked) {
        const newsItem = news.find(n => n._id === newsId);
        if (newsItem) setBookmarks(prev => [...prev, newsItem]);
      } else {
        setBookmarks(prev => prev.filter(b => b._id !== newsId));
      }
      showToast(data.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks', 'success');
    } catch (err) {
      showToast('Failed to update bookmark', 'error');
    }
  };

  if (authLoading || !user) {
    return (
      <div className={styles.loadingPage}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <Link href="/" className={styles.backBtn}>
              <span style={{ fontSize: 18 }}>←</span> Back to Home
            </Link>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.profile?.avatar ? (
                  <img src={resolveImageUrl(user.profile.avatar)} alt={user.name} />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div>
                <h1>Welcome back, {user.name}!</h1>
                <p>{user.email}</p>
                {user.monetization?.isEnabled && (
                  <span className={styles.monetizedBadge}>
                    <DollarSign size={14} />
                    Monetized
                  </span>
                )}
              </div>
            </div>
            <div className={styles.quickActions}>
              <Link href="/create" className={styles.createBtn}>
                <Plus size={18} />
                Create Article
              </Link>
              <Link href={`/profile/${user._id || user.id}`} className={styles.viewProfileBtn}>
                View Profile
              </Link>
            </div>
          </div>
          <div className={styles.heroOrb} />
        </div>

        <div className="container">
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <Users size={24} />
              <div>
                <span className={styles.statValue}>{user.stats?.followersCount || 0}</span>
                <span className={styles.statLabel}>Followers</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <FileText size={24} />
              <div>
                <span className={styles.statValue}>{user.stats?.articlesPublished || 0}</span>
                <span className={styles.statLabel}>Articles</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <Heart size={24} />
              <div>
                <span className={styles.statValue}>{user.stats?.totalLikesReceived || 0}</span>
                <span className={styles.statLabel}>Likes Received</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <Eye size={24} />
              <div>
                <span className={styles.statValue}>{user.stats?.totalViewsReceived || 0}</span>
                <span className={styles.statLabel}>Views</span>
              </div>
            </div>
            {user.monetization?.isEnabled && (
              <div className={`${styles.statCard} ${styles.earningsCard}`}>
                <DollarSign size={24} />
                <div>
                  <span className={styles.statValue}>${user.monetization?.totalEarnings?.toFixed(2) || '0.00'}</span>
                  <span className={styles.statLabel}>Total Earnings</span>
                </div>
              </div>
            )}
          </div>

          {!user.monetization?.isEligible && !user.monetization?.isEnabled && (
            <div className={styles.monetizationPrompt}>
              <TrendingUp size={32} />
              <div>
                <h3>Enable Monetization</h3>
                <p>Complete these requirements to start earning from your content:</p>
                <div className={styles.requirements}>
                  <span className={user.stats?.followersCount >= 100 ? styles.met : ''}>
                    {user.stats?.followersCount || 0}/100 Followers
                  </span>
                  <span className={user.stats?.articlesPublished >= 50 ? styles.met : ''}>
                    {user.stats?.articlesPublished || 0}/50 Articles
                  </span>
                  <span className={user.stats?.totalLikesReceived >= 500 ? styles.met : ''}>
                    {user.stats?.totalLikesReceived || 0}/500 Likes
                  </span>
                </div>
                <Link href="/profile/edit" className="btn btn-primary">
                  Update Profile
                </Link>
              </div>
            </div>
          )}

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'feed' ? styles.active : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <TrendingUp size={16} />
              Latest News
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'subscriptions' ? styles.active : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <Users size={16} />
              Subscriptions
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'bookmarks' ? styles.active : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              <Bookmark size={16} />
              Bookmarks ({bookmarks.length})
            </button>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton}>
                  <div className="skeleton" style={{ height: 220 }} />
                  <div style={{ padding: 20 }}>
                    <div className="skeleton" style={{ height: 24, marginBottom: 12, width: '80%' }} />
                    <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'feed' && (
                <div className={styles.grid}>
                  {news.length === 0 ? (
                    <div className={styles.emptyState}>
                      <FileText size={48} />
                      <h3>No articles yet</h3>
                      <p>Be the first to publish a news article!</p>
                      <Link href="/create" className="btn btn-primary">
                        <Plus size={18} />
                        Create Article
                      </Link>
                    </div>
                  ) : (
                    news.map((item, index) => (
                      <div
                        key={item._id}
                        className={styles.cardWrapper}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <NewsCard news={item} />
                        <button
                          className={`${styles.bookmarkBtn} ${bookmarks.some(b => b._id === item._id) ? styles.active : ''}`}
                          onClick={() => handleBookmark(item._id)}
                        >
                          <Bookmark
                            size={18}
                            fill={bookmarks.some(b => b._id === item._id) ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'subscriptions' && (
                <div className={styles.grid}>
                  {subscriptionNews.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Users size={48} />
                      <h3>No subscription articles yet</h3>
                      <p>Subscribe to creators to see their latest articles here</p>
                      <Link href="/" className="btn btn-primary">
                        Discover Creators
                      </Link>
                    </div>
                  ) : (
                    subscriptionNews.map((item: NewsItem, index: number) => (
                      <div
                        key={item._id}
                        className={styles.cardWrapper}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <NewsCard news={item} />
                        <button
                          className={`${styles.bookmarkBtn} ${bookmarks.some(b => b._id === item._id) ? styles.active : ''}`}
                          onClick={() => handleBookmark(item._id)}
                        >
                          <Bookmark
                            size={18}
                            fill={bookmarks.some(b => b._id === item._id) ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className={styles.grid}>
                  {bookmarks.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Bookmark size={48} />
                      <h3>No bookmarks yet</h3>
                      <p>Save articles to read later by clicking the bookmark icon</p>
                      <button onClick={() => setActiveTab('feed')} className="btn btn-primary">
                        Browse Articles
                      </button>
                    </div>
                  ) : (
                    bookmarks.map((item, index) => (
                      <div
                        key={item._id}
                        className={styles.cardWrapper}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <NewsCard news={item} />
                        <button
                          className={`${styles.bookmarkBtn} ${styles.active}`}
                          onClick={() => handleBookmark(item._id)}
                        >
                          <Bookmark size={18} fill="currentColor" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

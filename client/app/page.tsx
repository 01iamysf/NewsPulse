'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import NewsCard from './components/NewsCard';
import AdCard from './components/AdCard';
import BreakingTicker from './components/BreakingTicker';
import { useAuth } from './context/AuthContext';
import { api, Ad } from '../lib/api';
import { Search, Filter, TrendingUp, Users, DollarSign, Trophy, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

interface Author {
  _id: string;
  name: string;
  profile?: {
    avatar?: string;
  };
  stats?: {
    followersCount: number;
    articlesPublished: number;
  };
  monetization?: {
    isEnabled: boolean;
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
  isLocked?: boolean;
  isLiked?: boolean;
}

const CATEGORIES = ['All', 'Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'World'];

function HomeContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const categoryParam = searchParams.get('category');

  const [news, setNews] = useState<NewsItem[]>([]);
  const [featured, setFeatured] = useState<NewsItem | null>(null);
  const [breakingNews, setBreakingNews] = useState<NewsItem[]>([]);
  const [topCreators, setTopCreators] = useState<Author[]>([]);
  const [randomAd, setRandomAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync category with URL
  useEffect(() => {
    const currentCat = searchParams.get('category');
    setSelectedCategory(currentCat || 'All');
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [newsData, breakingData, featuredData, creatorsData, adData] = await Promise.all([
        api.news.list({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          limit: 12,
          search: searchQuery || undefined
        }),
        api.news.breaking(),
        api.news.featured(),
        api.users.topCreators(5),
        api.ads.random().catch(() => null)
      ]);

      setNews(newsData.news || []);
      setBreakingNews(breakingData || []);
      setFeatured(featuredData || null);
      setTopCreators(creatorsData || []);
      setRandomAd(adData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.heroSection}>
          <div className={styles.orbs}>
            <div className="orb orb-pink" style={{ width: 400, height: 400, top: -100, left: -100 }} />
            <div className="orb orb-cyan" style={{ width: 300, height: 300, top: 100, right: -50 }} />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.heroTag}>
                <Trophy size={14} />
                Monetized News Platform
              </span>
              <h1 className={styles.heroTitle}>
                <span className="hero-gradient">Stay</span> Informed<br />
                <span className="hero-gradient">Stay</span> Connected
              </h1>
              <p className={styles.heroSubtitle}>
                Follow creators, like articles, and earn from your content
              </p>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <Users size={18} />
                  <span>Follow Creators</span>
                </div>
                <div className={styles.heroStat}>
                  <TrendingUp size={18} />
                  <span>Like & Engage</span>
                </div>
                <div className={styles.heroStat}>
                  <DollarSign size={18} />
                  <span>Monetize Content</span>
                </div>
              </div>
            </div>

            {featured && (
              <div className={styles.featuredWrapper}>
                <NewsCard news={featured} featured />
              </div>
            )}
          </div>
        </div>

        <div className="container">
          {breakingNews.length > 0 && (
            <div className={styles.tickerWrapper}>
              <BreakingTicker news={breakingNews} />
            </div>
          )}

          {topCreators.length > 0 && (
            <div className={styles.creatorsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <Trophy size={24} className={styles.goldIcon} />
                  Top Creators
                </h2>
                <Link href="/creators" className={styles.viewAll}>
                  View All <ArrowRight size={16} />
                </Link>
              </div>
              <div className={styles.creatorsGrid}>
                {topCreators.slice(0, 5).map((creator, index) => (
                  <Link
                    key={creator._id}
                    href={`/profile/${creator._id}`}
                    className={styles.creatorCard}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={styles.creatorRank}>#{index + 1}</div>
                    <div className={styles.creatorAvatar}>
                      {creator.profile?.avatar ? (
                        <img src={creator.profile.avatar} alt={creator.name} />
                      ) : (
                        <span>{creator.name[0]}</span>
                      )}
                    </div>
                    <div className={styles.creatorInfo}>
                      <span className={styles.creatorName}>{creator.name}</span>
                      <span className={styles.creatorStats}>
                        <Users size={12} /> {creator.stats?.followersCount || 0} followers
                      </span>
                    </div>
                    {creator.monetization?.isEnabled && (
                      <div className={styles.monetizedBadge}>
                        <DollarSign size={12} />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div id="explore" className={styles.controls}>
            <div className={styles.searchBox}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.categoryFilter}>
              <Filter size={20} />
              <div className={styles.categoryTabs}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`${styles.categoryTab} ${selectedCategory === cat ? styles.activeTab : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp size={24} />
                {selectedCategory === 'All' ? 'Latest News' : selectedCategory}
              </h2>
              <p className={styles.sectionSubtitle}>
                {news.length} {news.length === 1 ? 'story' : 'stories'} published
              </p>
            </div>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton}>
                  <div className="skeleton" style={{ height: 220 }} />
                  <div style={{ padding: 20 }}>
                    <div className="skeleton" style={{ height: 24, marginBottom: 12, width: '80%' }} />
                    <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📰</div>
              <h3>No news found</h3>
              <p>Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {news.map((item, index) => (
                <div
                  key={item._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <NewsCard news={item} />
                  {randomAd && (index + 1) % 4 === 0 && (
                    <div style={{ marginTop: '2rem' }}>
                      <AdCard ad={randomAd} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!user && news.length > 0 && (
            <div className={styles.limitedViewCTA}>
              <div className={styles.ctaBlur} />
              <div className={styles.ctaContentInline}>
                <h3>Want to see more?</h3>
                <p>Sign up to unlock <strong>unlimited</strong> articles and premium content.</p>
                <Link href="/signup" className="btn btn-primary">
                  Unlock Everything
                </Link>
              </div>
            </div>
          )}

          {!user && (
            <div className={styles.ctaSection}>
              <div className={styles.ctaOrb} />
              <div className={styles.ctaContent}>
                <Trophy size={48} className={styles.ctaIcon} />
                <h2>Start Creating</h2>
                <p>Share your stories, build your audience, and monetize your content when you meet the requirements</p>
                <div className={styles.ctaRequirements}>
                  <span><Users size={16} /> 100 Followers</span>
                  <span><TrendingUp size={16} /> 50 Articles</span>
                  <span><TrendingUp size={16} /> 500 Likes</span>
                </div>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-spinner" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

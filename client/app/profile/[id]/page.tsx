'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import NewsCard from '../../components/NewsCard';
import SubscribeButton from '../../components/SubscribeButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User, MapPin, Globe, Calendar, Users, Heart, Eye, FileText,
  DollarSign, Trophy, Settings, Check, X
} from 'lucide-react';
import styles from '../profile.module.css';
import { resolveImageUrl } from '../../../lib/imageUrl';

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  role: 'user' | 'admin';
  profile: {
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
  };
  stats: {
    followersCount: number;
    followingCount: number;
    totalLikesReceived: number;
    totalViewsReceived: number;
    articlesPublished: number;
  };
  monetization: {
    isEnabled: boolean;
    isEligible: boolean;
    totalEarnings: number;
  };
  createdAt: string;
}

interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  views: number;
  likesCount: number;
  author: UserProfile;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'about'>('articles');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileId = params.id as string;

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (profileId && currentUser) {
      const ownProfile = currentUser._id === profileId || currentUser.id === profileId;
      setIsOwnProfile(ownProfile);
      fetchProfile(profileId);
    }
  }, [profileId, currentUser]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const [userRes, articlesRes] = await Promise.all([
        fetch(`${API_BASE}/users/${userId}`, { credentials: 'include' }),
        fetch(`${API_BASE}/users/${userId}/articles`, { credentials: 'include' })
      ]);

      if (!userRes.ok) {
        throw new Error('User not found');
      }

      const userData = await userRes.json();
      const articlesData = await articlesRes.json();

      setUser(userData.user);
      setArticles(articlesData.articles || []);
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className={styles.loadingPage}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.loadingPage}>
        <h2>User not found</h2>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Back navigation bar */}
        <div className={styles.backBar}>
          <Link href="/" className={styles.backBtn}>
            <span style={{ fontSize: 16 }}>←</span> Back to Home
          </Link>
        </div>

        {/* Cover photo */}
        <div className={styles.coverSection}>
          {user.profile?.coverImage && (
            <img src={resolveImageUrl(user.profile?.coverImage)} alt="Cover" className={styles.coverImage} />
          )}
          <div className={styles.coverOverlay} />
        </div>

        <div className="container">
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {user.profile?.avatar ? (
                  <img src={resolveImageUrl(user.profile?.avatar)} alt={user.name} />
                ) : (
                  <User size={48} />
                )}
              </div>
              <div className={styles.nameSection}>
                <h1>{user.name}</h1>
                {user.monetization?.isEnabled && (
                  <span className={styles.monetizedBadge}>
                    <DollarSign size={14} />
                    Monetized
                  </span>
                )}
              </div>
            </div>

            <div className={styles.headerActions}>
              {isOwnProfile ? (
                <Link href="/profile/edit" className={styles.editBtn}>
                  <Settings size={18} />
                  Edit Profile
                </Link>
              ) : (
                <SubscribeButton creatorId={profileId} />
              )}
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <Users size={20} />
              <span className={styles.statNumber}>{user.stats?.followersCount || 0}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.statItem}>
              <FileText size={20} />
              <span className={styles.statNumber}>{user.stats?.articlesPublished || 0}</span>
              <span className={styles.statLabel}>Articles</span>
            </div>
            <div className={styles.statItem}>
              <Heart size={20} />
              <span className={styles.statNumber}>{user.stats?.totalLikesReceived || 0}</span>
              <span className={styles.statLabel}>Likes</span>
            </div>
            <div className={styles.statItem}>
              <Eye size={20} />
              <span className={styles.statNumber}>{user.stats?.totalViewsReceived || 0}</span>
              <span className={styles.statLabel}>Views</span>
            </div>
          </div>

          <div className={styles.monetizationCard}>
            <div className={styles.monetizationHeader}>
              <Trophy size={24} className={styles.monetizationIcon} />
              <h3>Monetization Status</h3>
            </div>
            {user.monetization?.isEnabled ? (
              <div className={styles.monetizationEnabled}>
                <Check size={20} />
                <div>
                  <p>Your profile is monetized!</p>
                  <span>Total Earnings: ${user.monetization?.totalEarnings?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            ) : user.monetization?.isEligible ? (
              <div className={styles.monetizationPending}>
                <p>You&apos;re eligible for monetization!</p>
                <Link href="/profile/edit" className={styles.enableBtn}>
                  Enable Monetization
                </Link>
              </div>
            ) : (
              <div className={styles.monetizationRequirements}>
                <p>Complete these requirements to enable monetization:</p>
                <div className={styles.requirementsList}>
                  <div className={`${styles.requirement} ${user.stats?.followersCount >= 100 ? styles.met : ''}`}>
                    <span>{user.stats?.followersCount >= 100 ? <Check size={16} /> : <X size={16} />}</span>
                    <span>100 Followers (Current: {user.stats?.followersCount || 0})</span>
                  </div>
                  <div className={`${styles.requirement} ${user.stats?.articlesPublished >= 50 ? styles.met : ''}`}>
                    <span>{user.stats?.articlesPublished >= 50 ? <Check size={16} /> : <X size={16} />}</span>
                    <span>50 Articles (Current: {user.stats?.articlesPublished || 0})</span>
                  </div>
                  <div className={`${styles.requirement} ${user.stats?.totalLikesReceived >= 500 ? styles.met : ''}`}>
                    <span>{user.stats?.totalLikesReceived >= 500 ? <Check size={16} /> : <X size={16} />}</span>
                    <span>500 Likes (Current: {user.stats?.totalLikesReceived || 0})</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'articles' ? styles.active : ''}`}
              onClick={() => setActiveTab('articles')}
            >
              <FileText size={18} />
              Articles ({articles.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'about' ? styles.active : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <User size={18} />
              About
            </button>
          </div>

          {activeTab === 'articles' && (
            <div className={styles.articlesGrid}>
              {articles.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={48} />
                  <h3>No articles yet</h3>
                  <p>{isOwnProfile ? 'Start publishing articles to grow your audience!' : "This user hasn't published any articles yet."}</p>
                  {isOwnProfile && (
                    <Link href="/create" className="btn btn-primary">Create Article</Link>
                  )}
                </div>
              ) : (
                articles.map((article, index) => (
                  <div
                    key={article._id}
                    className={styles.cardWrapper}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NewsCard news={article} />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className={styles.aboutSection}>
              {user.profile?.bio && (
                <div className={styles.bio}>
                  <h3>Bio</h3>
                  <p>{user.profile.bio}</p>
                </div>
              )}

              <div className={styles.infoGrid}>
                {user.profile?.location && (
                  <div className={styles.infoItem}>
                    <MapPin size={18} />
                    <span>{user.profile.location}</span>
                  </div>
                )}
                {user.profile?.website && (
                  <div className={styles.infoItem}>
                    <Globe size={18} />
                    <a href={user.profile.website} target="_blank" rel="noopener noreferrer">
                      {user.profile.website}
                    </a>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <Calendar size={18} />
                  <span>Joined {mounted && user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
                </div>
              </div>

              {user.profile?.socialLinks && Object.values(user.profile.socialLinks || {}).some(v => v) && (
                <div className={styles.socialLinks}>
                  <h3>Social Links</h3>
                  <div className={styles.socialIcons}>
                    {user.profile.socialLinks?.twitter && (
                      <a href={user.profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                        Twitter
                      </a>
                    )}
                    {user.profile.socialLinks?.facebook && (
                      <a href={user.profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                        Facebook
                      </a>
                    )}
                    {user.profile.socialLinks?.instagram && (
                      <a href={user.profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                        Instagram
                      </a>
                    )}
                    {user.profile.socialLinks?.linkedin && (
                      <a href={user.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

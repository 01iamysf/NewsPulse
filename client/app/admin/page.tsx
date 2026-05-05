'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Plus, Edit2, Trash2, Eye, TrendingUp, Users, FileText, Zap,
  X, Image as ImageIcon, Tag, DollarSign, CreditCard, Shield,
  CheckCircle, XCircle, Clock, ExternalLink, Activity
} from 'lucide-react';
import styles from './admin.module.css';
import { resolveImageUrl } from '../../lib/imageUrl';

interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  tags?: string[];
  isBreaking: boolean;
  isPremium: boolean;
  views: number;
  author?: { name: string };
  createdAt: string;
}

interface Stats {
  totalNews: number;
  totalViews: number;
  totalUsers: number;
  breakingCount: number;
  totalEarnings?: number;
  totalWithdrawn?: number;
  categoryStats: { _id: string; count: number }[];
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
  stats: {
    followersCount: number;
    articlesPublished: number;
  };
  monetization: {
    totalEarnings: number;
    withdrawnAmount: number;
  };
  createdAt: string;
}

interface WithdrawalItem {
  _id: string;
  user: { name: string; email: string };
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paymentMethod: string;
  createdAt: string;
}

interface AdItem {
  _id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  cpm: number;
  stats: { views: number; clicks: number };
  isActive: boolean;
}

const CATEGORIES = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'World'];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'news' | 'users' | 'withdrawals' | 'ads' | 'stats'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    category: 'Technology',
    tags: '',
    isBreaking: false,
    isPremium: true,
  });

  const [adFormData, setAdFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    cpm: 10.0,
    isActive: true
  });

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.users.updateStatus(id, !currentStatus);
      showToast(`User ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update user', 'error');
    }
  };

  const updateWithdrawalStatus = async (id: string, status: string) => {
    try {
      await api.earnings.updateStatus(id, { status });
      showToast(`Withdrawal ${status}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update withdrawal', 'error');
    }
  };

  const openAdModal = (ad?: AdItem) => {
    if (ad) {
      setEditingAd(ad);
      setAdFormData({
        title: ad.title,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl,
        cpm: ad.cpm,
        isActive: ad.isActive
      });
    } else {
      setEditingAd(null);
      setAdFormData({
        title: '',
        imageUrl: '',
        targetUrl: '',
        cpm: 10.0,
        isActive: true
      });
    }
    setShowAdModal(true);
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await api.ads.update(editingAd._id, adFormData);
        showToast('Ad updated successfully', 'success');
      } else {
        await api.ads.create(adFormData);
        showToast('Ad created successfully', 'success');
      }
      setShowAdModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleAdDelete = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    try {
      await api.ads.delete(id);
      showToast('Ad deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete ad', 'error');
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'news') {
        const data = await api.news.list({ limit: 100 }) as { news: NewsItem[] };
        setNews(data.news);
      } else if (activeTab === 'users') {
        const data = await api.users.adminList() as { users: UserItem[] };
        setUsers(data.users);
      } else if (activeTab === 'withdrawals') {
        const data = await api.earnings.adminList() as { withdrawals: WithdrawalItem[] };
        setWithdrawals(data.withdrawals);
      } else if (activeTab === 'ads') {
        const data = await api.ads.list() as AdItem[];
        setAds(data);
      } else if (activeTab === 'stats') {
        const data = await api.news.stats() as Stats;
        setStats(data);
      }
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item);
      setFormData({
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        imageUrl: item.imageUrl,
        category: item.category,
        tags: item.tags?.join(', ') || '',
        isBreaking: item.isBreaking,
        isPremium: item.isPremium,
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        category: 'Technology',
        tags: '',
        isBreaking: false,
        isPremium: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editingNews) {
        await api.news.update(editingNews._id, payload);
        showToast('News updated successfully', 'success');
      } else {
        await api.news.create(payload);
        showToast('News created successfully', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return;
    try {
      await api.news.delete(id);
      showToast('News deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
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
        <Link href="/" className={styles.backBtn}>
          <span style={{ fontSize: 18 }}>←</span> Back to Home
        </Link>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          {activeTab === 'news' && (
            <button className="btn btn-primary" onClick={() => openModal()}>
              <Plus size={18} />
              Add News
            </button>
          )}
          {activeTab === 'ads' && (
            <button className="btn btn-primary" onClick={() => openAdModal()}>
              <Plus size={18} />
              New Campaign
            </button>
          )}
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'news' ? styles.active : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <FileText size={18} />
            News
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Users
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'withdrawals' ? styles.active : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            <DollarSign size={18} />
            Payouts
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'ads' ? styles.active : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            <Activity size={18} />
            Ads
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <TrendingUp size={18} />
            Stats
          </button>
        </div>

        {activeTab === 'news' && (
          <div className={styles.tableWrapper}>
            {loading ? (
              <div className="skeleton-grid">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map(item => (
                    <tr key={item._id}>
                      <td className={styles.titleCell}>
                        <img src={resolveImageUrl(item.imageUrl)} alt="" className={styles.thumb} />
                        <span>{item.title}</span>
                      </td>
                      <td><span className={`badge badge-${item.category?.toLowerCase()}`}>{item.category}</span></td>
                      <td>
                        {item.isBreaking && <span className="badge badge-breaking">Breaking</span>}
                        {item.isPremium && <span className="badge badge-premium">Premium</span>}
                      </td>
                      <td><Eye size={14} /> {item.views}</td>
                      <td>
                        <div className={styles.actions}>
                          <button onClick={() => openModal(item)} className={styles.editBtn}><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(item._id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Earnings</th>
                  <th>Articles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className={styles.userCell}>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </div>
                    </td>
                    <td>
                      {u.isActive ? 
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={12} /> Active
                        </span> : 
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> Inactive
                        </span>
                      }
                    </td>
                    <td><span style={{ fontWeight: 600 }}>${u.monetization.totalEarnings.toFixed(2)}</span></td>
                    <td>{u.stats.articlesPublished}</td>
                    <td>
                      <button 
                        onClick={() => toggleUserStatus(u._id, u.isActive)}
                        className={u.isActive ? styles.deleteBtn : styles.editBtn}
                        style={{ width: '120px' }}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w._id}>
                    <td>{w.user.name}</td>
                    <td><strong>${w.amount.toFixed(2)}</strong></td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[w.status]}`}>
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td>
                      {w.status === 'pending' && (
                        <div className={styles.actions}>
                          <button onClick={() => updateWithdrawalStatus(w._id, 'approved')} title="Approve"><CheckCircle size={18} /></button>
                          <button onClick={() => updateWithdrawalStatus(w._id, 'rejected')} title="Reject"><XCircle size={18} /></button>
                        </div>
                      )}
                      {w.status === 'approved' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateWithdrawalStatus(w._id, 'paid')}>
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className={styles.adGrid}>
            {ads.map(ad => (
              <div key={ad._id} className={styles.adCard}>
                <img src={resolveImageUrl(ad.imageUrl)} alt="" className={styles.adThumb} />
                <div className={styles.adInfo}>
                  <h3>{ad.title}</h3>
                  <div className={styles.adStats}>
                    <span><Eye size={12} /> {ad.stats.views} views</span>
                    <span><TrendingUp size={12} /> {((ad.stats.clicks / (ad.stats.views || 1)) * 100).toFixed(1)}% CTR</span>
                  </div>
                  <div className={styles.adActions}>
                    <button onClick={() => openAdModal(ad)} className={styles.editBtn}><Edit2 size={14} /></button>
                    <button onClick={() => handleAdDelete(ad._id)} className={styles.deleteBtn}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className={styles.statsContainer}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Users size={32} />
                <span className={styles.statValue}>{stats.totalUsers}</span>
                <span className={styles.statLabel}>Total Users</span>
              </div>
              <div className={styles.statCard}>
                <FileText size={32} />
                <span className={styles.statValue}>{stats.totalNews}</span>
                <span className={styles.statLabel}>Total Articles</span>
              </div>
              <div className={styles.statCard}>
                <DollarSign size={32} />
                <span className={styles.statValue}>${(stats.totalEarnings || 0).toFixed(2)}</span>
                <span className={styles.statLabel}>Total Platform Revenue</span>
              </div>
              <div className={styles.statCard}>
                <CreditCard size={32} />
                <span className={styles.statValue}>${(stats.totalWithdrawn || 0).toFixed(2)}</span>
                <span className={styles.statLabel}>Total Paid Out</span>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingNews ? 'Edit News' : 'Create News'}</h2>
                <button onClick={() => setShowModal(false)} className={styles.closeBtn}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    className="input-field"
                    rows={3}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Content</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    rows={6}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label><ImageIcon size={14} /> Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    required
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label><Tag size={14} /> Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={e => setFormData({ ...formData, tags: e.target.value })}
                      className="input-field"
                      placeholder="ai, tech, innovation"
                    />
                  </div>
                </div>
                <div className={styles.checkboxes}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.isBreaking}
                      onChange={e => setFormData({ ...formData, isBreaking: e.target.checked })}
                    />
                    <span>Breaking News</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.isPremium}
                      onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                    />
                    <span>Premium Content</span>
                  </label>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNews ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAdModal && (
          <div className="modal-overlay" onClick={() => setShowAdModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingAd ? 'Edit Ad Campaign' : 'New Ad Campaign'}</h2>
                <button onClick={() => setShowAdModal(false)} className={styles.closeBtn}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label>Campaign Name</label>
                  <input
                    type="text"
                    value={adFormData.title}
                    onChange={e => setAdFormData({ ...adFormData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Banner Image URL</label>
                  <input
                    type="url"
                    value={adFormData.imageUrl}
                    onChange={e => setAdFormData({ ...adFormData, imageUrl: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Destination URL</label>
                  <input
                    type="url"
                    value={adFormData.targetUrl}
                    onChange={e => setAdFormData({ ...adFormData, targetUrl: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>CPM Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adFormData.cpm}
                      onChange={e => setAdFormData({ ...adFormData, cpm: parseFloat(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Status</label>
                    <select
                      value={adFormData.isActive ? 'true' : 'false'}
                      onChange={e => setAdFormData({ ...adFormData, isActive: e.target.value === 'true' })}
                      className="input-field"
                    >
                      <option value="true">Active</option>
                      <option value="false">Paused</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowAdModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingAd ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

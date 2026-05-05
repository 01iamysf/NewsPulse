'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User, Mail, MapPin, Globe, Save, ArrowLeft, DollarSign, Trophy, Check, X,
  CreditCard, Building, Hash
} from 'lucide-react';
import styles from './edit.module.css';
import { resolveImageUrl } from '../../../lib/imageUrl';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'monetization' | 'payment'>('profile');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    coverImage: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: ''
    }
  });

  const [paymentInfo, setPaymentInfo] = useState({
    paypalEmail: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        website: user.profile?.website || '',
        avatar: user.profile?.avatar || '',
        coverImage: user.profile?.coverImage || '',
        socialLinks: user.profile?.socialLinks || {
          twitter: '',
          facebook: '',
          instagram: '',
          linkedin: ''
        }
      });
      setPaymentInfo(user.paymentInfo || {
        paypalEmail: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, [field]: data.url }));
      showToast(`${field === 'avatar' ? 'Avatar' : 'Cover image'} uploaded!`, 'success');
    } catch (err) {
      showToast('Failed to upload image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          profile: {
            bio: formData.bio,
            location: formData.location,
            website: formData.website,
            avatar: formData.avatar,
            coverImage: formData.coverImage,
            socialLinks: formData.socialLinks
          }
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');

      await refreshUser();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentInfo })
      });

      if (!response.ok) throw new Error('Failed to update payment info');

      await refreshUser();
      showToast('Payment information saved!', 'success');
    } catch (err) {
      showToast('Failed to save payment info', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMonetization = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/users/monetization/enable`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'Failed to enable monetization', 'error');
        return;
      }

      await refreshUser();
      showToast('Monetization enabled! Start earning from your content.', 'success');
    } catch (err) {
      showToast('Failed to enable monetization', 'error');
    } finally {
      setLoading(false);
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
        <div className="container" style={{ maxWidth: 800 }}>
          <div className={styles.header}>
            <Link href={`/profile/${user._id || user.id}`} className={styles.backBtn}>
              <ArrowLeft size={16} />
              Back to Profile
            </Link>
            <h1>Edit Profile</h1>
            <p>Manage your public profile information and settings</p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              Profile
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'monetization' ? styles.active : ''}`}
              onClick={() => setActiveTab('monetization')}
            >
              <DollarSign size={16} />
              Monetization
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'payment' ? styles.active : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <CreditCard size={16} />
              Payment
            </button>
          </div>

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className={styles.form}>
              {/* Basic Info */}
              <div className={styles.section}>
                <h3>Basic Information</h3>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Display Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your display name"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className={styles.field} style={{ marginTop: 20 }}>
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className={styles.field} style={{ marginTop: 20 }}>
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Profile Images - side by side */}
              <div className={styles.section}>
                <h3>Profile Images</h3>
                <div className={styles.imageUploaders}>
                  <div className={styles.imageUploader}>
                    <label>Avatar</label>
                    <div className={styles.imagePreviewAvatar}>
                      {formData.avatar ? (
                        <img src={resolveImageUrl(formData.avatar)} alt="Avatar" />
                      ) : (
                        <User size={40} />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.imageUploader}>
                    <label>Cover Image</label>
                    <div className={styles.imagePreviewCover}>
                      {formData.coverImage ? (
                        <img src={resolveImageUrl(formData.coverImage)} alt="Cover" />
                      ) : (
                        <span>No cover image</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'coverImage')}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links - 2x2 grid */}
              <div className={styles.section}>
                <h3>Social Links</h3>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Twitter / X</label>
                    <input
                      type="url"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Facebook</label>
                    <input
                      type="url"
                      name="socialLinks.facebook"
                      value={formData.socialLinks.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Instagram</label>
                    <input
                      type="url"
                      name="socialLinks.instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <div className="loading-spinner" style={{ width: 20, height: 20 }} /> : <Save size={18} />}
                Save Changes
              </button>
            </form>
          )}

          {activeTab === 'monetization' && (
            <div className={styles.monetizationSection}>
              <div className={styles.monetizationCard}>
                <div className={styles.cardHeader}>
                  <Trophy size={32} className={styles.trophyIcon} />
                  <h2>Monetization Program</h2>
                  <p>Start earning money from your content by enabling monetization</p>
                </div>

                {user.monetization.isEnabled ? (
                  <div className={styles.enabledStatus}>
                    <div className={styles.enabledBadge}>
                      <Check size={24} />
                      <span>Monetization Active</span>
                    </div>
                    <p>Congratulations! You&apos;re earning from your content.</p>
                    <div className={styles.earningsSummary}>
                      <div className={styles.earningItem}>
                        <span>Total Earnings</span>
                        <strong>${user.monetization.totalEarnings.toFixed(2)}</strong>
                      </div>
                      <div className={styles.earningItem}>
                        <span>Pending</span>
                        <strong>${user.monetization.pendingEarnings.toFixed(2)}</strong>
                      </div>
                      <div className={styles.earningItem}>
                        <span>Withdrawn</span>
                        <strong>${user.monetization.withdrawnAmount.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ) : user.monetization.isEligible ? (
                  <div className={styles.eligibleStatus}>
                    <div className={styles.eligibleBadge}>
                      <Trophy size={24} />
                      <span>You&apos;re Eligible!</span>
                    </div>
                    <p>You meet all the requirements. Enable monetization to start earning.</p>
                    <button onClick={handleEnableMonetization} className={styles.enableBtn} disabled={loading}>
                      <DollarSign size={20} />
                      Enable Monetization
                    </button>
                  </div>
                ) : (
                  <div className={styles.requirementsCard}>
                    <h3>Requirements to Enable Monetization</h3>
                    <div className={styles.requirementsList}>
                      <div className={`${styles.requirement} ${user.stats.followersCount >= 100 ? styles.met : ''}`}>
                        {user.stats.followersCount >= 100 ? <Check size={20} /> : <X size={20} />}
                        <div>
                          <strong>100 Followers</strong>
                          <span>Current: {user.stats.followersCount} followers</span>
                        </div>
                      </div>
                      <div className={`${styles.requirement} ${user.stats.articlesPublished >= 50 ? styles.met : ''}`}>
                        {user.stats.articlesPublished >= 50 ? <Check size={20} /> : <X size={20} />}
                        <div>
                          <strong>50 Articles Published</strong>
                          <span>Current: {user.stats.articlesPublished} articles</span>
                        </div>
                      </div>
                      <div className={`${styles.requirement} ${user.stats.totalLikesReceived >= 500 ? styles.met : ''}`}>
                        {user.stats.totalLikesReceived >= 500 ? <Check size={20} /> : <X size={20} />}
                        <div>
                          <strong>500 Total Likes</strong>
                          <span>Current: {user.stats.totalLikesReceived} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className={styles.form}>
              <div className={styles.section}>
                <h3>Payment Information</h3>
                <p className={styles.sectionDesc}>Add your payment details to receive withdrawals. You can choose between PayPal or Bank Transfer.</p>

                <div className={styles.paymentMethods}>
                  <div className={styles.field}>
                    <label>PayPal Email</label>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={paymentInfo.paypalEmail}
                      onChange={handlePaymentChange}
                      placeholder="your@paypal.com"
                    />
                  </div>

                  <div className={styles.divider}>
                    <span>OR</span>
                  </div>

                  <div className={styles.field}>
                    <label>Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={paymentInfo.bankName}
                      onChange={handlePaymentChange}
                      placeholder="Bank name"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Account Holder Name</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={paymentInfo.accountHolderName}
                      onChange={handlePaymentChange}
                      placeholder="Name on account"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={paymentInfo.accountNumber}
                      onChange={handlePaymentChange}
                      placeholder="Account number"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <div className="loading-spinner" style={{ width: 20, height: 20 }} /> : <Save size={18} />}
                Save Payment Info
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

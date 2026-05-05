'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ArrowLeft, Save, Image, Tag, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'World'];

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  tags: string;
  isBreaking: boolean;
  isPremium: boolean;
}

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    category: 'Technology',
    tags: '',
    isBreaking: false,
    isPremium: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const newsId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (newsId && user) {
      fetchArticle();
    }
  }, [newsId, user]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/news/${newsId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Article not found');
      }

      const data = await response.json();

      // Check ownership
      const isOwner = user?._id === data.author?._id || user?.id === data.author?._id;
      const isAdmin = user?.role === 'admin';
      if (!isOwner && !isAdmin) {
        showToast('You are not authorized to edit this article', 'error');
        router.push(`/news/${newsId}`);
        return;
      }

      setFormData({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        imageUrl: data.imageUrl || '',
        category: data.category || 'Technology',
        tags: (data.tags || []).join(', '),
        isBreaking: data.isBreaking || false,
        isPremium: data.isPremium || false
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to load article', 'error');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update article');
      }

      showToast('Article updated successfully!', 'success');
      router.push(`/news/${newsId}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update article', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--background)' }}>
        <div className="container" style={{ maxWidth: 900, padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link
              href={`/news/${newsId}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}
            >
              <ArrowLeft size={20} />
              Back to Article
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Edit Article</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>Update your article content and settings</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
            <div>
              {/* Title */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a compelling title"
                  className="input-field"
                  style={{ width: '100%' }}
                />
                {errors.title && (
                  <span style={{ color: 'var(--error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <AlertCircle size={14} /> {errors.title}
                  </span>
                )}
              </div>

              {/* Excerpt */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Write a short summary (2-3 sentences)"
                  rows={3}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
                {errors.excerpt && (
                  <span style={{ color: 'var(--error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <AlertCircle size={14} /> {errors.excerpt}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your article content here..."
                  rows={18}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }}
                />
                {errors.content && (
                  <span style={{ color: 'var(--error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <AlertCircle size={14} /> {errors.content}
                  </span>
                )}
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 8 }}>
                  <Image size={16} /> Image URL *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="input-field"
                  style={{ width: '100%' }}
                />
                {errors.imageUrl && (
                  <span style={{ color: 'var(--error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <AlertCircle size={14} /> {errors.imageUrl}
                  </span>
                )}
                {formData.imageUrl && (
                  <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', maxHeight: 200 }}>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      style={{ width: '100%', height: 200, objectFit: 'cover' }}
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ position: 'sticky', top: 100 }}>
                <div style={{ background: 'var(--card-background)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Settings</h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="input-field" style={{ width: '100%' }}>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                      <Tag size={14} /> Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="news, breaking, trending"
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'block' }}>Separate tags with commas</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        name="isBreaking"
                        checked={formData.isBreaking}
                        onChange={handleChange}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontWeight: 500 }}>Breaking News</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        name="isPremium"
                        checked={formData.isPremium}
                        onChange={handleChange}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontWeight: 500 }}>Premium Content</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: 8 }} disabled={saving}>
                  {saving ? (
                    <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>

                <Link
                  href={`/news/${newsId}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 8, textDecoration: 'none' }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, Image, Tag, AlertCircle } from 'lucide-react';
import styles from './create.module.css';

const CATEGORIES = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'World'];

export default function CreateNewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create article');
      }

      showToast('Article created successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to create article', 'error');
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
        <div className="container">
          <div className={styles.header}>
            <Link href="/dashboard" className={styles.backBtn}>
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <h1>Create New Article</h1>
            <p>Share your story with the world</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.mainContent}>
              <div className={styles.section}>
                <h3>Basic Information</h3>
                
                <div className={styles.field}>
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a compelling title"
                    className={errors.title ? styles.inputError : ''}
                  />
                  {errors.title && <span className={styles.errorText}><AlertCircle size={14} /> {errors.title}</span>}
                </div>

                <div className={styles.field}>
                  <label>Excerpt *</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Write a short summary (2-3 sentences)"
                    rows={3}
                    className={errors.excerpt ? styles.inputError : ''}
                  />
                  {errors.excerpt && <span className={styles.errorText}><AlertCircle size={14} /> {errors.excerpt}</span>}
                </div>

                <div className={styles.field}>
                  <label>Content *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your article content here..."
                    rows={15}
                    className={`${styles.contentArea} ${errors.content ? styles.inputError : ''}`}
                  />
                  {errors.content && <span className={styles.errorText}><AlertCircle size={14} /> {errors.content}</span>}
                </div>
              </div>

              <div className={styles.section}>
                <h3><Image size={18} /> Media</h3>
                
                <div className={styles.field}>
                  <label>Image URL *</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={errors.imageUrl ? styles.inputError : ''}
                  />
                  {errors.imageUrl && <span className={styles.errorText}><AlertCircle size={14} /> {errors.imageUrl}</span>}
                  {formData.imageUrl && (
                    <div className={styles.imagePreview}>
                      <img src={formData.imageUrl} alt="Preview" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.section}>
                <h3>Settings</h3>
                
                <div className={styles.field}>
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label><Tag size={14} /> Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="news, breaking, trending"
                  />
                  <span className={styles.hint}>Separate tags with commas</span>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="isBreaking"
                      checked={formData.isBreaking}
                      onChange={handleChange}
                    />
                    <span>Breaking News</span>
                  </label>
                  
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={formData.isPremium}
                      onChange={handleChange}
                    />
                    <span>Premium Content</span>
                  </label>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                ) : (
                  <>
                    <Save size={18} />
                    Publish Article
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

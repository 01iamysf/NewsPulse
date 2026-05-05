'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import styles from './auth.module.css';

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      showToast('Account created successfully!', 'success');
      await login(formData.email, formData.password);
      router.push('/profile/edit');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>NP</span>
            <span className={styles.logoText}>NewsPulse</span>
          </Link>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join NewsPulse and start creating content</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              />
            </div>
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
            </div>
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              />
            </div>
            {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <div className="loading-spinner" style={{ width: 20, height: 20 }} />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Sign In
            </Link>
          </p>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

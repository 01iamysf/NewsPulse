'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Plus, LayoutDashboard, User, Shield } from 'lucide-react';
import styles from './Header.module.css';
import { resolveImageUrl } from '../../lib/imageUrl';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;
  const isDashboard = pathname === '/dashboard';
  const isProfile = pathname?.startsWith('/profile');
  const isCreate = pathname === '/create';
  const isAdmin = pathname === '/admin';

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>NP</span>
          <span className={styles.logoText}>NewsPulse</span>
        </Link>

        <nav className={styles.nav}>
          {/* Category navigation removed as per request */}
        </nav>

        <div className={styles.actions}>
          {!loading && (
            <>
              {user ? (
                <div className={styles.userMenu}>
                  {/* Dashboard */}
                  <Link
                    href="/dashboard"
                    className={`${styles.navBtn} ${isDashboard ? styles.active : ''}`}
                    title="Dashboard"
                  >
                    <LayoutDashboard size={18} />
                  </Link>

                  {/* Profile avatar or icon */}
                  <Link
                    href={`/profile/${user._id || user.id}`}
                    className={`${styles.avatarBtn} ${isProfile ? styles.active : ''}`}
                    title="My Profile"
                  >
                    {user.profile?.avatar ? (
                      <img
                        src={resolveImageUrl(user.profile.avatar)}
                        alt={user.name}
                        className={styles.avatarImg}
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </Link>

                  {/* Admin button (only for admins) */}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`${styles.adminBtn} ${isAdmin ? styles.active : ''}`}
                      title="Admin Panel"
                    >
                      <Shield size={18} />
                    </Link>
                  )}

                  {/* Create article */}
                  <Link
                    href="/create"
                    className={`${styles.createBtn} ${isCreate ? styles.createBtnActive : ''}`}
                    title="Create Article"
                  >
                    <Plus size={18} />
                  </Link>

                  {/* Logout */}
                  <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/login" className="btn btn-secondary btn-sm">
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <nav className={styles.mobileNav}>
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          {user && (
            <>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link href={`/profile/${user._id || user.id}`} onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              <Link href="/create" onClick={() => setIsMenuOpen(false)}>Create Article</Link>
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
              )}
            </>
          )}
        </nav>
        {!loading && (
          <div className={styles.mobileAuth}>
            {user ? (
              <button onClick={handleLogout} className="btn btn-danger">
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                <Link href="/signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

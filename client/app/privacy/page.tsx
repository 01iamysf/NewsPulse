'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../about/info.module.css';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Privacy <span className="text-gradient">Policy</span></h1>
            <p className={styles.subtitle}>
              Your privacy is our priority. Learn how we protect your data and maintain your trust.
            </p>
          </div>

          <div className={styles.contentSection}>
            <h2>Data Collection</h2>
            <p>
              We collect minimal information required to provide you with a personalized experience. This includes your email address, name, and profile preferences when you create an account.
            </p>
            
            <h2>How We Use Your Data</h2>
            <p>
              Your data is used to deliver content, process creator earnings, and improve our services. We never sell your personal information to third parties.
            </p>

            <h2>Security</h2>
            <p>
              We implement industry-standard encryption and security protocols to safeguard your account. Our database is protected by multi-layered firewalls and access controls.
            </p>

            <h2>Cookies</h2>
            <p>
              We use essential cookies to maintain your session and remember your preferences. You can manage cookie settings in your browser at any time.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

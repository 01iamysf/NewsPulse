'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../about/info.module.css';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Terms of <span className="text-gradient">Service</span></h1>
            <p className={styles.subtitle}>
              The rules and guidelines for using the NewsPulse platform.
            </p>
          </div>

          <div className={styles.contentSection}>
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing NewsPulse, you agree to comply with these terms. If you do not agree, please refrain from using the platform.
            </p>
            
            <h2>Content Ownership</h2>
            <p>
              Creators retain ownership of their content but grant NewsPulse a license to display and distribute it. Users are responsible for the legality of their posts.
            </p>

            <h2>Monetization</h2>
            <p>
              Earnings are subject to our verification process. We reserve the right to withhold payments in cases of fraud or violation of our community guidelines.
            </p>

            <h2>Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate our terms or engage in harmful activities toward the community.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

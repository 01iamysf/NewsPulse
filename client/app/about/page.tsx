'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Globe, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import styles from './info.module.css';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Redefining <span className="text-gradient">Digital News</span></h1>
            <p className={styles.subtitle}>
              NewsPulse is a decentralized-inspired content economy where creators own their audience and readers find quality in a world of noise.
            </p>
          </div>

          <div className={styles.glassGrid}>
            <div className={styles.glassCard}>
              <Globe className={styles.icon} />
              <h3>Global Reach</h3>
              <p>Connecting stories from every corner of the planet to a worldwide audience of millions.</p>
            </div>
            <div className={styles.glassCard}>
              <Users className={styles.icon} />
              <h3>Creator First</h3>
              <p>We provide the tools and monetization required for independent journalism to thrive.</p>
            </div>
            <div className={styles.glassCard}>
              <Shield className={styles.icon} />
              <h3>Trusted Source</h3>
              <p>Advanced AI-driven verification ensures that our platform remains a bastion of truth.</p>
            </div>
          </div>

          <div className={styles.contentSection}>
            <h2>Our Mission</h2>
            <p>
              In an era of misinformation and declining trust, NewsPulse was founded on a simple principle: Quality should be rewarded. We've built a platform that combines state-of-the-art technology with the timeless value of great storytelling.
            </p>
            <p>
              By leveraging a fair monetization model, we empower creators to focus on what they do best—uncovering the stories that matter—while ensuring readers have access to premium, high-fidelity content.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import styles from '../about/info.module.css';

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Get in <span className="text-gradient">Touch</span></h1>
            <p className={styles.subtitle}>
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className={styles.glassGrid}>
            <div className={styles.glassCard}>
              <Mail className={styles.icon} />
              <h3>Email Us</h3>
              <p>support@newspulse.com</p>
            </div>
            <div className={styles.glassCard}>
              <MessageSquare className={styles.icon} />
              <h3>Live Chat</h3>
              <p>Available 24/7 for premium members.</p>
            </div>
            <div className={styles.glassCard}>
              <MapPin className={styles.icon} />
              <h3>Office</h3>
              <p>Silicon Valley, California, USA</p>
            </div>
          </div>

          <div className={styles.contentSection}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => e.preventDefault()}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <input type="text" placeholder="Your Name" className="input-field" required />
                <input type="email" placeholder="Email Address" className="input-field" required />
              </div>
              <input type="text" placeholder="Subject" className="input-field" required />
              <textarea placeholder="Your Message" className="input-field" style={{ minHeight: '150px' }} required></textarea>
              <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

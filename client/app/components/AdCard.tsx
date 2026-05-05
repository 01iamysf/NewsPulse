'use client';

import { ExternalLink } from 'lucide-react';
import styles from './AdCard.module.css';

interface AdCardProps {
  ad: {
    _id: string;
    title: string;
    imageUrl: string;
    targetUrl: string;
  };
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <a 
      href={`http://localhost:5000/api/ads/click/${ad._id}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className={styles.adCard}
    >
      <div className={styles.imageWrapper}>
        <img src={ad.imageUrl} alt={ad.title} className={styles.image} />
        <div className={styles.overlay} />
        <span className={styles.sponsored}>SPONSORED</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{ad.title}</h3>
        <span className={styles.cta}>
          Learn More <ExternalLink size={14} />
        </span>
      </div>
    </a>
  );
}

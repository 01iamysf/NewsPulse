'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import styles from './BreakingTicker.module.css';

interface NewsItem {
  _id: string;
  title: string;
}

export default function BreakingTicker({ news }: { news: NewsItem[] }) {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (news.length > 0) {
      setItems([...news, ...news]);
    }
  }, [news]);

  if (news.length === 0) return null;

  return (
    <div className={styles.ticker}>
      <div className={styles.label}>
        <Zap size={16} />
        <span>Breaking</span>
      </div>
      <div className={styles.track}>
        <div className={styles.content}>
          {items.map((item, idx) => (
            <span key={`${item._id}-${idx}`} className={styles.item}>
              {item.title}
              <span className={styles.separator}>•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

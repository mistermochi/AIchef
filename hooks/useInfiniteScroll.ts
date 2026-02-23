
import { useState, useEffect, useRef } from 'react';

/**
 * @hook useInfiniteScroll
 * @description Manages local pagination (display limit) and remote loading triggers for long lists.
 * ⚡ Optimization: Consolidates local and remote infinite scroll logic into a single observer.
 *
 * @param {any[]} items - The currently loaded items.
 * @param {number} pageSize - How many items to add to the display limit at a time.
 * @param {Function} onLoadMore - Optional callback to trigger remote data loading.
 */
export function useInfiniteScroll(items: any[], pageSize: number = 20, onLoadMore?: () => void) {
  const [displayLimit, setDisplayLimit] = useState(pageSize);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset display limit when the underlying items change (e.g. search, new data)
  useEffect(() => {
    setDisplayLimit(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (displayLimit < items.length) {
            // We have more items locally, just increase the display limit
            setDisplayLimit(prev => Math.min(prev + pageSize, items.length));
          } else if (onLoadMore) {
            // We've reached the end of local items, trigger remote load
            onLoadMore();
          }
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayLimit, items.length, pageSize, onLoadMore]);

  return { displayLimit, setDisplayLimit, observerTarget };
}

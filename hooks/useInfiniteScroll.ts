
import { useState, useEffect, useRef } from 'react';

export function useInfiniteScroll(items: any[], pageSize: number = 20) {
  const [displayLimit, setDisplayLimit] = useState(pageSize);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset display limit when the underlying data source changes (e.g., search, filter, or refresh)
  useEffect(() => {
    setDisplayLimit(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < items.length) {
          setDisplayLimit(prev => Math.min(prev + pageSize, items.length));
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayLimit, items.length, pageSize]);

  return { displayLimit, observerTarget };
}

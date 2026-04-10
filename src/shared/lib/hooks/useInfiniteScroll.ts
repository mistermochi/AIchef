
import { useState, useEffect, useRef } from 'react';

/**
 * @hook useInfiniteScroll
 * @description Manages local pagination (display limit) and remote loading triggers for long lists.
 * ⚡ Optimization: Consolidates local and remote infinite scroll logic into a single observer.
 * ⚡ Performance Boost: Uses refs and functional updates to stabilize the IntersectionObserver,
 * preventing unnecessary teardown/setup cycles during scroll.
 *
 * @param {any[]} items - The currently loaded items.
 * @param {number} pageSize - How many items to add to the display limit at a time.
 * @param {Function} onLoadMore - Optional callback to trigger remote data loading.
 */
export function useInfiniteScroll(items: any[], pageSize: number = 20, onLoadMore?: () => void) {
  const [displayLimit, setDisplayLimit] = useState(pageSize);
  const observerTarget = useRef<HTMLDivElement>(null);

  // ⚡ Use refs for values that change frequently but shouldn't trigger observer recreation
  const itemsLengthRef = useRef(items.length);
  const onLoadMoreRef = useRef(onLoadMore);
  const displayLimitRef = useRef(displayLimit);

  // Sync refs on every render
  useEffect(() => {
    itemsLengthRef.current = items.length;
    onLoadMoreRef.current = onLoadMore;
    displayLimitRef.current = displayLimit;
  });

  // Reset display limit when the underlying items change (e.g. search, new data)
  useEffect(() => {
    setDisplayLimit(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Check local limit using ref to avoid observer re-initialization
          if (displayLimitRef.current < itemsLengthRef.current) {
            // We have more items locally, increase the display limit
            setDisplayLimit(prev => Math.min(prev + pageSize, itemsLengthRef.current));
          } else if (onLoadMoreRef.current) {
            // We've reached the end of local items, trigger remote load
            // Call side-effect OUTSIDE of state updater
            onLoadMoreRef.current();
          }
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [pageSize]); // Only pageSize determines the logic of the observer

  return { displayLimit, setDisplayLimit, observerTarget };
}

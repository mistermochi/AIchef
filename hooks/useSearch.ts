
import { useState, useMemo } from 'react';

export function useSearch<T>(items: T[], filterFn: (item: T, term: string) => boolean) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return items;
    return items.filter(item => filterFn(item, term));
  }, [items, searchTerm, filterFn]);

  return { searchTerm, setSearchTerm, filteredItems };
}

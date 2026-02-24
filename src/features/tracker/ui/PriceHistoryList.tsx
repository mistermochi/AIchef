
import React, { useMemo } from 'react';
import { History, Loader2, CalendarDays } from 'lucide-react';
import { Purchase, Product } from '../../../entities/tracker/model/types';
import { getPerItemPrice } from '../../../entities/tracker/model/trackerModel';
import { CATEGORY_EMOJIS } from '../../../shared/config/app';
import { fmtCurrency } from '../../../shared/lib/format';
import { fmtDate, toDate } from '../../../shared/lib/date';
import { SectionCard, EmptyState, ListRow } from '../../../shared/ui';
import { useInfiniteScroll } from '../../../shared/lib/hooks/useInfiniteScroll';

interface PriceHistoryListProps {
  purchases: Purchase[];
  products: Product[];
  onEdit: (id: string) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const PAGE_SIZE = 20;

export const PriceHistoryList: React.FC<PriceHistoryListProps> = ({ 
  purchases, 
  onEdit, 
  hasMore = false, 
  onLoadMore 
}) => {
  // ⚡ Optimization: Unified infinite scroll handler for both local expansion and remote loading
  const { displayLimit, observerTarget } = useInfiniteScroll(
    purchases,
    PAGE_SIZE,
    hasMore ? onLoadMore : undefined
  );

  // Sort purchases: Date DESC -> Category ASC -> Name ASC
  const sortedPurchases = useMemo(() => {
    return [...purchases].sort((a, b) => {
      // 1. Date Descending
      const dateA = toDate(a.date).getTime();
      const dateB = toDate(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;

      // 2. Category Ascending
      const catA = (a.category || '').toLowerCase();
      const catB = (b.category || '').toLowerCase();
      const catCompare = catA.localeCompare(catB);
      if (catCompare !== 0) return catCompare;

      // 3. Name Ascending
      const nameA = (a.productName || '').toLowerCase();
      const nameB = (b.productName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [purchases]);

  // Get the visible subset first
  const visibleSubset = useMemo(() => {
    return sortedPurchases.slice(0, displayLimit);
  }, [sortedPurchases, displayLimit]);

  // Group that visible subset by date
  const groupedPurchases = useMemo(() => {
    const groups: { dateLabel: string; items: Purchase[]; globalStartIndex: number }[] = [];
    let currentGlobalIdx = 0;

    visibleSubset.forEach((p) => {
      const label = fmtDate(p.date);
      // Since data is sorted by date, we can just check the last group
      let group = groups[groups.length - 1];
      
      if (!group || group.dateLabel !== label) {
        group = { dateLabel: label, items: [], globalStartIndex: currentGlobalIdx };
        groups.push(group);
      }
      
      group.items.push(p);
      currentGlobalIdx++;
    });

    return groups;
  }, [visibleSubset]);

  if (purchases.length === 0) {
    return (
      <EmptyState 
        icon={<History />} 
        title="No History" 
        description="Start tracking prices to see them here." 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        {groupedPurchases.map((group) => (
          <SectionCard
            key={group.dateLabel}
            title={group.dateLabel}
            icon={<CalendarDays />}
            noPadding={true}
            className="shadow-sm"
          >
            {group.items.map((p, idx) => {
              const globalIdx = group.globalStartIndex + idx;
              
              // Use getPerItemPrice to match Catalog View logic and fix multipack display issues
              const perItemCtx = getPerItemPrice(p);
              const context = {
                 price: perItemCtx.price,
                 unit: perItemCtx.label
              };
              
              const qtyDesc = (p.count && p.count > 1) 
                ? `${p.count} × ${p.singleQty}${p.unit}` 
                : `${p.quantity}${p.unit}`;

              return (
                <div 
                  key={p.id} 
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${(globalIdx % PAGE_SIZE) * 40}ms` }}
                >
                  <ListRow
                    leading={<div className="text-xl">{CATEGORY_EMOJIS[p.category || 'General']}</div>}
                    content={`${p.productName}\n${p.store} • ${fmtCurrency(p.price)} for ${qtyDesc}`}
                    className="cursor-pointer"
                    onClick={() => onEdit(p.id)}
                    actions={
                      <div className="flex flex-col items-end pr-4 py-4 justify-center">
                        <div className="text-lg font-bold text-primary dark:text-primary-dark">
                          {fmtCurrency(context.price)}
                        </div>
                        <div className="text-2xs font-bold text-content-tertiary uppercase">
                          / {context.unit}
                        </div>
                      </div>
                    }
                  />
                </div>
              );
            })}
          </SectionCard>
        ))}
      </div>

      {/* Observer Target & Loading State */}
      <div 
        ref={observerTarget} // Attach the hook's ref here so it auto-expands local limit
        className="p-12 flex justify-center items-center"
      >
        {/* Show loader if we have more locally OR more on server */}
        {displayLimit < purchases.length || hasMore ? (
          <div className="flex items-center gap-3 text-content-tertiary">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">
              Retrieving more logs...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="w-8 h-1 bg-outline dark:bg-outline-dark rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              End of history
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

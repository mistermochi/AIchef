
import React, { useState, useMemo } from 'react';
import { Search, Database, ShoppingCart, Check, ChevronDown, ChevronRight, Store } from 'lucide-react';
import { Purchase } from '../../types';
import { CATEGORY_EMOJIS, fmtCurrency, getPerItemPrice, fmtDate } from '../../utils/tracker';
import { Input, EmptyState, Button } from '../UI';
import { useCartContext } from '../../context/CartContext';

export const PriceCatalogList: React.FC<{ 
  purchases: Purchase[], 
  onOpenDetail: (pid: string, productName: string) => void 
}> = ({ purchases, onOpenDetail }) => {
  const { cart, addToCart, removeFromCart } = useCartContext();
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (cat: string) => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  // Process Data
  const catalogData = useMemo(() => {
    if (!purchases.length) return {};
    
    // 1. Group purchases by Product Key (Normalized Name)
    // Note: 'purchases' comes in sorted by Date DESC from the Context.
    // Therefore, the arrays in groupedByItem will preserve that order (0 is always latest).
    const groupedByItem: Record<string, Purchase[]> = {};
    purchases.forEach(p => {
      const key = p.productName?.trim()?.toLowerCase() || 'unknown';
      if (!groupedByItem[key]) groupedByItem[key] = [];
      groupedByItem[key].push(p);
    });
    
    // 2. Aggregate into Categories -> Items
    const groupedByCategory: Record<string, any[]> = {};
    const query = search.toLowerCase().trim();
    
    Object.keys(groupedByItem).forEach(itemKey => {
      const itemPurchases = groupedByItem[itemKey];
      
      // Optimization: Input is already sorted by date, so index 0 is latest.
      // No need to sortByDate.
      const latest = itemPurchases[0];
      
      // Optimization: Use reduce O(N) instead of sort O(N log N) to find best price
      const best = itemPurchases.reduce((min, curr) => 
        (curr.normalizedPrice || Infinity) < (min.normalizedPrice || Infinity) ? curr : min
      , itemPurchases[0]);
      
      if (!latest || !best) return;

      const pName = (latest.productName || '').toLowerCase();
      const pStore = (best.store || '').toLowerCase();
      const pCat = (latest.category || 'General').toLowerCase();

      // Filter
      if (query && !(pName.includes(query) || pStore.includes(query) || pCat.includes(query))) return;
      
      const category = latest.category || 'General';
      
      // Calculate Display Metrics
      const bestCtx = getPerItemPrice(best);
      
      if (!groupedByCategory[category]) groupedByCategory[category] = [];
      
      groupedByCategory[category].push({ 
        id: itemKey,
        name: latest.productName, 
        category,
        bestStats: {
          id: best.id,
          store: best.store,
          date: best.date,
          unitPrice: bestCtx.price,
          unitLabel: bestCtx.label,
        }
      });
    });
    return groupedByCategory;
  }, [purchases, search]);

  const categories = Object.keys(catalogData).sort();

  // Initialize all categories as expanded on first load or search change
  useMemo(() => {
    const allExpanded: Record<string, boolean> = {};
    categories.forEach(c => allExpanded[c] = true);
    setExpandedCats(allExpanded);
  }, [categories.length]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-surface-variant dark:bg-surface-variant-dark pt-1 pb-4">
        <Input 
          startIcon={<Search className="w-4 h-4" />} 
          placeholder="Filter products..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="shadow-sm"
        />
      </div>

      {categories.length === 0 ? (
        <EmptyState 
          icon={<Database />} 
          title="Catalog Empty" 
          description={search ? "No matching products found." : "Log purchases to build your catalog."} 
        />
      ) : (
        categories.map(cat => {
          const isExpanded = expandedCats[cat];
          const items = catalogData[cat].sort((a, b) => a.name.localeCompare(b.name));
          
          return (
            <div key={cat} className="bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-xl overflow-hidden shadow-sm">
              {/* Category Header */}
              <button 
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-variant/30 dark:bg-surface-variant-dark/30 hover:bg-surface-variant/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">{CATEGORY_EMOJIS[cat] || '🏷️'}</div>
                  <div className="text-sm font-bold text-content dark:text-content-dark uppercase tracking-wider">
                    {cat} <span className="text-content-tertiary ml-1">({items.length})</span>
                  </div>
                </div>
                <div className="text-content-tertiary">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {/* Items List */}
              {isExpanded && (
                <div className="divide-y divide-outline/30 dark:divide-outline-dark/30">
                  {items.map(item => {
                    const isInCart = cart.some(i => i.title === item.name);
                    const best = item.bestStats;

                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 pl-4 hover:bg-primary-container/5 dark:hover:bg-primary-container-dark/5 transition-colors group cursor-pointer"
                        onClick={() => onOpenDetail(best.id, item.name)}
                      >
                        {/* Left: Product Info */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-bold text-content dark:text-content-dark truncate text-sm sm:text-base">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-content-secondary dark:text-content-secondary-dark truncate">
                            <Store className="w-3 h-3 text-content-tertiary" />
                            <span className="truncate max-w-[120px]">{best.store}</span>
                            <span className="text-outline dark:text-outline-dark mx-0.5">•</span>
                            <span className="text-content-tertiary">{fmtDate(best.date)}</span>
                          </div>
                        </div>

                        {/* Middle: Best Price Only (Prominent) */}
                        <div className="flex items-center justify-end mr-4 shrink-0">
                           <div className="flex flex-col items-end">
                              <div className="text-[9px] font-bold text-success uppercase tracking-wider mb-0.5">
                                 Best Price
                              </div>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-lg sm:text-xl font-bold text-success-dark dark:text-success">{fmtCurrency(best.unitPrice)}</span>
                                 <span className="text-xs font-bold text-content-tertiary uppercase opacity-80">/ {best.unitLabel}</span>
                              </div>
                           </div>
                        </div>

                        {/* Right: Action */}
                        <div className="shrink-0" onClick={e => e.stopPropagation()}>
                          <Button 
                            size="icon-sm" 
                            variant={isInCart ? 'primary' : 'ghost'} 
                            className={isInCart ? '!bg-success text-white border-transparent shadow-sm' : 'text-content-tertiary hover:bg-surface-variant'}
                            onClick={() => { 
                              if (isInCart) {
                                const existing = cart.find(i => i.title === item.name);
                                if (existing) removeFromCart(existing.id);
                              } else {
                                addToCart({ id: `tracker-${item.id}`, title: item.name, ingredients: [{ name: item.name, quantity: 1, unit: 'pcs' }] } as any, 1);
                              }
                            }} 
                            icon={isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

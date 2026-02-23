
import React, { useState, useMemo, useDeferredValue } from 'react';
import { Search, Database, ShoppingCart, Check, ChevronRight, Store, ArrowLeft, Tag, Package, Loader2 } from 'lucide-react';
import { Purchase } from '../../../entities/tracker/model/types';
import { getPerItemPrice } from '../../../entities/tracker/model/trackerModel';
import { CATEGORY_EMOJIS } from '../../../entities/tracker/config';
import { fmtCurrency } from '../../../shared/lib/format';
import { fmtDate } from '../../../shared/lib/date';
import { Timestamp } from 'firebase/firestore';
import { Input, EmptyState, Button, Badge } from '../../../shared/ui';
import { useCartContext } from '../../../features/shopping-cart/model/CartContext';

// --- Types for the Catalog Tree ---

interface ProductSummary {
  id: string; // normalized key
  name: string; // display name
  genericName: string;
  category: string;
  bestPrice: number;
  bestUnitLabel: string;
  bestStore: string;
  bestDate: Timestamp | Date | string | null | undefined;
  bestPurchaseId: string;
  variantCount: number; // how many purchases history
}

interface GenericGroup {
  name: string;
  products: ProductSummary[];
  minPrice: number;
  productCount: number;
}

// --- Component ---

export const PriceCatalogList: React.FC<{ 
  purchases: Purchase[], 
  onOpenDetail: (pid: string, productName: string) => void 
}> = ({ purchases, onOpenDetail }) => {
  const { cart, addToCart, removeFromCart } = useCartContext();
  
  // Navigation State
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search); // Defer search term for heavy filtering

  // Performance: Defer the dataset update to prevent blocking UI during large data transitions or initial load
  const deferredPurchases = useDeferredValue(purchases);
  const isStale = deferredPurchases !== purchases;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGeneric, setSelectedGeneric] = useState<string | null>(null);

  // --- Data Processing ---
  const { tree, flatList, categories } = useMemo<{
    tree: Record<string, Record<string, GenericGroup>>;
    flatList: ProductSummary[];
    categories: string[];
  }>(() => {
    // 1. Group raw purchases by unique product (Normalized Name)
    const groupedByProduct: Record<string, Purchase[]> = {};
    deferredPurchases.forEach(p => {
      const key = p.productName?.trim()?.toLowerCase() || 'unknown';
      if (!groupedByProduct[key]) groupedByProduct[key] = [];
      groupedByProduct[key].push(p);
    });

    // 2. Create Product Summaries
    const allProducts: ProductSummary[] = Object.keys(groupedByProduct).map(key => {
      const history = groupedByProduct[key];
      // history is sorted by date desc from parent (index 0 is latest)
      const latest = history[0];
      
      // Find best price
      const best = history.reduce((min, curr) => 
        (curr.normalizedPrice || Infinity) < (min.normalizedPrice || Infinity) ? curr : min
      , history[0]);

      const bestCtx = getPerItemPrice(best);

      return {
        id: key,
        name: latest.productName,
        genericName: latest.genericName || 'Unclassified',
        category: latest.category || 'General',
        bestPrice: bestCtx.price,
        bestUnitLabel: bestCtx.label,
        bestStore: best.store,
        bestDate: best.date,
        bestPurchaseId: best.id,
        variantCount: history.length
      };
    });

    // 3. Build Tree: Category -> Generic -> Products
    const treeData: Record<string, Record<string, GenericGroup>> = {};
    
    allProducts.forEach(prod => {
      const cat = prod.category;
      const gen = prod.genericName;

      if (!treeData[cat]) treeData[cat] = {};
      if (!treeData[cat][gen]) {
        treeData[cat][gen] = {
          name: gen,
          products: [],
          minPrice: Infinity,
          productCount: 0
        };
      }

      const group = treeData[cat][gen];
      group.products.push(prod);
      group.productCount++;
      if (prod.bestPrice < group.minPrice) group.minPrice = prod.bestPrice;
    });

    const sortedCategories = Object.keys(treeData).sort();

    return { tree: treeData, flatList: allProducts, categories: sortedCategories };
  }, [deferredPurchases]);

  // --- Filtering for Search (Uses Deferred Value) ---
  const searchResults = useMemo(() => {
    if (!deferredSearch.trim()) return [];
    const q = deferredSearch.toLowerCase();
    return flatList.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.genericName.toLowerCase().includes(q)
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [deferredSearch, flatList]);

  // --- Handlers ---
  const handleBack = () => {
    if (selectedGeneric) setSelectedGeneric(null);
    else if (selectedCategory) setSelectedCategory(null);
  };

  const toggleCart = (e: React.MouseEvent, prod: ProductSummary) => {
    e.stopPropagation();
    const isInCart = cart.some(i => i.title === prod.name);
    if (isInCart) {
      const existing = cart.find(i => i.title === prod.name);
      if (existing) removeFromCart(existing.id);
    } else {
      // Mock recipe structure for cart
      addToCart({ 
        id: `tracker-${prod.id}`, 
        title: prod.name, 
        ingredients: [{ name: prod.name, quantity: 1, unit: 'pcs' }] 
      } as any, 1);
    }
  };

  // --- Renders ---

  // 1. Search Overlay (Overrides Hierarchy)
  if (search.trim()) {
    return (
      <div className="space-y-4 pb-20">
        <div className="sticky top-0 z-10 bg-surface-variant dark:bg-surface-variant-dark pt-1 pb-4">
          <Input 
            startIcon={<Search className="w-4 h-4" />} 
            endIcon={isStale ? <Loader2 className="w-3 h-3 animate-spin" /> : undefined}
            placeholder="Filter products..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="shadow-sm"
            autoFocus
          />
        </div>
        {searchResults.length === 0 ? (
          <EmptyState icon={<Search />} title="No results" description={`No products match "${search}"`} />
        ) : (
          <div className="divide-y divide-outline/30 dark:divide-outline-dark/30 bg-surface dark:bg-surface-dark rounded-xl border border-outline dark:border-outline-dark">
            {searchResults.map(prod => (
              <ProductRow key={prod.id} product={prod} isInCart={cart.some(i => i.title === prod.name)} onToggleCart={(e) => toggleCart(e, prod)} onClick={() => onOpenDetail(prod.bestPurchaseId, prod.name)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Header Navigation (Breadcrumbs)
  const headerNav = (
    <div className="sticky top-0 z-10 bg-surface-variant dark:bg-surface-variant-dark pt-1 pb-4 space-y-2">
      <Input 
        startIcon={<Search className="w-4 h-4" />} 
        endIcon={isStale ? <Loader2 className="w-3 h-3 animate-spin" /> : undefined}
        placeholder="Find item..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        className="shadow-sm"
      />
      {(selectedCategory || selectedGeneric) && (
         <div className="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-300">
            <Button size="icon-sm" variant="ghost" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />} className="shrink-0" />
            <div className="flex items-center gap-2 overflow-hidden">
               <Badge variant="neutral" label={selectedCategory!} />
               {selectedGeneric && (
                 <>
                   <ChevronRight className="w-3 h-3 text-content-tertiary" />
                   <Badge variant="primary" label={selectedGeneric} />
                 </>
               )}
            </div>
         </div>
      )}
    </div>
  );

  // 2. Generic Item View (Tier 3: Comparison)
  if (selectedCategory && selectedGeneric) {
    const group = tree[selectedCategory]?.[selectedGeneric];
    
    if (!group) {
        return <div className="p-8 text-center text-content-secondary">Item not found.</div>;
    }

    // Sort by Best Price ASC for easy comparison
    const sortedProducts = [...group.products].sort((a, b) => a.bestPrice - b.bestPrice);

    return (
      <div className={`pb-20 transition-opacity duration-200 ${isStale ? 'opacity-70' : 'opacity-100'}`}>
        {headerNav}
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="px-1">
              <h3 className="text-lg font-bold text-content dark:text-content-dark flex items-center gap-2">
                 <Tag className="w-5 h-5 text-primary" />
                 {selectedGeneric} Options
              </h3>
              <p className="text-xs text-content-secondary dark:text-content-secondary-dark mt-1">
                 Comparing {sortedProducts.length} brands by best price.
              </p>
           </div>
           
           <div className="divide-y divide-outline/30 dark:divide-outline-dark/30 bg-surface dark:bg-surface-dark rounded-xl border border-outline dark:border-outline-dark overflow-hidden">
              {sortedProducts.map((prod, idx) => (
                <div key={prod.id} className={idx === 0 ? "bg-success-container/10 relative" : ""}>
                   {idx === 0 && (
                     <div className="absolute top-0 right-0 bg-success text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                       BEST VALUE
                     </div>
                   )}
                   <ProductRow 
                     product={prod} 
                     isInCart={cart.some(i => i.title === prod.name)} 
                     onToggleCart={(e) => toggleCart(e, prod)} 
                     onClick={() => onOpenDetail(prod.bestPurchaseId, prod.name)} 
                   />
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // 3. Category View (Tier 2: Generics List)
  if (selectedCategory) {
    const groupMap = tree[selectedCategory] || {};
    // Ensure generics is typed correctly as GenericGroup[]
    const generics = (Object.values(groupMap) as GenericGroup[]).sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className={`pb-20 transition-opacity duration-200 ${isStale ? 'opacity-70' : 'opacity-100'}`}>
        {headerNav}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
           {generics.map(gen => (
             <button 
               key={gen.name}
               onClick={() => setSelectedGeneric(gen.name)}
               className="bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all active:scale-[0.98] text-left shadow-sm"
             >
                <div className="min-w-0">
                   <div className="font-bold text-content dark:text-content-dark truncate">{gen.name}</div>
                   <div className="text-xs text-content-tertiary mt-1 font-medium">
                      {gen.productCount} variants
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-xs font-bold text-content-tertiary uppercase mb-0.5">From</div>
                   <div className="text-base font-bold text-success dark:text-success-dark">
                      {fmtCurrency(gen.minPrice)}
                   </div>
                </div>
             </button>
           ))}
           {generics.length === 0 && <EmptyState icon={<Package />} title="No items" description="This category is empty." />}
        </div>
      </div>
    );
  }

  // 4. Root View (Tier 1: Categories)
  return (
    <div className={`pb-20 transition-opacity duration-200 ${isStale ? 'opacity-70' : 'opacity-100'}`}>
      {headerNav}
      <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">
         {categories.length === 0 ? (
            <EmptyState icon={<Database />} title="Catalog Empty" description="Log purchases to build your catalog." />
         ) : (
            categories.map(cat => {
              const groupMap = tree[cat] || {};
              // Ensure generics is typed correctly as GenericGroup[]
              const generics = Object.values(groupMap) as GenericGroup[];
              const itemCount = generics.reduce((acc, g) => acc + g.productCount, 0);

              return (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all active:scale-[0.98] shadow-sm"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-variant dark:bg-surface-variant-dark rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                         {CATEGORY_EMOJIS[cat] || '📦'}
                      </div>
                      <div className="text-left">
                         <div className="font-bold text-lg text-content dark:text-content-dark">{cat}</div>
                         <div className="text-xs text-content-secondary dark:text-content-secondary-dark font-medium">
                            {generics.length} Item Types • {itemCount} Products
                         </div>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-content-tertiary group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })
         )}
      </div>
    </div>
  );
};

// --- Sub-Component: Product Row (Leaf Node) ---

const ProductRow: React.FC<{ 
  product: ProductSummary, 
  isInCart: boolean, 
  onToggleCart: (e: React.MouseEvent) => void,
  onClick: () => void
}> = ({ product, isInCart, onToggleCart, onClick }) => (
  <div 
    className="flex items-center justify-between p-3 pl-4 hover:bg-primary-container/5 dark:hover:bg-primary-container-dark/5 transition-colors group cursor-pointer"
    onClick={onClick}
  >
    {/* Left: Product Info */}
    <div className="flex-1 min-w-0 pr-2">
      <div className="font-bold text-content dark:text-content-dark truncate text-sm sm:text-base">
        {product.name}
      </div>
      <div className="flex items-center gap-1.5 mt-1 text-xs text-content-secondary dark:text-content-secondary-dark truncate">
        <Store className="w-3 h-3 text-content-tertiary" />
        <span className="truncate max-w-[120px]">{product.bestStore}</span>
        <span className="text-outline dark:text-outline-dark mx-0.5">•</span>
        <span className="text-content-tertiary">{fmtDate(product.bestDate)}</span>
      </div>
    </div>

    {/* Middle: Best Price */}
    <div className="flex items-center justify-end mr-4 shrink-0">
       <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
             <span className="text-lg sm:text-xl font-bold text-success-dark dark:text-success">{fmtCurrency(product.bestPrice)}</span>
             <span className="text-xs font-bold text-content-tertiary uppercase opacity-80">/ {product.bestUnitLabel}</span>
          </div>
       </div>
    </div>

    {/* Right: Action */}
    <div className="shrink-0" onClick={e => e.stopPropagation()}>
      <Button 
        size="icon-sm" 
        variant={isInCart ? 'primary' : 'ghost'} 
        className={isInCart ? '!bg-success text-white border-transparent shadow-sm' : 'text-content-tertiary hover:bg-surface-variant'}
        onClick={onToggleCart} 
        icon={isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />} 
      />
    </div>
  </div>
);

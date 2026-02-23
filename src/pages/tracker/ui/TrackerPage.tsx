
import React, { useState } from 'react';
import { History, LayoutGrid, Trash2, Save, Sparkles, TrendingDown, Calendar, Search, ExternalLink, AlertTriangle, Camera, Plus, BookOpen } from 'lucide-react';
import { PageLayout, ViewHeader, Button, ActionBar, HeaderAction, HeaderActionSeparator, Modal, ModalHeader, ModalContent, Badge, SectionCard, BaseCard, ConfirmButton } from '../../../components/UI';
import { GlobalFAB } from '../../../components/layout/GlobalFAB';
import { PriceEntryForm } from '../../../features/tracker/ui/PriceEntryForm';
import { PriceHistoryList } from '../../../features/tracker/ui/PriceHistoryList';
import { PriceCatalogList } from '../../../features/tracker/ui/PriceCatalogList';
import { MetaSection } from '../../../components/recipe/MetaSection';
import { fmtCurrency } from '../../../shared/lib/format';
import { fmtDate } from '../../../shared/lib/date';
import { getPerItemPrice } from '../../../entities/tracker/model/trackerModel';
import { CATEGORY_EMOJIS } from '../../../entities/tracker/config';
import { useTracker } from '../../../features/tracker/model/useTracker';
import { Purchase } from '../../../entities/tracker/model/types';
import { Recipe } from '../../../types';

/**
 * @view TrackerPage
 * @description The main view for the Price Tracker feature.
 * It displays a catalog of products and a history of purchases.
 * Users can log new receipts, edit existing entries, and view detailed price insights for specific products.
 *
 * This view uses the `useTrackerController` to handle its logic and state.
 *
 * Features:
 * - Product Catalog: Aggregated view of best prices per product.
 * - Purchase History: Chronological list of all recorded purchases.
 * - Detail Modal: Shows price trends, related recipes, and AI-driven online deal comparisons.
 * - Receipt Scanning: Integrated with Gemini AI for OCR-based data entry.
 */
export const TrackerPage: React.FC = () => {
  const { state, actions, refs, computed } = useTracker();
  const [showDeals, setShowDeals] = useState(false);

  return (
    <PageLayout>
      <input 
        type="file" 
        ref={refs.fileInputRef} 
        className="hidden" 
        accept="image/*,.heic,.heif" 
        onChange={actions.handleFileSelect} 
      />
      
      <ViewHeader 
        title="Price Tracker" 
        subtitle={state.activeTab === 'catalog' ? "Insights across all vendors." : "Your recent purchase history."}
        actions={
          <ActionBar>
            <HeaderAction label="Catalog" icon={<LayoutGrid />} active={state.activeTab === 'catalog'} onClick={() => actions.setActiveTab('catalog')} />
            <HeaderAction label="History" icon={<History />} active={state.activeTab === 'history'} onClick={() => actions.setActiveTab('history')} />
            <HeaderActionSeparator />
            <div className="hidden md:block">
               <Button onClick={() => actions.setModal({ type: 'log' })} icon={<Plus className="w-4 h-4" />}>
                 Add Receipt
              </Button>
            </div>
          </ActionBar>
        }
      />

      {state.error ? (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-danger-container/20 rounded-full flex items-center justify-center text-danger">
             <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
             <h3 className="font-bold text-lg text-content dark:text-content-dark">Unable to Load Data</h3>
             <p className="text-sm text-content-secondary dark:text-content-secondary-dark max-w-sm mx-auto">{state.error}</p>
          </div>
          <Button variant="ghost" onClick={() => window.location.reload()} label="Reload Page" />
        </div>
      ) : state.loading && state.purchases.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-content-tertiary">
          <Sparkles className="w-10 h-10 animate-pulse" />
          <p className="font-bold text-sm uppercase tracking-widest">Loading Market Data...</p>
        </div>
      ) : state.activeTab === 'catalog' ? (
        <PriceCatalogList purchases={state.purchases} onOpenDetail={(pid, productName) => actions.setModal({ type: 'detail', pid, productName })} />
      ) : (
        <PriceHistoryList 
          purchases={state.purchases} 
          products={state.products} 
          onEdit={(id) => actions.setModal({ type: 'edit', id })}
          hasMore={state.hasMore}
          onLoadMore={actions.loadMorePurchases}
        />
      )}

      {/* Global FAB for Adding Receipt */}
      <GlobalFAB 
        icon={<Plus />} 
        label="Add Receipt" 
        onClick={() => actions.setModal({ type: 'log' })}
      />

      {state.modal.type !== 'none' && (
        <Modal onClose={actions.closeModal} size={state.modal.type === 'detail' ? 'xl' : 'full'} className={state.modal.type !== 'detail' ? 'sm:max-w-4xl' : ''}>
          <ModalHeader 
            title={state.modal.type === 'log' ? 'New Receipt Entry' : state.modal.type === 'edit' ? 'Edit Entry' : 'Product Insights'}
            onClose={actions.closeModal}
            actions={
              <>
                 {state.modal.type === 'log' && state.isAIEnabled && (
                   <HeaderAction 
                      label="Scan Receipt" 
                      icon={<Camera />} 
                      onClick={actions.handleScanClick} 
                    />
                 )}
                 {state.modal.type === 'edit' && (
                  <ConfirmButton 
                    isHeaderAction
                    label="Delete"
                    confirmLabel="Confirm?"
                    icon={<Trash2 />} 
                    confirmVariant="danger"
                    onConfirm={actions.handleDelete}
                    loading={state.isSaving}
                  />
                )}
                {(state.modal.type === 'log' || state.modal.type === 'edit') && (
                  <HeaderAction label={state.modal.type === 'log' ? "Save" : "Save Changes"} icon={<Save />} disabled={!state.isFormValid || state.isSaving} loading={state.isSaving} onClick={actions.setTriggerSubmit} />
                )}
              </>
            }
          />

          <ModalContent>
            {state.modal.type === 'log' && (
              <PriceEntryForm 
                products={state.products} 
                mode="create" 
                onSubmit={actions.handleSave} 
                externalSubmitTrigger={state.triggerSubmit} 
                onValidationChange={actions.setIsFormValid}
                autoScanFile={state.pendingScanFile}
              />
            )}
            {state.modal.type === 'edit' && (
              <PriceEntryForm key={`edit-${state.modal.id}`} products={state.products} mode="edit" initialData={computed.editFormData} onSubmit={actions.handleSave} externalSubmitTrigger={state.triggerSubmit} onValidationChange={actions.setIsFormValid} />
            )}
            {state.modal.type === 'detail' && computed.detailInfo && (() => {
               const { prod, lastPurchase, history, relatedRecipes } = computed.detailInfo;
               // Calculate Statistics
               const lowestPricePurchase = (history as Purchase[]).reduce((prev, curr) => (curr.normalizedPrice < prev.normalizedPrice ? curr : prev), history[0]);
               const isLatestBest = lastPurchase?.id === lowestPricePurchase?.id;
               
               const latestCtx = lastPurchase ? getPerItemPrice(lastPurchase) : null;
               const bestCtx = lowestPricePurchase ? getPerItemPrice(lowestPricePurchase) : null;
               
               const category = prod?.category || 'General';
               // Use Golden Tag (Generic Name) if available, otherwise fallback to Category
               const displayTag = prod?.genericName || category;

               return (
                <div className="space-y-6 max-w-4xl mx-auto w-full pb-12">
                  
                  {/* HERO HEADER REUSED FROM RECIPE COMPONENT */}
                  <MetaSection 
                    readOnly
                    overrideTitle={prod?.name || 'Unknown Product'}
                    overrideEmoji={CATEGORY_EMOJIS[category] || '📦'}
                    overrideSummary={
                      <div className="flex items-center gap-2 text-content-secondary dark:text-content-secondary-dark text-sm mt-1">
                         <Badge variant="neutral" label={displayTag} />
                         <span>•</span>
                         <span>{history.length} purchases recorded</span>
                      </div>
                    }
                  />

                  {/* PRICE COMPARISON - Side by Side */}
                  <BaseCard noPadding className="overflow-hidden border-primary/10">
                    <div className="grid grid-cols-2 divide-x divide-outline/30 dark:divide-outline-dark/30">
                        
                        {/* LEFT: BEST PRICE */}
                        <div className="p-4 sm:p-5 bg-success-container/10 dark:bg-success-container-dark/10 flex flex-col justify-center">
                            <div className="text-[10px] sm:text-xs font-bold text-success uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-1.5">
                              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Best Price
                            </div>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                              <span className="text-2xl sm:text-3xl font-bold text-success-dark dark:text-success">{fmtCurrency(bestCtx?.price || 0)}</span>
                              <span className="text-xs sm:text-sm font-bold text-success/70 dark:text-success/70">/ {bestCtx?.label}</span>
                            </div>
                            <div className="mt-2 text-[10px] sm:text-xs text-content-secondary dark:text-content-secondary-dark leading-tight">
                               {isLatestBest ? (
                                 <span className="font-bold text-success flex items-center gap-1"><Sparkles className="w-3 h-3"/> Current Deal!</span>
                               ) : (
                                 <span>{lowestPricePurchase?.store} • {fmtDate(lowestPricePurchase?.date)}</span>
                               )}
                            </div>
                        </div>

                        {/* RIGHT: LATEST PRICE */}
                        <div className="p-4 sm:p-5 bg-surface-variant/30 dark:bg-surface-variant-dark/30 flex flex-col justify-center">
                            <div className="text-[10px] sm:text-xs font-bold text-content-tertiary uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Latest
                            </div>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                              <span className="text-2xl sm:text-3xl font-bold text-content dark:text-content-dark">{fmtCurrency(latestCtx?.price || 0)}</span>
                              <span className="text-xs sm:text-sm font-bold text-content-tertiary">/ {latestCtx?.label}</span>
                            </div>
                            <div className="mt-2 text-[10px] sm:text-xs text-content-secondary dark:text-content-secondary-dark leading-tight">
                               <span>{lastPurchase?.store} • {fmtDate(lastPurchase?.date)}</span>
                            </div>
                        </div>

                    </div>
                  </BaseCard>

                  {/* RELATED RECIPES */}
                  {relatedRecipes.length > 0 && (
                    <SectionCard title={`Used in ${relatedRecipes.length} Recipes`} icon={<BookOpen />}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {relatedRecipes.map((recipe: Recipe) => (
                          <div 
                            key={recipe.id} 
                            onClick={() => actions.openRecipe(recipe)} 
                            className="bg-surface-variant/30 dark:bg-surface-variant-dark/30 hover:bg-surface-variant/80 dark:hover:bg-surface-variant-dark/80 border border-outline/30 dark:border-outline-dark/30 rounded-xl overflow-hidden cursor-pointer transition-all group"
                          >
                             <div className="aspect-[4/3] bg-surface dark:bg-surface-dark relative flex items-center justify-center overflow-hidden">
                                {recipe.coverImage ? (
                                    <img src={recipe.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="text-3xl">{recipe.emoji}</div>
                                )}
                             </div>
                             <div className="p-2.5">
                                <div className="text-xs font-bold text-content dark:text-content-dark truncate group-hover:text-primary transition-colors leading-tight">
                                  {recipe.title}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* HISTORY LIST */}
                  <SectionCard title="Price History" icon={<History />} className="divide-y divide-outline/30 dark:divide-outline-dark/30">
                     {history.map((h: Purchase) => {
                       const ctx = getPerItemPrice(h);
                       const isBest = h.id === lowestPricePurchase.id;
                       
                       return (
                         <div 
                           key={h.id} 
                           onClick={() => actions.setModal({ type: 'edit', id: h.id })}
                           className={`p-4 flex justify-between items-center transition-colors cursor-pointer ${isBest ? 'bg-success-container/10' : 'hover:bg-surface-variant/50'}`}
                         >
                            <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                  <div className="text-sm font-bold text-content dark:text-content-dark">{h.store}</div>
                                  {isBest && <Badge variant="success" label="Best Deal" className="py-0 px-1.5 text-[9px] h-4" />}
                               </div>
                               <div className="text-xs text-content-tertiary font-medium flex items-center gap-1.5">
                                  <span>{fmtDate(h.date)}</span>
                                  <span className="w-0.5 h-0.5 rounded-full bg-content-tertiary"></span>
                                  <span>Total: {fmtCurrency(h.price)}</span>
                                  {h.count && h.count > 1 && <span className="text-content-secondary">({h.count} × {h.singleQty}{h.unit})</span>}
                               </div>
                            </div>
                            <div className="text-right">
                               <div className={`text-sm font-bold ${isBest ? 'text-success-dark dark:text-success' : 'text-content dark:text-content-dark'}`}>
                                 {fmtCurrency(ctx.price)}
                               </div>
                               <div className="text-[10px] text-content-tertiary uppercase font-bold">/ {ctx.label}</div>
                            </div>
                         </div>
                       );
                     })}
                  </SectionCard>

                  {/* AI INSIGHTS (De-emphasized) */}
                  {state.isAIEnabled && (
                    <div className="border-t border-outline/30 dark:border-outline-dark/30 pt-6">
                       {!showDeals ? (
                          <Button 
                            fullWidth 
                            variant="ghost" 
                            onClick={() => { setShowDeals(true); actions.fetchAIInsight(prod?.name || ''); }}
                            icon={<Search className="w-4 h-4" />}
                            className="bg-surface-variant/50 dark:bg-surface-variant-dark/50"
                          >
                            Find Online Deals
                          </Button>
                       ) : (
                          <SectionCard 
                            title="Online Market Analysis" 
                            icon={<Sparkles />} 
                            action={<Button size="sm" variant="ghost" onClick={() => setShowDeals(false)}>Hide</Button>}
                          >
                            {state.searchingDeals ? (
                               <div className="py-8 flex flex-col items-center gap-2">
                                 <Sparkles className="w-6 h-6 animate-spin text-primary" />
                                 <p className="text-xs font-bold uppercase tracking-wider text-content-tertiary">Scanning web...</p>
                               </div>
                            ) : state.dealError ? (
                               <div className="p-4 bg-danger-container/20 text-danger text-sm rounded-lg flex gap-3"><AlertTriangle className="w-5 h-5" />{state.dealError}</div>
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {state.dealResults.map((deal: any, i: number) => (
                                    <a 
                                      key={i} 
                                      href={deal.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 rounded-xl border border-outline dark:border-outline-dark hover:border-primary dark:hover:border-primary transition-all group bg-surface dark:bg-surface-dark"
                                    >
                                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-outline/20 shrink-0">
                                        <img src={deal.imageUrl} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-content dark:text-content-dark truncate group-hover:text-primary transition-colors">{deal.title}</div>
                                        <div className="text-[10px] text-content-tertiary font-bold uppercase mt-0.5">{deal.store} • {deal.price}</div>
                                      </div>
                                      <ExternalLink className="w-3 h-3 text-content-tertiary group-hover:text-primary" />
                                    </a>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {state.dealSources.map((s: any, i: number) => (
                                    <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                                      {s.title}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </SectionCard>
                       )}
                    </div>
                  )}

                </div>
               );
            })()}
          </ModalContent>
        </Modal>
      )}
    </PageLayout>
  );
};

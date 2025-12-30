
import React from 'react';
import { ChefHat, BookOpen, ShoppingCart, UserCircle, Wand2, Tag } from 'lucide-react';
import { useUIContext } from '../context/UIContext';
import { useHaptics } from '../hooks/useHaptics';

const NavButton = ({ active, icon, onClick, label }: { active: boolean, icon: React.ReactNode, onClick: () => void, label: string }) => {
  const { trigger } = useHaptics();
  
  const handleClick = () => {
    trigger('medium');
    onClick();
  };

  return (
    <button 
      onClick={handleClick}
      title={label}
      className={`w-full px-3 py-2 rounded-lg flex items-center transition-colors text-sm font-medium sidebar-item ${
        active 
          ? 'bg-primary-container dark:bg-primary text-primary dark:text-white' 
          : 'text-content-secondary dark:text-content-secondary-dark hover:bg-surface-variant dark:hover:bg-surface-variant-dark'
      } ${label ? 'gap-3' : 'justify-center'}`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
      {label && <span className="truncate">{label}</span>}
    </button>
  );
};

export const Navigation: React.FC = () => {
  const { view, setView } = useUIContext();

  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-surface dark:bg-surface-dark border-r border-outline dark:border-outline-dark h-full shrink-0 transition-colors">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary dark:bg-primary-dark rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-content dark:text-content-dark google-sans transition-colors">ChefAI Studio</h1>
        </div>
        
        <div className="flex-1 px-3 space-y-1">
          <div className="px-3 pb-2 text-xs font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-wider">Workspace</div>
          <NavButton active={view === 'cookbook'} icon={<BookOpen />} onClick={() => setView('cookbook')} label="Cookbook" />
          <NavButton active={view === 'genie'} icon={<Wand2 />} onClick={() => setView('genie')} label="Kitchen Genie" />
          <NavButton active={view === 'shopping'} icon={<ShoppingCart />} onClick={() => setView('shopping')} label="Shopping List" />
          
          <div className="px-3 pt-6 pb-2 text-xs font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-wider">Utilities</div>
          <NavButton active={view === 'tracker'} icon={<Tag />} onClick={() => setView('tracker')} label="Price Tracker" />
          
          <div className="pt-6 px-3 pb-2 text-xs font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-wider">Account</div>
          <NavButton active={view === 'profile'} icon={<UserCircle />} onClick={() => setView('profile')} label="Preferences" />
        </div>

        <div className="p-4 border-t border-outline dark:border-outline-dark">
          <div className="p-3 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-transparent dark:border-outline-dark">
             <div className="text-xs font-medium text-content-tertiary dark:text-content-tertiary-dark mb-1">Model: Gemini 3 Flash</div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-2xs text-content-secondary dark:text-content-secondary-dark font-medium">Ready for input</span>
             </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface-dark border-t border-outline dark:border-outline-dark flex justify-around items-center py-2 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] z-50 shadow-lg transition-colors">
        <NavButton active={view === 'cookbook'} icon={<BookOpen />} onClick={() => setView('cookbook')} label="" />
        <NavButton active={view === 'genie'} icon={<Wand2 />} onClick={() => setView('genie')} label="" />
        <NavButton active={view === 'tracker'} icon={<Tag />} onClick={() => setView('tracker')} label="" />
        <NavButton active={view === 'shopping'} icon={<ShoppingCart />} onClick={() => setView('shopping')} label="" />
        <NavButton active={view === 'profile'} icon={<UserCircle />} onClick={() => setView('profile')} label="" />
      </nav>
    </>
  );
};

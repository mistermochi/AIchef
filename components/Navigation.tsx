import React from 'react';
import { ChefHat, Home, BookOpen, ShoppingCart, UserCircle, Wand2 } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  view: View;
  setView: (view: View) => void;
}

const NavButton = ({ active, icon, onClick, label }: { active: boolean, icon: React.ReactNode, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    title={label}
    className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium sidebar-item ${
      active 
        ? 'sidebar-active text-[#0b57d0] dark:bg-[#0b57d0] dark:text-white' 
        : 'text-[#444746] dark:text-[#c4c7c5]'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
    <span className="truncate">{label}</span>
  </button>
);

export const Navigation: React.FC<NavigationProps> = ({ view, setView }) => {
  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1b1b1b] border-r border-[#dadce0] dark:border-[#3c4043] h-full shrink-0 transition-colors">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0b57d0] rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-[#1f1f1f] dark:text-[#e3e3e3] google-sans transition-colors">ChefAI Studio</h1>
        </div>
        
        <div className="flex-1 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-wider">Workspace</div>
          <NavButton active={view === 'home'} icon={<Home />} onClick={() => setView('home')} label="New Adapter" />
          <NavButton active={view === 'genie'} icon={<Wand2 />} onClick={() => setView('genie')} label="Kitchen Genie" />
          <NavButton active={view === 'cookbook'} icon={<BookOpen />} onClick={() => setView('cookbook')} label="Cookbook" />
          <NavButton active={view === 'shopping'} icon={<ShoppingCart />} onClick={() => setView('shopping')} label="Shopping List" />
          
          <div className="pt-6 px-3 pb-2 text-[11px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-wider">Account</div>
          <NavButton active={view === 'profile'} icon={<UserCircle />} onClick={() => setView('profile')} label="Preferences" />
        </div>

        <div className="p-4 border-t border-[#dadce0] dark:border-[#3c4043]">
          <div className="p-3 bg-[#f8f9fa] dark:bg-[#0f1114] rounded-xl border border-transparent dark:border-[#3c4043]">
             <div className="text-[11px] font-medium text-[#8e918f] mb-1">Model: Gemini 3 Flash</div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] text-[#444746] dark:text-[#c4c7c5] font-medium">Ready for input</span>
             </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1b1b1b] border-t border-[#dadce0] dark:border-[#3c4043] flex justify-around items-center py-2 px-2 z-50 shadow-lg transition-colors">
        <button onClick={() => setView('home')} className={`p-2 rounded-xl transition-colors ${view === 'home' ? 'bg-[#e8f0fe] dark:bg-[#0b57d0] text-[#0b57d0] dark:text-white' : 'text-[#444746] dark:text-[#c4c7c5]'}`}>
          <Home className="w-6 h-6" />
        </button>
        <button onClick={() => setView('genie')} className={`p-2 rounded-xl transition-colors ${view === 'genie' ? 'bg-[#e8f0fe] dark:bg-[#0b57d0] text-[#0b57d0] dark:text-white' : 'text-[#444746] dark:text-[#c4c7c5]'}`}>
          <Wand2 className="w-6 h-6" />
        </button>
        <button onClick={() => setView('cookbook')} className={`p-2 rounded-xl transition-colors ${view === 'cookbook' ? 'bg-[#e8f0fe] dark:bg-[#0b57d0] text-[#0b57d0] dark:text-white' : 'text-[#444746] dark:text-[#c4c7c5]'}`}>
          <BookOpen className="w-6 h-6" />
        </button>
        <button onClick={() => setView('shopping')} className={`p-2 rounded-xl transition-colors ${view === 'shopping' ? 'bg-[#e8f0fe] dark:bg-[#0b57d0] text-[#0b57d0] dark:text-white' : 'text-[#444746] dark:text-[#c4c7c5]'}`}>
          <ShoppingCart className="w-6 h-6" />
        </button>
        <button onClick={() => setView('profile')} className={`p-2 rounded-xl transition-colors ${view === 'profile' ? 'bg-[#e8f0fe] dark:bg-[#0b57d0] text-[#0b57d0] dark:text-white' : 'text-[#444746] dark:text-[#c4c7c5]'}`}>
          <UserCircle className="w-6 h-6" />
        </button>
      </nav>
    </>
  );
};
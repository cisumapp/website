import React from 'react';
import { motion } from 'framer-motion';
import { Home, Flame, Sparkles, Folder, Search } from 'lucide-react';

interface NavPillProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const NavPill: React.FC<NavPillProps> = ({
  tabs,
  activeTab,
  onChange,
}) => {
  const getIconForTab = (tab: string) => {
    switch (tab.toLowerCase()) {
      case 'overview':
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'trending':
      case 'flame':
        return <Flame className="w-4 h-4" />;
      case 'discover':
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'bio':
      case 'library':
      case 'folder':
        return <Folder className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            title={tab}
            className={`w-9 h-9 rounded-full relative cursor-pointer flex items-center justify-center transition-all duration-300 ${
              isActive 
                ? 'text-white' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill-active-bg"
                className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.1] shadow-lg"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center">{getIconForTab(tab)}</span>
          </button>
        );
      })}
    </div>
  );
};

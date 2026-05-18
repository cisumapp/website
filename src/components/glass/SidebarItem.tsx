import React from 'react';
import { motion } from 'framer-motion';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group cursor-pointer ${
        active
          ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'
      }`}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <div className={`transition-colors duration-300 ${active ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </motion.button>
  );
};

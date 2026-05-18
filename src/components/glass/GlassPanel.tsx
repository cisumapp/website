import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  intensity = 'medium',
  ...props
}) => {
  const blurClasses = {
    low: 'backdrop-blur-lg bg-white/[0.01] border-white/[0.03] shadow-[0_4px_20px_0_rgba(0,0,0,0.15)]',
    medium: 'backdrop-blur-2xl bg-white/[0.03] border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]',
    high: 'backdrop-blur-[60px] bg-black/[0.12] border-white/[0.07] shadow-[0_12px_40px_0_rgba(0,0,0,0.35)]',
  };

  return (
    <motion.div
      className={`rounded-3xl border ${blurClasses[intensity]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};


import React from 'react';
import { BaseCard } from './BaseCard';
import { cn } from "@/shared/lib/utils";

/**
 * @component Card
 * @description A generic card component with a hover effect and active state.
 */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { onClick?: () => void }> = ({ children, className = '', onClick, style, ...props }) => (
  <div className={className} style={style} {...props}>
    <BaseCard noPadding className="group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all active:scale-[0.98] h-full" onClick={onClick}>
       {children}
    </BaseCard>
  </div>
);

/**
 * @component CardMedia
 * @description A container for card media (images or fallback emojis).
 */
export const CardMedia: React.FC<{ src?: string | null; fallbackEmoji?: string; children?: React.ReactNode }> = ({ src, fallbackEmoji, children }) => (
  <div className="relative aspect-[4/3] bg-muted overflow-hidden shrink-0">
    {src ? (
      <img
        src={src}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        alt="Cover"
        loading="lazy"
        decoding="async"
      />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <span className="text-6xl select-none">{fallbackEmoji || '🥘'}</span>
      </div>
    )}
    {children}
  </div>
);

/**
 * @component CardFloatingAction
 * @description A floating action button that appears inside a card (usually in a corner).
 */
export const CardFloatingAction: React.FC<{
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  activeColor?: string;
}> = ({ icon, onClick, active }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
    className={cn(
      "absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-transform active:scale-90 flex items-center justify-center",
      active
        ? 'bg-success text-success-foreground'
        : 'bg-background text-primary hover:bg-primary/10'
    )}
  >
    {icon}
  </button>
);

/**
 * @component CardContent
 * @description The main content area of a card.
 */
export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 flex flex-col flex-1 gap-3 min-w-0">
    {children}
  </div>
);

/**
 * @component CardTitle
 * @description A styled title component for cards.
 */
export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="font-bold text-lg text-foreground google-sans line-clamp-1 group-hover:text-primary transition-colors">
    {children}
  </h3>
);

/**
 * @component CardDescription
 * @description A styled description component for cards with line-clamping.
 */
export const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
    {children}
  </p>
);

/**
 * @component CardFooter
 * @description The footer area of a card, usually containing actions or metadata.
 */
export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-auto px-4 pb-4 pt-3 border-t border-border relative">
    {children}
  </div>
);

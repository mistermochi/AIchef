
import React from 'react';
import { FAB, FABProps } from '../ui/Buttons';

export const GlobalFAB: React.FC<FABProps> = ({ className = '', style, label, ...props }) => {
  // Positions the FAB fixed at bottom right.
  // Mobile: Bottom is calculated to sit above the Bottom Navigation Bar (~60px height + safe area).
  // Desktop: Hidden as per requirements, actions are in the header.
  return (
    <div className={`fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 animate-in slide-in-from-bottom-5 duration-300 md:hidden ${className}`} style={style}>
       <FAB label={undefined} title={props.title || label} {...props} />
    </div>
  );
};

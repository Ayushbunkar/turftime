// Badge.jsx
import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

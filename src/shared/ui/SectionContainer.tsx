import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
  id?: string;
}

/**
 * Standard section container with max-w-7xl constraint.
 * Every page section must use this for layout consistency.
 */
export function SectionContainer({ children, className, as: Tag = 'section', id }: SectionContainerProps) {
  return (
    <Tag id={id} className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </Tag>
  );
}
import { SelectHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { formControlClassName, formSelectClassName } from './formStyles';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(formControlClassName, formSelectClassName, className)}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

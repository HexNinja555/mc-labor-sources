import { InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { formControlClassName } from './formStyles';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(formControlClassName, className)}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

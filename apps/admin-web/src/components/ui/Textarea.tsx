import { TextareaHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { formControlClassName } from './formStyles';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(formControlClassName, 'min-h-[5rem] resize-y', className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

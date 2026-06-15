import { TextareaHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';



export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(

  ({ className, ...props }, ref) => (

    <textarea

      ref={ref}

      className={cn(

        'w-full rounded-none border border-gray-600 px-3 py-2 text-sm text-text placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',

        className,

      )}

      {...props}

    />

  ),

);

Textarea.displayName = 'Textarea';


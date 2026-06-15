import { InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';



export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(

  ({ className, ...props }, ref) => (

    <input

      ref={ref}

      className={cn(

        'w-full rounded-none border border-gray-600 px-3 py-2 text-sm text-text placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',

        className,

      )}

      {...props}

    />

  ),

);

Input.displayName = 'Input';


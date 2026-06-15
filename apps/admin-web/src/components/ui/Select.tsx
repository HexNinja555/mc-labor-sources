import { SelectHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';



export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(

  ({ className, children, ...props }, ref) => (

    <select

      ref={ref}

      className={cn(

        'w-full rounded-none border border-gray-600 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white',

        className,

      )}

      {...props}

    >

      {children}

    </select>

  ),

);

Select.displayName = 'Select';


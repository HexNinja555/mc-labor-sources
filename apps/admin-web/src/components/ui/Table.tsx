import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Right-align last column for action buttons */
  hasActions?: boolean;
}

export function Table({ className, children, hasActions, ...props }: TableProps) {
  return (
    <div className={cn('table-container', hasActions && 'table-has-actions')}>
      <table className={cn('data-table', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn(className)} {...props}>
      {children}
    </th>
  );
}

export function ThActions({ className, children = 'Actions', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('min-w-[12rem]', className)} {...props}>
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn(className)} {...props}>
      {children}
    </td>
  );
}

export function TdMuted({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('text-slate-500', className)} {...props}>
      {children ?? <span className="text-slate-300">—</span>}
    </td>
  );
}

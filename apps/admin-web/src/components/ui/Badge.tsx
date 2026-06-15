import { cn } from '@/lib/utils';



const variants: Record<string, string> = {

  ACTIVE: 'bg-green-100 text-green-800',

  INACTIVE: 'bg-gray-100 text-gray-600',

  PENDING: 'bg-yellow-100 text-yellow-800',

  ACCEPTED: 'bg-blue-100 text-blue-800',

  DECLINED: 'bg-red-100 text-red-800',

  COMPLETED: 'bg-green-100 text-green-800',

  CANCELLED: 'bg-gray-100 text-gray-600',

  CLOCKED_IN: 'bg-green-100 text-green-800',

  CLOCKED_OUT: 'bg-gray-100 text-gray-600',

  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',

  DRAFT: 'bg-gray-100 text-gray-600',

  SENT: 'bg-blue-100 text-blue-800',

  ACKNOWLEDGED: 'bg-green-100 text-green-800',

  SIGNED: 'bg-green-100 text-green-800',

  SUBMITTED: 'bg-yellow-100 text-yellow-800',

  APPROVED: 'bg-green-100 text-green-800',

};



export function Badge({ status, className }: { status: string; className?: string }) {

  return (

    <span

      className={cn(

        'inline-flex rounded-sm px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',

        variants[status] || 'bg-gray-100 text-gray-600',

        className,

      )}

    >

      {status.replace(/_/g, ' ')}

    </span>

  );

}


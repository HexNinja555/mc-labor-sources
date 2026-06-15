import { cn } from '@/lib/utils';

interface BrandPageTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'center' | 'left';
}

export function BrandPageTitle({
  title,
  description,
  action,
  align = 'left',
}: BrandPageTitleProps) {
  const isLeft = align === 'left';

  return (
    <div className={cn('mb-8', isLeft ? 'text-left' : 'text-center')}>
      <div
        className={cn(
          'relative flex flex-col gap-4',
          isLeft
            ? 'sm:flex-row sm:items-start sm:justify-between'
            : 'items-center sm:flex-row sm:justify-center',
        )}
      >
        <div className={isLeft ? 'text-left' : 'text-center'}>
          <h1 className={cn('brand-page-title', isLeft ? 'brand-page-title-left' : 'inline-block')}>
            {title}
          </h1>
          {description && (
            <p className={cn('mt-3 text-base leading-relaxed text-gray-500', isLeft && 'max-w-2xl')}>
              {description}
            </p>
          )}
        </div>
        {action && <div className={isLeft ? 'shrink-0' : 'sm:absolute sm:right-0'}>{action}</div>}
      </div>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
  href?: string;
  variant?: 'header' | 'footer';
}

export function BrandLogo({ className, priority = false, href, variant = 'header' }: BrandLogoProps) {
  const src = variant === 'footer' ? '/brand/logo-footer.png' : '/brand/logo.png';
  const width = variant === 'footer' ? 200 : 359;
  const height = variant === 'footer' ? 40 : 48;

  const image = (
    <Image
      src={src}
      alt="MC Labor Sources"
      width={width}
      height={height}
      priority={priority}
      className={cn('h-auto w-full', variant === 'header' ? 'max-w-[280px]' : 'max-w-[180px]', className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {image}
      </Link>
    );
  }

  return image;
}

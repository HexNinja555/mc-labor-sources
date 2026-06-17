import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface BrandHeroProps {
  title: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  variant?: 'cover' | 'banner';
}

function HeroCaption({
  title,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="brand-hero-caption">
      <span className="brand-hero-caption-label">MC Labor Sources</span>
      <h1 className="brand-hero-caption-title">{title}</h1>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="mt-4 inline-block">
          <Button icon="arrowRight">{ctaLabel}</Button>
        </Link>
      )}
    </div>
  );
}

export function BrandHero({
  title,
  image = '/brand/innerpage-header.jpg',
  ctaLabel,
  ctaHref,
  className,
  variant,
}: BrandHeroProps) {
  const isBanner = variant === 'banner' || image === BRAND_HERO_IMAGES.homepage;

  if (isBanner) {
    return (
      <section className={cn('relative w-full overflow-hidden bg-slate-100', className)}>
        <Image
          src={image}
          alt=""
          width={2190}
          height={464}
          priority
          className="block h-auto w-full"
          sizes="100vw"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 pb-8">
          <div className="brand-container">
            <HeroCaption title={title} ctaLabel={ctaLabel} ctaHref={ctaHref} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('relative w-full bg-cover bg-center bg-no-repeat', className)}
      style={{ backgroundImage: `url(${image})`, minHeight: '350px' }}
    >
      <div className="brand-container relative flex min-h-[350px] items-end pb-8 pt-16">
        <HeroCaption title={title} ctaLabel={ctaLabel} ctaHref={ctaHref} />
      </div>
    </section>
  );
}

'use client';

import type { ReactNode } from 'react';
import type { AuthUser } from '@/lib/api-client';
import type { NavItem } from '@/lib/navigation-types';
import { cn } from '@/lib/utils';
import { BrandFooter } from './BrandFooter';
import { BrandHeader } from './BrandHeader';
import { BrandHero } from './BrandHero';

interface BrandAppShellProps {
  children: ReactNode;
  navItems: NavItem[];
  portalHome: string;
  user?: AuthUser | null;
  heroTitle?: string;
  heroImage?: string;
  showHero?: boolean;
  showNav?: boolean;
  contentClassName?: string;
}

export function BrandAppShell({
  children,
  navItems,
  portalHome,
  user,
  heroTitle,
  heroImage,
  showHero = true,
  showNav = true,
  contentClassName,
}: BrandAppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <BrandHeader navItems={navItems} portalHome={portalHome} user={user} showNav={showNav} />
      {showHero && heroTitle && <BrandHero title={heroTitle} image={heroImage} />}
      <main
        className={cn(
          'flex-1',
          contentClassName ?? 'brand-container py-8',
        )}
      >
        {children}
      </main>
      <BrandFooter portalHome={portalHome} />
    </div>
  );
}

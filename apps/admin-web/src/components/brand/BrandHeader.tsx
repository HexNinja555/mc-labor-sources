'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND_PHONE, BRAND_PHONE_HREF } from '@mc-labor/shared';
import { logout } from '@/lib/auth';
import type { AuthUser } from '@/lib/api-client';
import type { NavItem } from '@/lib/navigation-types';
import { isNavGroupActive, isNavLinkActive } from '@/lib/navigation-types';
import { cn } from '@/lib/utils';
import { BrandLogo } from './BrandLogo';
import { PhoneIcon } from './PhoneIcon';

interface BrandHeaderProps {
  navItems: NavItem[];
  portalHome: string;
  user?: AuthUser | null;
  showNav?: boolean;
}

function NavDropdown({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const active = isNavGroupActive(item, pathname);

  if (!item.children?.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn('brand-nav-link inline-flex items-center gap-1 py-2', active && 'brand-nav-link-active')}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {item.label}
        <span className="text-[10px] leading-none" aria-hidden="true">
          ▼
        </span>
      </button>
      {open && (
        <ul className="absolute left-0 top-full z-50 min-w-[220px] border border-primary bg-primary py-1 shadow-lg">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={cn(
                  'brand-nav-dropdown-link block px-5 py-2.5 text-left text-base uppercase tracking-wide text-white hover:bg-primary-darker',
                  isNavLinkActive(child.href, pathname) && 'bg-primary-darker',
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobileNavSection({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(isNavGroupActive(item, pathname));

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'brand-nav-link block py-2.5 text-base',
          isNavLinkActive(item.href, pathname) && 'brand-nav-link-active',
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-100 py-1">
      <button
        type="button"
        className={cn(
          'brand-nav-link flex w-full items-center justify-between py-2.5 text-base',
          isNavGroupActive(item, pathname) && 'brand-nav-link-active',
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {item.label}
        <span className="text-xs">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && item.children && (
        <ul className="mb-2 ml-3 space-y-1 border-l-2 border-primary/30 pl-3">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  'brand-nav-link block py-2 text-base normal-case',
                  isNavLinkActive(child.href, pathname) && 'brand-nav-link-active',
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BrandHeader({ navItems, portalHome, user, showNav = true }: BrandHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header id="header" className="border-b border-gray-200 bg-white py-[10px]">
      <div className="brand-container">
        <div className="flex items-start justify-between gap-4">
          <div className="pt-[10px]">
            <BrandLogo href={portalHome} priority className="max-w-[300px] shrink-0 lg:max-w-[360px]" />
          </div>

          <div className="flex items-center gap-4 pt-[15px] xl:gap-6">
            {showNav && (
              <nav className="hidden items-center gap-4 xl:gap-5 lg:flex">
                {navItems.map((item) =>
                  item.children ? (
                    <NavDropdown key={item.label} item={item} pathname={pathname} />
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={cn(
                        'brand-nav-link whitespace-nowrap py-2',
                        isNavLinkActive(item.href!, pathname) && 'brand-nav-link-active',
                      )}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
            )}

            <div className="flex items-center gap-3 sm:gap-4 lg:border-l lg:border-gray-300 lg:pl-4">
              <a
                href={BRAND_PHONE_HREF}
                className="brand-phone-link hidden items-center gap-2 whitespace-nowrap sm:inline-flex"
              >
                <PhoneIcon className="h-5 w-5 shrink-0 text-primary" />
                <span>{BRAND_PHONE}</span>
              </a>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-2 py-1"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-dark text-sm font-bold text-white">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                    <span className="hidden max-w-[120px] truncate text-base text-text xl:block">
                      {user.name}
                    </span>
                  </button>
                  {userOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-52 border border-gray-200 bg-white py-1 shadow-lg">
                        <div className="border-b border-gray-100 px-4 py-3">
                          <p className="text-base font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => logout()}
                          className="w-full px-4 py-2.5 text-left text-base text-red-600 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {showNav && (
                <button
                  type="button"
                  className="inline-flex flex-col gap-1.5 p-2 lg:hidden"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                >
                  <span className="block h-0.5 w-6 bg-nav" />
                  <span className="block h-0.5 w-6 bg-nav" />
                  <span className="block h-0.5 w-6 bg-nav" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showNav && mobileOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 py-4 lg:hidden">
          {navItems.map((item) => (
            <MobileNavSection
              key={item.label}
              item={item}
              pathname={pathname}
              onNavigate={closeMobile}
            />
          ))}
          <a href={BRAND_PHONE_HREF} className="brand-phone-link mt-4 inline-flex items-center gap-2 sm:hidden">
            <PhoneIcon className="h-5 w-5 text-primary" />
            <span>{BRAND_PHONE}</span>
          </a>
        </nav>
      )}
    </header>
  );
}

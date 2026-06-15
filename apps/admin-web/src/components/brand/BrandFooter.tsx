import Link from 'next/link';
import {
  BRAND_EMAIL,
  BRAND_EMAIL_HREF,
  BRAND_PHONE,
  BRAND_PHONE_HREF,
} from '@mc-labor/shared';
import { PhoneIcon } from './PhoneIcon';
import { MailIcon } from './MailIcon';
import './brand-footer.css';

interface BrandFooterProps {
  portalHome?: string;
}

export function BrandFooter({ portalHome = '/dashboard' }: BrandFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer id="footer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-footer.png" alt="MC Labor Sources" />

      <div className="contact-info">
        <a href={BRAND_PHONE_HREF} className="inline-flex items-center gap-2">
          <PhoneIcon className="h-4 w-4" />
          {BRAND_PHONE}
        </a>
        <a href={BRAND_EMAIL_HREF} className="inline-flex items-center gap-2">
          <MailIcon className="h-4 w-4" />
          {BRAND_EMAIL}
        </a>
      </div>

      <div className="social">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/facebook.png" alt="Facebook" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/twitter.png" alt="Twitter" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/linked.png" alt="LinkedIn" />
        </a>
      </div>

      <div className="links">
        <Link href={portalHome}>Home</Link>
        <a href="https://mclabor.com/about-us/" target="_blank" rel="noopener noreferrer">
          About Us
        </a>
        <a href="https://mclabor.com/services/" target="_blank" rel="noopener noreferrer">
          Services
        </a>
        <a href="https://mclabor.com/contact-us/" target="_blank" rel="noopener noreferrer">
          Contact Us
        </a>
      </div>

      <div className="copy">
        Copyright {year} MC Labor Sources Inc. All Rights Reserved.
      </div>
    </footer>
  );
}

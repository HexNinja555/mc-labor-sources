import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function IconBase({ className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconPlus({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function IconEdit({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </IconBase>
  );
}

export function IconSave({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </IconBase>
  );
}

export function IconX({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </IconBase>
  );
}

export function IconTrash({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </IconBase>
  );
}

export function IconSend({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </IconBase>
  );
}

export function IconEye({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function IconUpload({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 20h16" />
    </IconBase>
  );
}

export function IconDownload({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 4v12M8 12l4 4 4-4" />
      <path d="M4 20h16" />
    </IconBase>
  );
}

export function IconUserPlus({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </IconBase>
  );
}

export function IconUserMinus({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 11h-6" />
    </IconBase>
  );
}

export function IconUserCheck({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M17 11l2 2 4-4" />
    </IconBase>
  );
}

export function IconStop({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9h6v6H9z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconSwap({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M16 3h5v5M8 21H3v-5" />
      <path d="M21 8A9 9 0 003 16M3 16l5-5M3 16h5" />
    </IconBase>
  );
}

export function IconCheck({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M20 6L9 17l-5-5" />
    </IconBase>
  );
}

export function IconCheckCircle({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  );
}

export function IconBell({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </IconBase>
  );
}

export function IconCalendar({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </IconBase>
  );
}

export function IconSignature({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M4 20c4-8 8-12 12-12s4 4 4 8" />
      <path d="M4 20h16" />
    </IconBase>
  );
}

export function IconArrowLeft({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </IconBase>
  );
}

export function IconArrowRight({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </IconBase>
  );
}

export function IconBriefcase({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </IconBase>
  );
}

export function IconBuilding({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" />
      <path d="M9 9h1M9 13h1M9 17h1" />
    </IconBase>
  );
}

export function IconMapPin({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}

export function IconUsers({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </IconBase>
  );
}

export function IconClock({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function IconClipboard({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h6" />
    </IconBase>
  );
}

export function IconDocument({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </IconBase>
  );
}

export function IconShield({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </IconBase>
  );
}

export function IconLogin({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </IconBase>
  );
}

export function IconSpinner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export const BUTTON_ICONS = {
  plus: IconPlus,
  edit: IconEdit,
  save: IconSave,
  cancel: IconX,
  close: IconX,
  trash: IconTrash,
  send: IconSend,
  eye: IconEye,
  upload: IconUpload,
  download: IconDownload,
  userPlus: IconUserPlus,
  userMinus: IconUserMinus,
  userCheck: IconUserCheck,
  stop: IconStop,
  swap: IconSwap,
  check: IconCheck,
  checkCircle: IconCheckCircle,
  bell: IconBell,
  calendar: IconCalendar,
  signature: IconSignature,
  arrowLeft: IconArrowLeft,
  arrowRight: IconArrowRight,
  briefcase: IconBriefcase,
  building: IconBuilding,
  mapPin: IconMapPin,
  login: IconLogin,
} as const;

export type ButtonIconName = keyof typeof BUTTON_ICONS;

export function resolveButtonIcon(icon?: ButtonIconName | React.ReactNode, className = 'h-4 w-4') {
  if (!icon) return null;
  if (typeof icon === 'string') {
    const Cmp = BUTTON_ICONS[icon as ButtonIconName];
    return Cmp ? <Cmp className={className} /> : null;
  }
  return icon;
}

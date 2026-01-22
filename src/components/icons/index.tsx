import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

// Check mark icon (green positive indicator)
export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5 text-green-500 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// X mark icon (red negative indicator)
export function XIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5 text-red-400 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Arrow right icon
export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Arrow right with line icon (for buttons)
export function ArrowLineRightIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Chart/Analytics icon
export function ChartIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

// Trend up icon
export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// QR Code icon
export function QRCodeIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </svg>
  );
}

// Link icon
export function LinkIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// Location/Map pin icon
export function LocationIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Mobile/Phone device icon
export function MobileIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

// Clock/Time icon
export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Shield/Security icon
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// Shield with check icon
export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

// Lock icon
export function LockIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Users/Team icon
export function UsersIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Smile/Face icon
export function SmileIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

// Image icon
export function ImageIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

// Settings/Gear icon
export function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4" />
    </svg>
  );
}

// Star icon (for ratings)
export function StarIcon({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg
      className={cn('w-4 h-4 text-yellow-500', className)}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="2"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// Quote icon (for testimonials)
export function QuoteIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-8 h-8 text-primary/10', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

// Restaurant/Utensils icon
export function UtensilsIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-6 h-6 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

// Marketing/Chart icon
export function MarketingIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-6 h-6 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

// Ticket icon
export function TicketIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-6 h-6 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </svg>
  );
}

// Package/Box icon
export function PackageIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-6 h-6 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

// Circle icon (for "other" indicators)
export function CircleIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-red-400', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// Create/Add icon
export function CreateIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-7 h-7 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// Download icon
export function DownloadIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-7 h-7 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// Patterns icon (for QR patterns)
export function PatternsIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

// Corner styles icon
export function CornerStylesIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4h4v4H4z" />
      <path d="M4 16h4v4H4z" />
      <path d="M16 4h4v4h-4z" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

// Gradient icon
export function GradientIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20" />
    </svg>
  );
}

// Frame icon
export function FrameIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="10" height="10" />
    </svg>
  );
}

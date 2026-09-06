import type { SVGProps } from 'react';

export type PremiumIconName =
  | 'activity'
  | 'alert'
  | 'calendar'
  | 'chevron'
  | 'check'
  | 'clipboard'
  | 'emergency'
  | 'file'
  | 'flask'
  | 'integration'
  | 'leaf'
  | 'logout'
  | 'medical'
  | 'package'
  | 'pulse'
  | 'shield'
  | 'stethoscope'
  | 'surgery'
  | 'sync';

interface PremiumIconProps extends SVGProps<SVGSVGElement> {
  name: PremiumIconName;
}

const paths: Record<PremiumIconName, string> = {
  activity: 'M3 12h4l2-8 4 16 2-8h6',
  alert: 'M12 3L2.8 20h18.4L12 3zm0 6v4m0 4h.01',
  calendar: 'M5 4v3m14-3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  chevron: 'M9 5l7 7-7 7',
  check: 'M5 12l4 4L19 6',
  clipboard: 'M9 5h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-8 0H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-3',
  emergency: 'M12 21a9 9 0 100-18 9 9 0 000 18zm-1-13h2v4h-2V8zm0 6h2v2h-2v-2z',
  file: 'M6 3h8l4 4v14H6V3zm8 0v5h4M9 13h6m-6 4h6',
  flask: 'M9 3h6m-5 0v6l-4.5 8.5A2 2 0 007.3 21h9.4a2 2 0 001.8-3.5L14 9V3',
  integration: 'M8 12h8m-5-3l3 3-3 3M5 5h14v14H5V5z',
  leaf: 'M20 4C10 4 4 9 4 17c0 2 1 3 3 3 8 0 13-6 13-16zM4 20c2-5 6-8 11-10',
  logout: 'M10 17l5-5-5-5m5 5H3m10-7V3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6v-2',
  medical: 'M12 21s-8-4.7-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 10c0 6.3-8 11-8 11z',
  package: 'M4 7l8-4 8 4-8 4-8-4zm0 0v10l8 4 8-4V7m-8 4v10',
  pulse: 'M3 12h3l2-5 4 10 2-5h7',
  shield: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zm-3 9l2 2 4-4',
  stethoscope: 'M6 4v5a6 6 0 0012 0V4M6 4H4m2 0h2m6 0h2m-2 0h-2m0 10v3a4 4 0 004 4h1',
  surgery: 'M4 20l6-6m0 0l4-4m-4 4l4 4m0-8l3-3 3 3-3 3M8 4l3 3-3 3-3-3 3-3 3 3 3-3 3-3-3 3-3',
  sync: 'M4 12a8 8 0 0114-5l2 2m0-5v5h-5M20 12a8 8 0 01-14 5l-2-2m0 5v-5h5',
};

export default function PremiumIcon({ name, ...props }: PremiumIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name]} />
    </svg>
  );
}

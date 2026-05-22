import React from 'react';
import { cn } from '../../lib/cn';

export type IconName =
  | 'search'
  | 'filter'
  | 'chart'
  | 'dashboard'
  | 'database'
  | 'tag'
  | 'menu'
  | 'log-out'
  | 'plus'
  | 'minus'
  | 'pencil'
  | 'trash'
  | 'palette'
  | 'rotate-clockwise'
  | 'image'
  | 'map-pin'
  | 'layers'
  | 'chevron-down'
  | 'arrow-counterclockwise'
  | 'building'
  | 'users'
  | 'ruler'
  | 'spark'
  | 'x'
  | 'check'
  | 'utensils'
  | 'store'
  | 'basket'
  | 'heart'
  | 'prayer';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

function IconPath({ name }: { name: IconName }) {
  switch (name) {
    case 'search':
      return <path d="M15.5 15.5 20 20m-9-2.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />;
    case 'filter':
      return <path d="M4 6h16M7 12h10m-7 6h4" />;
    case 'chart':
      return <path d="M5 19V9m7 10V5m7 14v-7" />;
    case 'dashboard':
      return (
        <>
          <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
        </>
      );
    case 'database':
      return (
        <>
          <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z" />
          <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
          <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
        </>
      );
    case 'tag':
      return (
        <>
          <path d="m20 10-8 8a2.8 2.8 0 0 1-4 0l-4-4a2.8 2.8 0 0 1 0-4l8-8H20v8Z" />
          <path d="M15.5 8.5h.01" />
        </>
      );
    case 'menu':
      return <path d="M4 7h16M4 12h16M4 17h16" />;
    case 'log-out':
      return (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </>
      );
    case 'plus':
      return <path d="M12 5v14M5 12h14" />;
    case 'minus':
      return <path d="M5 12h14" />;
    case 'pencil':
      return (
        <>
          <path d="m15 5 4 4" />
          <path d="M4 20l4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
        </>
      );
    case 'trash':
      return (
        <>
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V4h6v3" />
        </>
      );
    case 'palette':
      return (
        <>
          <path d="M12 4a8 8 0 1 0 0 16h1.2a1.8 1.8 0 0 0 0-3.6h-.7a1.6 1.6 0 0 1 0-3.2H14a6 6 0 0 0 0-12h-2Z" />
          <path d="M7.5 10.2h.01M9.5 7.5h.01M14.5 7.5h.01M16.5 10.2h.01" />
        </>
      );
    case 'rotate-clockwise':
      return (
        <>
          <path d="M20 12a8 8 0 1 1-2.35-5.65" />
          <path d="M20 4v5h-5" />
        </>
      );
    case 'image':
      return (
        <>
          <path d="M5 5h14v14H5z" />
          <path d="m5 15 4-4 3 3 2-2 5 5" />
          <path d="M14.5 8.5h.01" />
        </>
      );
    case 'map-pin':
      return (
        <>
          <path d="M12 21s6-4.9 6-10a6 6 0 1 0-12 0c0 5.1 6 10 6 10Z" />
          <path d="M12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        </>
      );
    case 'layers':
      return (
        <>
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </>
      );
    case 'chevron-down':
      return <path d="m6 9 6 6 6-6" />;
    case 'arrow-counterclockwise':
      return (
        <>
          <path d="M8 9H4V5" />
          <path d="M4.8 9A8 8 0 1 0 8 4.8" />
        </>
      );
    case 'building':
      return (
        <>
          <path d="M4 20h16" />
          <path d="M6 20V7l6-3 6 3v13" />
          <path d="M9 10h.01M15 10h.01M9 13h.01M15 13h.01M12 20v-4" />
        </>
      );
    case 'users':
      return (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <path d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 10v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case 'ruler':
      return (
        <>
          <path d="m14 4 6 6" />
          <path d="m17 2 5 5-9.5 9.5a2.12 2.12 0 0 1-3 0l-3-3a2.12 2.12 0 0 1 0-3L17 2Z" />
          <path d="M9 8 7.5 9.5M12 11l-1.5 1.5M15 14l-1.5 1.5" />
        </>
      );
    case 'spark':
      return (
        <>
          <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
          <path d="m18.5 15 .8 2 .7-2 2-.8-2-.7-.7-2-.8 2-2 .7 2 .8ZM5 16l.9 2.1L8 19l-2.1.9L5 22l-.9-2.1L2 19l2.1-.9L5 16Z" />
        </>
      );
    case 'x':
      return <path d="m6 6 12 12M18 6 6 18" />;
    case 'check':
      return <path d="m5 12 4.2 4.2L19 6.5" />;
    case 'utensils':
      return (
        <>
          <path d="M4.5 3v8.5a2.5 2.5 0 0 0 5 0V3M7 3v18" />
          <path d="M14.5 3v7c0 1.1.9 2 2 2H19V3m-2.5 9v9" />
        </>
      );
    case 'store':
      return (
        <>
          <path d="M4 8.5 5.5 4h13L20 8.5" />
          <path d="M5 9.5V19h14V9.5" />
          <path d="M9 19v-4h6v4" />
        </>
      );
    case 'basket':
      return (
        <>
          <path d="m5 10 2 9h10l2-9H5Z" />
          <path d="M9 10V8a3 3 0 1 1 6 0v2" />
        </>
      );
    case 'heart':
      return <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />;
    case 'prayer':
      return (
        <>
          <path d="M12 3c2.1 1.9 3.5 4.2 3.5 6.8 0 2.5-1.4 4.8-3.5 6.7-2.1-1.9-3.5-4.2-3.5-6.7C8.5 7.2 9.9 4.9 12 3Z" />
          <path d="M5 21h14" />
          <path d="M8.5 17h7" />
        </>
      );
    default:
      return null;
  }
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('h-4 w-4 shrink-0', className)}
      {...props}
    >
      <IconPath name={name} />
    </svg>
  );
}

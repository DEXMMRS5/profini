import { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
  sw?: number
}

function Icon({ d, size = 24, sw = 1.75, fill = 'none', children, ...p }: IconProps & { d?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
      strokeLinejoin="round" {...p}>
      {d && <path d={d} />}
      {children}
    </svg>
  )
}

export const IconBell = (p: IconProps) => <Icon {...p}><path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></Icon>
export const IconSearch = (p: IconProps) => <Icon {...p}><circle cx="10" cy="10" r="7" /><path d="M21 21l-6 -6" /></Icon>
export const IconPlus = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
export const IconChevronRight = (p: IconProps) => <Icon {...p}><path d="M9 6l6 6 -6 6" /></Icon>
export const IconChevronLeft = (p: IconProps) => <Icon {...p}><path d="M15 6l-6 6 6 6" /></Icon>
export const IconChevronDown = (p: IconProps) => <Icon {...p}><path d="M6 9l6 6 6 -6" /></Icon>
export const IconCalendar = (p: IconProps) => <Icon {...p}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M16 3v4M8 3v4M4 11h16" /></Icon>
export const IconEuro = (p: IconProps) => <Icon {...p}><path d="M17.2 5A6 6 0 0 0 12.5 3a7 7 0 0 0 0 14 6 6 0 0 0 4.7 -2" /><path d="M5 10h11M5 14h11" /></Icon>
export const IconClock = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
export const IconCheck = (p: IconProps) => <Icon {...p}><path d="M5 12l5 5L20 7" /></Icon>
export const IconCheckCircle = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4 -4" /></Icon>
export const IconAlertCircle = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></Icon>
export const IconHome = (p: IconProps) => <Icon {...p}><path d="M5 12l-2 0 9 -9 9 9 -2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M10 21v-6h4v6" /></Icon>
export const IconBriefcase = (p: IconProps) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" /></Icon>
export const IconSettings = (p: IconProps) => <Icon {...p}><path d="M10.3 4.3a2 2 0 0 1 3.4 0 2 2 0 0 0 2.7 1.1 2 2 0 0 1 2.4 2.4 2 2 0 0 0 1.1 2.7 2 2 0 0 1 0 3.4 2 2 0 0 0 -1.1 2.7 2 2 0 0 1 -2.4 2.4 2 2 0 0 0 -2.7 1.1 2 2 0 0 1 -3.4 0 2 2 0 0 0 -2.7 -1.1 2 2 0 0 1 -2.4 -2.4 2 2 0 0 0 -1.1 -2.7 2 2 0 0 1 0 -3.4 2 2 0 0 0 1.1 -2.7 2 2 0 0 1 2.4 -2.4 2 2 0 0 0 2.7 -1.1" /><circle cx="12" cy="12" r="3" /></Icon>
export const IconDots = (p: IconProps) => <Icon {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Icon>
export const IconUser = (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6 -6h4a6 6 0 0 1 6 6v1" /></Icon>
export const IconUserCheck = (p: IconProps) => <Icon {...p}><circle cx="9" cy="8" r="4" /><path d="M3 21v-1a6 6 0 0 1 6 -6h3" /><path d="M16 17l2 2 4 -4" /></Icon>
export const IconPhone = (p: IconProps) => <Icon {...p}><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2A16 16 0 0 1 3 6a2 2 0 0 1 2 -2" /></Icon>
export const IconMail = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9 -6" /></Icon>
export const IconMapPin = (p: IconProps) => <Icon {...p}><path d="M12 21s-7 -6.5 -7 -12a7 7 0 0 1 14 0c0 5.5 -7 12 -7 12z" /><circle cx="12" cy="9" r="2.5" /></Icon>
export const IconCamera = (p: IconProps) => <Icon {...p}><path d="M4 8h3l2 -3h6l2 3h3a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2" /><circle cx="12" cy="13" r="4" /></Icon>
export const IconCameraPlus = (p: IconProps) => <Icon {...p}><path d="M12 20H5a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h2l2 -3h6l1 1.5" /><circle cx="11" cy="13" r="3" /><path d="M18 14v6M15 17h6" /></Icon>
export const IconX = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6l-12 12" /></Icon>
export const IconRotateCcw = (p: IconProps) => <Icon {...p}><path d="M9 14l-4 -4 4 -4" /><path d="M5 10h11a4 4 0 1 1 0 8h-1" /></Icon>
export const IconHand = (p: IconProps) => <Icon {...p}><path d="M8 13V5a1.5 1.5 0 0 1 3 0v6" /><path d="M11 11V4a1.5 1.5 0 0 1 3 0v7" /><path d="M14 10V5a1.5 1.5 0 0 1 3 0v9" /><path d="M17 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1 -7 7h-1a7 7 0 0 1 -7 -7l-2 -3.5a1.5 1.5 0 0 1 2.6 -1.5L8 11" /></Icon>
export const IconDownload = (p: IconProps) => <Icon {...p}><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5 5 -5" /><path d="M12 4v12" /></Icon>
export const IconStar = (p: IconProps) => <Icon {...p}><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" /></Icon>
export const IconRocket = (p: IconProps) => <Icon {...p}><path d="M4 13a8 8 0 0 1 7 -7 5 5 0 0 1 5 5 8 8 0 0 1 -7 7v-3l-2 -2" /><path d="M7 14a4.6 4.6 0 0 0 -3 4 4.6 4.6 0 0 0 4 -3" /><circle cx="14" cy="9" r="1" /></Icon>
export const IconFile = (p: IconProps) => <Icon {...p}><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /></Icon>
export const IconTrendingUp = (p: IconProps) => <Icon {...p}><path d="M3 17l6 -6 4 4 8 -8" /><path d="M14 7h7v7" /></Icon>
export const IconLogOut = (p: IconProps) => <Icon {...p}><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3m0 6l3 -3" /></Icon>

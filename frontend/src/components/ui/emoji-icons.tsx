interface IconProps {
  className?: string;
  size?: number;
}

function icon(props: IconProps, paths: string[], filled = false) {
  const s = props.size || 16;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={s} height={s} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return icon(props, ['M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6', 'M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z']);
}

export function ShoppingBagsIcon(props: IconProps) {
  return icon(props, ['M8 2L6 6h4L8 2zM16 2l-2 4h4l-2-4z', 'M4 8h16l-1 14H5L4 8z']);
}

export function PackageIcon(props: IconProps) {
  return icon(props, ['M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'M12 22V12', 'M12 12L3 7', 'M12 12l9-5']);
}

export function TagIcon(props: IconProps) {
  return icon(props, ['M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z', 'M7 7h.01']);
}

export function MoneyIcon(props: IconProps) {
  return icon(props, ['M12 1a3 3 0 0 0-3 3v16a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z', 'M4 7h16', 'M4 17h16'], true);
}

export function CreditCardIcon(props: IconProps) {
  return icon(props, ['M22 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6z', 'M2 10h20']);
}

export function TicketIcon(props: IconProps) {
  return icon(props, ['M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2', 'M2 16v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2', 'M12 8v8', 'M9 12h6']);
}

export function ChatIcon(props: IconProps) {
  return icon(props, ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z']);
}

export function EmailIcon(props: IconProps) {
  return icon(props, ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6']);
}

export function PhoneIcon(props: IconProps) {
  return icon(props, ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z']);
}

export function MobileIcon(props: IconProps) {
  return icon(props, ['M12 18h.01', 'M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z']);
}

export function DocumentIcon(props: IconProps) {
  return icon(props, ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8']);
}

export function ClipboardIcon(props: IconProps) {
  return icon(props, ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M15 2H9a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z']);
}

export function ChartUpIcon(props: IconProps) {
  return icon(props, ['M18 20V10', 'M12 20V4', 'M6 20v-6']);
}

export function ChartDownIcon(props: IconProps) {
  return icon(props, ['M18 20v-4', 'M12 20V8', 'M6 20v-10']);
}

export function CheckIcon(props: IconProps) {
  return icon(props, ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3']);
}

export function HeartIcon(props: IconProps) {
  return icon(props, ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'], true);
}

export function ThumbsUpIcon(props: IconProps) {
  return icon(props, ['M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3']);
}

export function ThumbsDownIcon(props: IconProps) {
  return icon(props, ['M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2']);
}

export function FireIcon(props: IconProps) {
  return icon(props, ['M12 2l.95 2.85a10 10 0 0 1 5.12 3.13C20.27 10.6 22 13.56 22 17c0 5-4.5 7-10 7S2 22 2 17c0-3.44 1.73-6.4 3.93-9.02a10 10 0 0 1 5.12-3.13L12 2z', 'M12 12v6']);
}

export function LightningIcon(props: IconProps) {
  return icon(props, ['M13 2L3 14h9l-1 8 10-12h-9l1-8z']);
}

export function TargetIcon(props: IconProps) {
  return icon(props, ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'], true);
}

export function SearchIcon(props: IconProps) {
  return icon(props, ['M14 14l6 6', 'M10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z']);
}

export function LockIcon(props: IconProps) {
  return icon(props, ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4']);
}

export function BellIcon(props: IconProps) {
  return icon(props, ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0']);
}

export function GiftIcon(props: IconProps) {
  return icon(props, ['M20 12v10H4V12', 'M2 7h20v5H2z', 'M12 7V2', 'M12 2a3 3 0 0 0-3 3v2', 'M12 2a3 3 0 0 1 3 3v2']);
}

export function StarIcon(props: IconProps) {
  return icon(props, ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'], true);
}

export function UsersIcon(props: IconProps) {
  return icon(props, ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']);
}

export function UserIcon(props: IconProps) {
  return icon(props, ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z']);
}

export function EyeIcon(props: IconProps) {
  return icon(props, ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z']);
}

export function CrownIcon(props: IconProps) {
  return icon(props, ['M2 20h20M4 12l4-8 4 6 4-8 4 8-2 8H6z']);
}

export function LaptopIcon(props: IconProps) {
  return icon(props, ['M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12', 'M2 20h20']);
}

export function RobotIcon(props: IconProps) {
  return icon(props, ['M12 2v4M8 12h.01M16 12h.01M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z', 'M6 18h12']);
}

export function MoonIcon(props: IconProps) {
  return icon(props, ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'], true);
}

export function SunIcon(props: IconProps) {
  return icon(props, ['M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42', 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z']);
}

export function RocketIcon(props: IconProps) {
  return icon(props, ['M12 15l-3-3', 'M20 4l-2 2', 'M4.93 19.07l5.66-5.66', 'M4 15l7-7', 'M12 2C8 2 4 6 4 10c0 3 2 6 6 8 2 1 4 2 4 2s2-1 4-2c4-2 6-5 6-8 0-4-4-8-8-8z']);
}

export function TruckIcon(props: IconProps) {
  return icon(props, ['M1 17h2M14 17h7', 'M14 5h4l4 5v7h-2', 'M4 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z', 'M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z']);
}

export function PinIcon(props: IconProps) {
  return icon(props, ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'], true);
}

export function ClockIcon(props: IconProps) {
  return icon(props, ['M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z', 'M12 6v6l4 2']);
}

export function MedalGoldIcon(props: IconProps) {
  return icon(props, ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M9 3L4 7l3 7', 'M15 3l5 4-3 7']);
}

export function MedalSilverIcon(props: IconProps) {
  return icon(props, ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M9 3L4 7l3 7', 'M15 3l5 4-3 7']);
}

export function MedalBronzeIcon(props: IconProps) {
  return icon(props, ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M9 3L4 7l3 7', 'M15 3l5 4-3 7']);
}

export function DiamondIcon(props: IconProps) {
  return icon(props, ['M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'], true);
}

export function PartyIcon(props: IconProps) {
  return icon(props, ['M5 22L19 8', 'M3 11l4-4', 'M17 3l-4 4', 'M12 16l4-4', 'M8 8l4-4', 'M20 20l-4 4', 'M3 19l2-2']);
}

export function GearIcon(props: IconProps) {
  return icon(props, ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z']);
}

export function PaletteIcon(props: IconProps) {
  return icon(props, ['M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2 2 0 0 0 2-2 2 2 0 0 0-.58-1.42 2 2 0 0 1 0-2.83A2 2 0 0 1 15 14h.5a3.5 3.5 0 0 0 3.5-3.5c0-4.96-4.49-9-11-9z', 'M7 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M11 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M16 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z']);
}

export function SparklesIcon(props: IconProps) {
  return icon(props, ['M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z', 'M19 17l-1.5-1.5', 'M5 17l1.5-1.5', 'M12 22v-3']);
}

export function WaveIcon(props: IconProps) {
  return icon(props, ['M2 11v4a5 5 0 0 0 5 5h4', 'M6 11V5a2 2 0 0 1 2-2h.5a2 2 0 0 1 2 2v6', 'M10 11V7a2 2 0 0 1 2-2h.5a2 2 0 0 1 2 2v4', 'M14 13V9a2 2 0 0 1 2-2h.5a2 2 0 0 1 2 2v4']);
}

export function CardIcon(props: IconProps) {
  return icon(props, ['M22 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6z', 'M2 10h20']);
}

export function CloseIcon(props: IconProps) {
  return icon(props, ['M18 6L6 18', 'M6 6l12 12']);
}

export function SparkleIcon(props: IconProps) {
  return icon(props, ['M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z', 'M19 17l-1.5-1.5', 'M5 17l1.5-1.5', 'M12 22v-3']);
}

export function DressIcon(props: IconProps) {
  return icon(props, ['M8 2l-2 6h4V2', 'M16 2l2 6h-4V2', 'M6 8h12l-1 14H7L6 8z']);
}

export function BuildingIcon(props: IconProps) {
  return icon(props, ['M3 21h18', 'M6 21V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14', 'M10 3v3h4V3', 'M10 11h4', 'M10 15h4', 'M10 19h4']);
}

export function BirdIcon(props: IconProps) {
  return icon(props, ['M17 2l-3 4h5l-4 5', 'M12 16c-3 0-6-2.5-6-7 0-2 2-4 6-4s6 2 6 4', 'M12 16v4', 'M9 20h6']);
}

export function MapIcon(props: IconProps) {
  return icon(props, ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z']);
}

export function ArrowRightIcon(props: IconProps) {
  return icon(props, ['M5 12h14', 'M12 5l7 7-7 7']);
}

export function SleepingIcon(props: IconProps) {
  return icon(props, ['M2 12a10 10 0 0 1 10-10c5.5 0 10 4.5 10 10s-4.5 10-10 10', 'M7 9v2', 'M17 9v2', 'M9 16h6']);
}

export function PrayIcon(props: IconProps) {
  return icon(props, ['M7 10v4a3 3 0 0 0 3 3h3', 'M7 5l3 3-3 3', 'M17 10v4a3 3 0 0 1-3 3h-3', 'M17 5l-3 3 3 3']);
}

export function EyeSingleIcon(props: IconProps) {
  return icon(props, ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z']);
}

export function TrendingIcon(props: IconProps) {
  return icon(props, ['M22 12h-4l-3 9L9 3l-3 9H2']);
}

export function MailboxIcon(props: IconProps) {
  return icon(props, ['M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', 'M10 12H2', 'M10 8H2']);
}

export function NumbersIcon(props: IconProps) {
  return icon(props, ['M4 20V4l-2 2', 'M18 4h-4v16h4', 'M10 4v4', 'M10 8h-2', 'M10 12h-1', 'M10 16h-2', 'M10 20h-1']);
}

export function BrainIcon(props: IconProps) {
  return icon(props, ['M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12l-2-1-2 1V9.5c-1.2-.7-2-2-2-3.5a4 4 0 0 1 4-4z', 'M12 14v4', 'M8 18h8', 'M12 22v-4']);
}

export function DiamondBlueIcon(props: IconProps) {
  return icon(props, ['M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'], true);
}

export function BookIcon(props: IconProps) {
  return icon(props, ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', 'M12 6v7', 'M9 9h6']);
}

export function ShareIcon(props: IconProps) {
  return icon(props, ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13']);
}

export function TrophyIcon(props: IconProps) {
  return icon(props, ['M6 9H4.5a2.5 2.5 0 0 1 0-5H6', 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18', 'M4 22h16', 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22', 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22', 'M18 2H6v7a6 6 0 0 0 12 0V2z']);
}

export function SquareIcon(props: IconProps) {
  return icon(props, ['M3 3h18v18H3z']);
}

export function BellIconOutline(props: IconProps) {
  return icon(props, ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0']);
}

export function ArrowLeftIcon(props: IconProps) {
  return icon(props, ['M19 12H5', 'M12 19l-7-7 7-7']);
}

export function FilterIcon(props: IconProps) {
  return icon(props, ['M22 3H2l8 9.46V19l4 2v-8.54L22 3z']);
}

export function RefreshIcon(props: IconProps) {
  return icon(props, ['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15']);
}

export function PlusIcon(props: IconProps) {
  return icon(props, ['M12 5v14', 'M5 12h14']);
}

export function ChartIcon(props: IconProps) {
  return icon(props, ['M18 20V10', 'M12 20V4', 'M6 20v-6']);
}

export function StoreIcon(props: IconProps) {
  return icon(props, ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10']);
}

export function TrendingUpIcon(props: IconProps) {
  return icon(props, ['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6']);
}

export function ShieldIcon(props: IconProps) {
  return icon(props, ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']);
}

export function ZapIcon(props: IconProps) {
  return icon(props, ['M13 2L3 14h9l-1 8 10-12h-9l1-8z']);
}

export function MapPinIcon(props: IconProps) {
  return icon(props, ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z']);
}

export function CheckCircleIcon(props: IconProps) {
  return icon(props, ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3']);
}

export function AlertIcon(props: IconProps) {
  return icon(props, ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5M2 12l10 5 10-5', 'M12 9v4', 'M12 17h.01']);
}

export function CopyIcon(props: IconProps) {
  return icon(props, ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M15 2H9a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z']);
}

export function MedalIcon(props: IconProps) {
  return icon(props, ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M9 3L4 7l3 7', 'M15 3l5 4-3 7']);
}

export function MailIcon(props: IconProps) {
  return icon(props, ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6']);
}

export function TrashIcon(props: IconProps) {
  return icon(props, ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M10 11v6', 'M14 11v6']);
}

export function PercentIcon(props: IconProps) {
  return icon(props, ['M19 5L5 19', 'M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M16 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z']);
}

export function PaperclipIcon(props: IconProps) {
  return icon(props, ['M10 4v12a4 4 0 0 0 8 0V6a2 2 0 0 0-4 0v10a2 2 0 0 0 4 0', 'M14 4H6a4 4 0 0 0 0 8h6']);
}

export function CalendarIcon(props: IconProps) {
  return icon(props, ['M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18']);
}

export function CoinIcon(props: IconProps) {
  return icon(props, ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v12', 'M15 9h-3.5a2 2 0 0 0 0 4H12a2 2 0 0 1 0 4H9']);
}

export function MessageIcon(props: IconProps) {
  return icon(props, ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'M8 9h8', 'M8 13h6']);
}

export function SettingsIcon(props: IconProps) {
  return icon(props, ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z']);
}

export function HelpIcon(props: IconProps) {
  return icon(props, ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01']);
}

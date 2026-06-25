import React from 'react';
import { cn } from '../../lib/utils';

export type SupportedCountryCode = 'PK' | 'IN' | 'AO' | 'MA' | 'DZ' | 'EG';

export interface CountryCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  countryCode: SupportedCountryCode;
  countryName: string;
  active?: boolean;
  slotsAvailable?: number;
  lastChecked?: string;
  onClick?: () => void;
}

// Inline SVGs for flags to ensure zero-network, local, high-fidelity renders
const CountryFlag: React.FC<{ code: SupportedCountryCode; className?: string }> = ({ code, className }) => {
  const svgProps = {
    className: cn('h-6 w-9 rounded object-cover shadow-sm shrink-0 border border-border-default/10', className),
    viewBox: "0 0 900 600",
    xmlns: "http://www.w3.org/2000/svg"
  };

  switch (code) {
    case 'PK': // Pakistan Flag
      return (
        <svg {...svgProps}>
          <rect width="900" height="600" fill="#115c3e" />
          <rect width="225" height="600" fill="#ffffff" />
          <circle cx="562.5" cy="300" r="180" fill="#ffffff" />
          <circle cx="607.5" cy="255" r="180" fill="#115c3e" />
          <polygon points="463,180 472,207 500,207 477,224 486,251 463,234 440,251 449,224 426,207 454,207" fill="#ffffff" transform="rotate(-35 463 215)" />
        </svg>
      );
    case 'IN': // India Flag
      return (
        <svg {...svgProps} viewBox="0 0 900 600">
          <rect width="900" height="200" fill="#FF9933" />
          <rect y="200" width="900" height="200" fill="#FFFFFF" />
          <rect y="400" width="900" height="200" fill="#128807" />
          <g transform="translate(450, 300)">
            <circle r="92" fill="none" stroke="#000080" strokeWidth="6" />
            <circle r="16" fill="#000080" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="0"
                x2="0"
                y2="-92"
                stroke="#000080"
                strokeWidth="3.5"
                transform={`rotate(${(i * 360) / 24})`}
              />
            ))}
          </g>
        </svg>
      );
    case 'AO': // Angola Flag
      return (
        <svg {...svgProps}>
          <rect width="900" height="300" fill="#d81d22" />
          <rect y="300" width="900" height="300" fill="#000000" />
          <g transform="translate(450, 300) scale(1.3)" fill="#f9dc1a">
            {/* Gear segment representation */}
            <path d="M -40,-40 A 55,55 0 0,1 40,-40 L 48,-32 A 65,65 0 0,0 -48,-32 Z" />
            {/* Machete representation */}
            <path d="M -20,20 L 40,-30 A 10,10 0 0,1 50,-20 L -10,35 Z" />
            {/* Center Star */}
            <polygon points="0,-12 3.5,-2 12.5,-2 5,-8 8,1 0,-3 -8,1 -5,-8 -12.5,-2 -3.5,-2" />
          </g>
        </svg>
      );
    case 'MA': // Morocco Flag
      return (
        <svg {...svgProps}>
          <rect width="900" height="600" fill="#c1272d" />
          <polygon
            points="450,135 482,235 565,235 498,285 523,385 450,335 377,385 402,285 335,235 418,235"
            fill="none"
            stroke="#006233"
            strokeWidth="15"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'DZ': // Algeria Flag
      return (
        <svg {...svgProps}>
          <rect width="450" height="600" fill="#006633" />
          <rect x="450" width="450" height="600" fill="#ffffff" />
          <path d="M 525,300 A 110,110 0 1,0 425,190 A 90,90 0 1,1 425,190 Z" fill="#d21034" />
          <polygon points="490,300 525,275 525,325 480,290 515,315" fill="#d21034" transform="rotate(-20 505 300) scale(1.2)" />
        </svg>
      );
    case 'EG': // Egypt Flag
      return (
        <svg {...svgProps}>
          <rect width="900" height="200" fill="#c00c12" />
          <rect y="200" width="900" height="200" fill="#ffffff" />
          <rect y="400" width="900" height="200" fill="#000000" />
          <g transform="translate(450, 300) scale(0.6)" fill="#c0930c">
            {/* Eagle of Saladin representation */}
            <path d="M -50,-80 L -30,-90 L -10,-80 L 10,-80 L 30,-90 L 50,-80 L 60,-40 L 40,60 L -40,60 L -60,-40 Z" />
            <path d="M -20,60 L 20,60 L 25,80 L -25,80 Z" />
            {/* Wings */}
            <path d="M -60,-40 L -90,20 L -80,50 L -40,30 Z" />
            <path d="M 60,-40 L 90,20 L 80,50 L 40,30 Z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

export const CountryCard: React.FC<CountryCardProps> = ({
  countryCode,
  countryName,
  active = false,
  slotsAvailable = 0,
  lastChecked = 'Never',
  onClick,
  className,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 ease-out select-none cursor-pointer',
        active
          ? 'bg-primary-50/40 border-primary-500 shadow-md shadow-primary-500/10 dark:bg-primary-950/20 dark:border-primary-500'
          : 'bg-canvas-base border-border-default hover:border-text-muted/30 hover:shadow-sm',
        className
      )}
      role="button"
      aria-pressed={active}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CountryFlag code={countryCode} />
          <div>
            <h4 className="font-bold text-sm text-text-primary tracking-tight">{countryName}</h4>
            <span className="text-xs font-semibold text-text-muted">{countryCode}</span>
          </div>
        </div>
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full border transition-all duration-200',
            active
              ? 'bg-primary-500 border-primary-100 dark:border-primary-900 shadow-sm shadow-primary-500'
              : 'bg-canvas-tertiary border-border-default'
          )}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-border-default/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Last Checked</span>
          <span className="text-xs text-text-secondary font-medium">{lastChecked}</span>
        </div>
        <div className="text-end">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block">Slots Found</span>
          <span
            className={cn(
              'text-sm font-bold',
              slotsAvailable > 0
                ? 'text-primary-500 dark:text-primary-500'
                : 'text-text-secondary'
            )}
          >
            {slotsAvailable}
          </span>
        </div>
      </div>
    </div>
  );
};

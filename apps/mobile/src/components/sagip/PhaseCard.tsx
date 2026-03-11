import type { ReactNode } from 'react';

type PhaseCardProps = {
  phaseLabel: string;
  title: string;
  description: string;
  borderColor: 'yellow' | 'red' | 'blue';
  icon: ReactNode;
  progress?: number;
  liveLabel?: string;
};

const borderClasses = {
  yellow: 'border-l-asean-yellow',
  red: 'border-l-asean-red',
  blue: 'border-l-asean-blue',
};

const phaseLabelColors = {
  yellow: 'text-asean-blue',
  red: 'text-asean-red',
  blue: 'text-asean-blue',
};

export function PhaseCard({
  phaseLabel,
  title,
  description,
  borderColor,
  icon,
  progress = 0,
  liveLabel,
}: PhaseCardProps) {
  return (
    <div
      className={`bg-white border-l-8 border-solid flex flex-col gap-4 pl-7 pr-5 py-5 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] w-full overflow-hidden relative ${borderClasses[borderColor]}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="min-w-0 flex-1 relative">
          <p
            className={`font-sagip font-bold text-xs tracking-[1.2px] uppercase absolute left-0 top-0 ${phaseLabelColors[borderColor]}`}
          >
            {phaseLabel}
          </p>
          <h3 className="font-sagip font-bold text-sagip-heading text-xl leading-7 mt-5">
            {title}
          </h3>
          <p className="font-sagip font-normal text-sagip-muted text-sm leading-[23px] mt-3">
            {description}
          </p>
        </div>
        <div
          className={`shrink-0 size-10 flex items-center justify-center ${borderColor === 'yellow' ? 'text-asean-yellow' : borderColor === 'red' ? 'text-asean-red' : 'text-asean-blue'}`}
        >
          {icon}
        </div>
      </div>
      {progress > 0 && (
        <div className="flex gap-2 items-center justify-center w-full">
          <div
            className="flex-1 h-1.5 rounded-full bg-asean-yellow max-w-[33%]"
          />
          <div className="flex-1 h-1.5 rounded-full bg-sagip-border" />
          <div className="flex-1 h-1.5 rounded-full bg-sagip-border" />
        </div>
      )}
      {liveLabel && (
        <div className="flex items-center justify-between w-full">
          <span className="font-sagip font-bold text-asean-red text-[10px] uppercase">
            {liveLabel}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-3 text-asean-red"
          >
            <path
              fillRule="evenodd"
              d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

import { Radio, TrendingUp, Users } from 'lucide-react';
import { PhaseCard } from './PhaseCard';

function IconInfo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ManagementPhases() {
  return (
    <section className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-sagip font-bold text-asean-blue text-lg tracking-[-0.45px] uppercase leading-7">
          Management Phases
        </h2>
        <button
          type="button"
          className="size-5 text-asean-blue hover:opacity-80"
          aria-label="More information"
        >
          <IconInfo className="size-5" />
        </button>
      </div>
      <PhaseCard
        phaseLabel="Phase 01"
        title="Proactive Intelligence"
        description="Early warning systems and predictive mapping for upcoming events."
        borderColor="yellow"
        icon={<TrendingUp className="size-10" />}
        progress={1}
      />
      <PhaseCard
        phaseLabel="Phase 02"
        title="Golden Hour Response"
        description="Critical 72-hour mobilization and tactical resource deployment."
        borderColor="red"
        icon={<Radio className="size-10" />}
        liveLabel="Live Updates Available"
      />
      <PhaseCard
        phaseLabel="Phase 03"
        title="Recovery & Trust"
        description="Community rebuilding and strengthening institutional transparency."
        borderColor="blue"
        icon={<Users className="size-10" />}
      />
    </section>
  );
}

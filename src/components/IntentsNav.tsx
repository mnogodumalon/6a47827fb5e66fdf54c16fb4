import { NavLink } from 'react-router-dom';
import { IconWand } from '@tabler/icons-react';
import { INTENTS, INTENTS_PENDING } from '@/config/intents';

/**
 * IntentsNav — sidebar section for intent workflow pages ("Abläufe").
 *
 * Renders automatically from the `src/config/intents.ts` registry: as soon as
 * the intents orchestrator registers a page there, it appears here — no
 * Layout edit. Active route gets the sidebar-accent highlight; `onNavigate`
 * lets the Layout close the mobile sidebar on click.
 *
 * While INTENTS_PENDING (the Phase-1 deploy window) the section shows ghost
 * shimmer rows instead — the workflows announce themselves in the nav, not as
 * placeholder cards on the dashboard. Empty AND not pending → nothing.
 */
const HEADING = 'Abläufe';
const PENDING_TEXT = 'Werden erstellt …';

export function IntentsNav({ onNavigate }: { onNavigate?: () => void }) {
  if (INTENTS.length === 0 && !INTENTS_PENDING) return null;

  if (INTENTS.length === 0) {
    return (
      <nav className="px-3 pt-4" aria-label={HEADING}>
        <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          {HEADING}
        </p>
        <div className="space-y-0.5" aria-hidden>
          {['w-28', 'w-36'].map(w => (
            <div key={w} className="flex items-center gap-2 px-4 py-2 opacity-60">
              <div className="h-4 w-4 shrink-0 rounded bg-sidebar-accent animate-pulse" />
              <div className={`h-3 ${w} rounded bg-sidebar-accent animate-pulse`} />
            </div>
          ))}
        </div>
        <p className="px-4 pt-1 text-xs text-sidebar-foreground/50">{PENDING_TEXT}</p>
      </nav>
    );
  }

  return (
    <nav className="px-3 pt-4" aria-label={HEADING}>
      <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
        {HEADING}
      </p>
      <div className="space-y-0.5">
        {INTENTS.map(intent => {
          const Icon = intent.icon ?? IconWand;
          return (
            <NavLink
              key={intent.path}
              to={intent.path}
              title={intent.description}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-2xl text-base transition-colors min-w-0 font-normal ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`
              }
            >
              <Icon size={16} className="shrink-0 text-sidebar-foreground/70" />
              <span className="truncate">{intent.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

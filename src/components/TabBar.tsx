// Navigation: bottom tab bar (mobile) — hidden on desktop where the
// sidebar takes over. TABS is shared by both.

import type {TabId} from '../types';
import {CalendarIcon, ChartIcon, ClockIcon, UserIcon, type IconProps} from './icons';

export type TabDef = {id: TabId; label: string; Icon: (p: IconProps) => React.JSX.Element};

export const TABS: TabDef[] = [
  {id: 'today', label: 'Hoje', Icon: ClockIcon},
  {id: 'plan', label: 'Plano', Icon: CalendarIcon},
  {id: 'progress', label: 'Progresso', Icon: ChartIcon},
  {id: 'data', label: 'Dados', Icon: UserIcon},
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{paddingBottom: 'env(safe-area-inset-bottom)'}}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map(({id, label, Icon}) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ' +
                (isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600')
              }
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

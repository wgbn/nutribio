// Desktop navigation sidebar (md+); hidden on mobile where TabBar is used.

import type {TabId} from '../types';
import {GearIcon, LeafIcon} from './icons';
import {TABS} from './TabBar';

export function Sidebar({
  active,
  onChange,
  onOpenSettings,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  onOpenSettings: () => void;
}) {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex"
      style={{paddingTop: 'env(safe-area-inset-top)'}}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <LeafIcon size={22} />
        </div>
        <span className="text-xl font-bold tracking-tight text-emerald-700">Nutribio</span>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {TABS.map(({id, label, Icon}) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ' +
                (isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')
              }
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <GearIcon size={20} />
          <span>Definições</span>
        </button>
      </div>
    </aside>
  );
}

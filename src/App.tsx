// App shell: onboarding gate, tab navigation and settings overlay.

import {useState} from 'react';

import {TabBar} from './components/TabBar';
import {StoreProvider, useStore} from './hooks/useStore';
import {EditData} from './screens/EditData';
import {Onboarding} from './screens/Onboarding';
import {Plan} from './screens/Plan';
import {Progress} from './screens/Progress';
import {Settings} from './screens/Settings';
import {Today} from './screens/Today';
import type {TabId} from './types';

function Shell() {
  const {profile} = useStore();
  const [tab, setTab] = useState<TabId>('today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The onboarding owns the flow (including the "generate now?" dialog),
  // so it stays mounted until the user explicitly finishes it.
  const [onboardingDone, setOnboardingDone] = useState(() => !!profile);

  if (!onboardingDone) {
    return <Onboarding onDone={() => setOnboardingDone(true)} />;
  }

  if (settingsOpen) {
    return <Settings onClose={() => setSettingsOpen(false)} />;
  }

  return (
    <div className="min-h-dvh bg-[#f6f8f7]">
      {tab === 'today' ? (
        <Today onNavigate={setTab} onOpenSettings={() => setSettingsOpen(true)} />
      ) : null}
      {tab === 'plan' ? <Plan onOpenSettings={() => setSettingsOpen(true)} /> : null}
      {tab === 'progress' ? (
        <Progress onAddMeasurement={() => setTab('data')} onOpenSettings={() => setSettingsOpen(true)} />
      ) : null}
      {tab === 'data' ? <EditData onOpenSettings={() => setSettingsOpen(true)} /> : null}
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

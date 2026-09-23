// App shell: onboarding gate, responsive navigation (sidebar on desktop,
// bottom tab bar on mobile) and settings overlay.

import {useState} from 'react';

import {GenerationFeedback} from './components/GenerationFeedback';
import {Sidebar} from './components/Sidebar';
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
  // Incremented when the user asks to register a new measurement (Progress CTA).
  const [newMeasurementSignal, setNewMeasurementSignal] = useState(0);
  // The onboarding owns the flow (including the "generate now?" dialog),
  // so it stays mounted until the user explicitly finishes it.
  const [onboardingDone, setOnboardingDone] = useState(() => !!profile);

  if (!onboardingDone) {
    return (
      <>
        <Onboarding onDone={() => setOnboardingDone(true)} />
        <GenerationFeedback onViewPlan={() => setTab('plan')} />
      </>
    );
  }

  if (settingsOpen) {
    return (
      <>
        <Settings onClose={() => setSettingsOpen(false)} />
        <GenerationFeedback onViewPlan={() => setTab('plan')} />
      </>
    );
  }

  const openSettings = () => setSettingsOpen(true);

  return (
    <div className="min-h-dvh bg-[#f6f8f7] md:pl-64">
      <Sidebar active={tab} onChange={setTab} onOpenSettings={openSettings} />
      {tab === 'today' ? <Today onNavigate={setTab} onOpenSettings={openSettings} /> : null}
      {tab === 'plan' ? <Plan onOpenSettings={openSettings} /> : null}
      {tab === 'progress' ? (
        <Progress
          onAddMeasurement={() => {
            setNewMeasurementSignal((n) => n + 1);
            setTab('data');
          }}
          onOpenSettings={openSettings}
        />
      ) : null}
      {tab === 'data' ? (
        <EditData onOpenSettings={openSettings} newMeasurementSignal={newMeasurementSignal} />
      ) : null}
      <TabBar active={tab} onChange={setTab} />
      <GenerationFeedback onViewPlan={() => setTab('plan')} />
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

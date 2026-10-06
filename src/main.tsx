import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';

import App from './App';
import './index.css';
import {initI18n} from './i18n';
import {ensureSchemaVersion, loadSettings} from './lib/storage';

ensureSchemaVersion();
registerSW({immediate: true});

// Initialize i18n (device language or saved preference) before the first
// render so the UI mounts already translated and <html lang> is correct.
initI18n(loadSettings().locale).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

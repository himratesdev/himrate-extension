import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '../shared/i18n';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '../shared/neo-brutiful.css';
import { Popup } from './Popup';

initI18n().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Popup />
    </StrictMode>
  );
});

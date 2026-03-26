import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '../shared/i18n';
import '../shared/fonts';
import '../shared/neo-brutiful.css';
import { SidePanel } from './SidePanel';

initI18n().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SidePanel />
    </StrictMode>
  );
});

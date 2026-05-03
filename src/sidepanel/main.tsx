import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '../shared/i18n';
import '../shared/fonts';
// BUG-016 PR-1: canonical CSS = single source of truth (wireframe HTML lines 11-1275).
// Replaces shared/neo-brutiful.css для side panel — wireframe-driven sp-* classes
// + design tokens. neo-brutiful.css остаётся в popup для legacy compat.
import './styles/canonical.css';
import { SidePanel } from './SidePanel';

initI18n().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SidePanel />
    </StrictMode>
  );
});

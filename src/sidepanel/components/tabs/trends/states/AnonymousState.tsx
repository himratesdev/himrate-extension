// TASK-039 Phase D1 CR S-4: Dedicated state для anonymous (non-authenticated) users.
// Показывает explicit sign-in prompt вместо misleading "Error, retry" flow.
// D2 расширит с Google/Twitch auth buttons (reuse existing Login handler).

import { useTranslation } from 'react-i18next';

interface Props {
  onSignIn?: () => void;
}

export function AnonymousState({ onSignIn }: Props) {
  const { t } = useTranslation();
  return (
    <div className="trends-anonymous-state" role="region" aria-label={t('trends.anonymous.aria')}>
      <div className="trends-anonymous-icon" aria-hidden="true">🔒</div>
      <div className="trends-anonymous-title">{t('trends.anonymous.title')}</div>
      <div className="trends-anonymous-message">{t('trends.anonymous.message')}</div>
      {onSignIn && (
        <button type="button" className="trends-anonymous-cta" onClick={onSignIn}>
          {t('trends.anonymous.sign_in')}
        </button>
      )}
    </div>
  );
}

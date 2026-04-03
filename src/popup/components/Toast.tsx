// TASK-034/077: ToastPush — push notification below header.
// FR-017: position top 8px, border-radius 8px, optional dismiss × button.

import { useState } from 'react';

interface Props {
  message: string;
  onDismiss?: () => void;
}

export function Toast({ message, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="toast-push">
      <span>{message}</span>
      <button className="toast-dismiss" onClick={handleDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

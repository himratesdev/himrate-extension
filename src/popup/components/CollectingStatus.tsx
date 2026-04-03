// TASK-077 FR-014: CollectingStatus — spinner + text.
// Used: Cold Start (with spinner), Offline Empty (hint variant, no spinner).

interface Props {
  showSpinner?: boolean;
  message: string;
}

export function CollectingStatus({ showSpinner = true, message }: Props) {
  return (
    <div className="collecting-status">
      {showSpinner && <span className="spinner dark" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />}
      <span>{message}</span>
    </div>
  );
}

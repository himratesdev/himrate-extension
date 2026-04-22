// TASK-039 Phase D1: Trends shimmer skeleton. Used when any Trends module loading.

interface Props {
  /** Number of module placeholders. Default 3. */
  moduleCount?: number;
}

export function LoadingSkeleton({ moduleCount = 3 }: Props) {
  return (
    <div className="trends-skeleton">
      {Array.from({ length: moduleCount }, (_, i) => (
        <div key={i} className="trends-skeleton-module">
          <div className="trends-skeleton-title shimmer" />
          <div className="trends-skeleton-chart shimmer" />
          <div className="trends-skeleton-footer shimmer" />
        </div>
      ))}
    </div>
  );
}

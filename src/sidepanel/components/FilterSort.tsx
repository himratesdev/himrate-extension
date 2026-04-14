// TASK-036: FilterSort — Filter/Sort buttons for watchlist (FR-010/FR-014).
// Free tier: locked (opacity 0.5, lock icon, cursor not-allowed).
// Premium/Business: Sort dropdown with 6 options.

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type SortOption = 'erv_desc' | 'erv_asc' | 'ti_desc' | 'ccv_desc' | 'name_asc' | 'added_desc';

interface Props {
  tier: string;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: SortOption[] = ['erv_desc', 'erv_asc', 'ti_desc', 'ccv_desc', 'name_asc', 'added_desc'];

const SORT_I18N: Record<SortOption, string> = {
  erv_desc: 'wl.sort_erv_desc',
  erv_asc: 'wl.sort_erv_asc',
  ti_desc: 'wl.sort_ti_desc',
  ccv_desc: 'wl.sort_ccv_desc',
  name_asc: 'wl.sort_name',
  added_desc: 'wl.sort_added',
};

export function FilterSort({ tier, currentSort, onSortChange }: Props) {
  const { t } = useTranslation();
  const [sortOpen, setSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLocked = tier === 'free' || tier === 'guest';

  // Close dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
      {/* Filters button (locked for now — filters are complex, sort covers FR-010) */}
      <button
        disabled={isLocked}
        style={{
          padding: '5px 10px', fontSize: '10px', fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          border: '2px solid #0a0a0a', borderRadius: '6px',
          background: 'white', color: '#374151',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          opacity: isLocked ? 0.5 : 1,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        {isLocked && <span style={{ fontSize: '10px' }}>🔒</span>}
        {t('wl.filters_label')}
        {isLocked && (
          <span style={{ fontSize: '8px', color: '#6366f1', fontWeight: 700, marginLeft: '2px' }}>
            {t('wl.filters_locked')}
          </span>
        )}
      </button>

      {/* Sort button + dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { if (!isLocked) setSortOpen(prev => !prev); }}
          disabled={isLocked}
          style={{
            padding: '5px 10px', fontSize: '10px', fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            border: `2px solid ${sortOpen ? '#6366f1' : '#0a0a0a'}`, borderRadius: '6px',
            background: sortOpen ? 'rgba(99,102,241,0.05)' : 'white', color: '#374151',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            opacity: isLocked ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          {isLocked && <span style={{ fontSize: '10px' }}>🔒</span>}
          {t('wl.sort_label')}: {t(SORT_I18N[currentSort])}
        </button>

        {sortOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 50,
            background: 'white', border: '2.5px solid #0a0a0a', borderRadius: '8px',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.1)', minWidth: '140px', overflow: 'hidden',
          }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => { onSortChange(opt); setSortOpen(false); }}
                style={{
                  display: 'block', width: '100%', padding: '7px 12px',
                  fontSize: '10px', fontWeight: opt === currentSort ? 700 : 500,
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: opt === currentSort ? 'rgba(99,102,241,0.08)' : 'transparent',
                  color: opt === currentSort ? '#6366f1' : '#374151',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                {t(SORT_I18N[opt])}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { portalFieldClassName } from '@/components/portal';
import {
  formatWeekEndingFridayLabel,
  formatWorkingWeekLabel,
  getCurrentWorkingWeek,
  getNextWorkingWeek,
  getPreviousWorkingWeek,
  listWeekEndingFridays,
} from '@/lib/working-week';
import { cn } from '@/lib/utils';

export type WorkingWeekSelection = {
  weekStart: string;
  weekEnd: string;
};

type WeekPreset = 'last' | 'current' | 'next' | 'custom';

interface WeekEndingFilterProps {
  value: WorkingWeekSelection;
  onChange: (week: WorkingWeekSelection) => void;
}

function detectPreset(value: WorkingWeekSelection): WeekPreset {
  const last = getPreviousWorkingWeek();
  const current = getCurrentWorkingWeek();
  const next = getNextWorkingWeek();
  if (value.weekStart === last.weekStart && value.weekEnd === last.weekEnd) return 'last';
  if (value.weekStart === current.weekStart && value.weekEnd === current.weekEnd) return 'current';
  if (value.weekStart === next.weekStart && value.weekEnd === next.weekEnd) return 'next';
  return 'custom';
}

const presetOptions: { id: WeekPreset; label: string }[] = [
  { id: 'last', label: 'Last Week' },
  { id: 'current', label: 'This Week' },
  { id: 'next', label: 'Next Week' },
];

function applyPreset(preset: WeekPreset): WorkingWeekSelection {
  if (preset === 'last') {
    const w = getPreviousWorkingWeek();
    return { weekStart: w.weekStart, weekEnd: w.weekEnd };
  }
  if (preset === 'next') {
    const w = getNextWorkingWeek();
    return { weekStart: w.weekStart, weekEnd: w.weekEnd };
  }
  const w = getCurrentWorkingWeek();
  return { weekStart: w.weekStart, weekEnd: w.weekEnd };
}

export function WeekEndingFilter({ value, onChange }: WeekEndingFilterProps) {
  const weekOptions = useMemo(() => listWeekEndingFridays(), []);
  const [preset, setPreset] = useState<WeekPreset>(() => detectPreset(value));

  useEffect(() => {
    setPreset(detectPreset(value));
  }, [value.weekStart, value.weekEnd]);

  const applyWeek = (week: WorkingWeekSelection, nextPreset: WeekPreset) => {
    setPreset(nextPreset);
    onChange(week);
  };

  const handlePreset = (nextPreset: WeekPreset) => {
    applyWeek(applyPreset(nextPreset), nextPreset);
  };

  const handleDropdown = (weekEnd: string) => {
    const option = weekOptions.find((o) => o.weekEnd === weekEnd);
    if (!option) return;
    applyWeek({ weekStart: option.weekStart, weekEnd: option.weekEnd }, detectPreset({
      weekStart: option.weekStart,
      weekEnd: option.weekEnd,
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2">
          {presetOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handlePreset(option.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                preset === option.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="min-w-[11rem] flex-1 sm:max-w-xs">
          <label htmlFor="week-ending-friday" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Week ending (Friday)
          </label>
          <Select
            id="week-ending-friday"
            value={value.weekEnd}
            onChange={(e) => handleDropdown(e.target.value)}
            className={portalFieldClassName}
          >
            {weekOptions.map((option) => (
              <option key={option.weekEnd} value={option.weekEnd}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        Week ending{' '}
        <span className="font-medium text-slate-800">{formatWeekEndingFridayLabel(value.weekEnd)}</span>
        {' · '}
        {formatWorkingWeekLabel(value.weekStart, value.weekEnd)}
      </p>
    </div>
  );
}

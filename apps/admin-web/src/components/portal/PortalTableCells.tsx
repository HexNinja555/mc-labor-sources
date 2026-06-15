interface DateTimeCellProps {
  value?: string | null;
}

export function DateTimeCell({ value }: DateTimeCellProps) {
  if (!value) {
    return <span className="text-gray-400">—</span>;
  }

  const date = new Date(value);

  return (
    <div className="leading-tight">
      <div className="font-medium text-slate-800">{date.toLocaleDateString()}</div>
      <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
    </div>
  );
}

interface PersonCellProps {
  name: string;
}

export function PersonCell({ name }: PersonCellProps) {
  if (name === '—') {
    return <span className="text-gray-400">—</span>;
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {initial}
      </span>
      <span className="font-medium text-slate-800">{name}</span>
    </div>
  );
}

interface YesNoCellProps {
  value: boolean;
}

export function YesNoCell({ value }: YesNoCellProps) {
  return (
    <span
      className={
        value
          ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'
      }
    >
      {value ? 'Yes' : 'No'}
    </span>
  );
}

interface HoursCellProps {
  value?: string | number | null;
}

export function HoursCell({ value }: HoursCellProps) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
      {value}h
    </span>
  );
}

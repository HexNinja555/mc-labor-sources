export function formatEmployeeName(
  employee?: { firstName?: string; lastName?: string } | null,
) {
  if (!employee?.firstName && !employee?.lastName) return '—';
  return [employee.firstName, employee.lastName].filter(Boolean).join(' ');
}

export function getAttendanceStats(
  logs: { status: string; totalHours?: string | number | null; clockOutTime?: string | null }[],
) {
  const clockedIn = logs.filter((log) => log.status === 'CLOCKED_IN').length;
  const clockedOut = logs.filter((log) => log.status === 'CLOCKED_OUT').length;
  const totalHours = logs.reduce((sum, log) => {
    const hours = Number(log.totalHours);
    return sum + (Number.isFinite(hours) ? hours : 0);
  }, 0);

  return {
    total: logs.length,
    clockedIn,
    clockedOut,
    totalHours: totalHours > 0 ? totalHours.toFixed(1) : '0',
  };
}

export function getTimesheetStats(
  timesheets: { status: string; totalHours?: string | number | null }[],
) {
  const signed = timesheets.filter((ts) => ts.status === 'SIGNED').length;
  const submitted = timesheets.filter((ts) => ts.status === 'SUBMITTED').length;
  const totalHours = timesheets.reduce((sum, ts) => {
    const hours = Number(ts.totalHours);
    return sum + (Number.isFinite(hours) ? hours : 0);
  }, 0);

  return {
    total: timesheets.length,
    signed,
    submitted,
    totalHours: totalHours > 0 ? totalHours.toFixed(1) : '0',
  };
}

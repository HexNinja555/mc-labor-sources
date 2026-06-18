'use client';

import type { Timesheet } from '@/lib/domain-types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { formatEmployeeName } from '@/lib/portal-stats';

interface TimesheetDetailModalProps {
  open: boolean;
  onClose: () => void;
  timesheet: Timesheet | null;
  onSign?: () => void;
  showSignAction?: boolean;
}

export function TimesheetDetailModal({
  open,
  onClose,
  timesheet,
  onSign,
  showSignAction = false,
}: TimesheetDetailModalProps) {
  if (!timesheet) return null;

  const periodLabel =
    timesheet.weekStartDate && timesheet.weekEndDate
      ? `${timesheet.weekStartDate} – ${timesheet.weekEndDate}`
      : timesheet.workDate ?? '—';

  const canSign =
    showSignAction &&
    onSign &&
    timesheet.status !== 'SIGNED' &&
    timesheet.status !== 'SENT' &&
    !timesheet.signature?.signatureImageUrl;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Timesheet Detail"
      subtitle={`${formatEmployeeName(timesheet.employee)} · ${timesheet.jobSite?.name ?? 'Job site'}`}
      icon="eye"
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold">{timesheet.totalHours}h</span>
          {' · '}
          <Badge status={timesheet.status} className="rounded-full normal-case" />
          {' · '}
          <span className="text-slate-500">{periodLabel}</span>
        </div>

        {timesheet.entries && timesheet.entries.length > 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Time entries
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Start</th>
                  <th className="pb-2">End</th>
                  <th className="pb-2">Hours</th>
                </tr>
              </thead>
              <tbody>
                {timesheet.entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-50">
                    <td className="py-2">{entry.workDate}</td>
                    <td className="py-2">{entry.startTime}</td>
                    <td className="py-2">{entry.endTime}</td>
                    <td className="py-2 font-medium">{entry.hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {timesheet.signature ? (
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Foreman signature
            </p>
            <p className="text-sm text-slate-700">
              {timesheet.signature.foremanName}
              {timesheet.signature.foremanEmail ? ` · ${timesheet.signature.foremanEmail}` : ''}
            </p>
            {timesheet.signature.signatureImageUrl ? (
              <img
                src={timesheet.signature.signatureImageUrl}
                alt="Signature"
                className="mt-3 max-h-36 rounded-lg border border-slate-100"
              />
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>
                Sent to customer office:{' '}
                {timesheet.signature.sentToCustomerOffice ? 'Yes' : 'No'}
              </span>
              <span>
                Sent to MC Labor office:{' '}
                {timesheet.signature.sentToMcLaborOffice ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        ) : null}

        {timesheet.notes ? (
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">Notes</p>
            {timesheet.notes}
          </div>
        ) : null}
      </div>

      {canSign ? (
        <ModalFooter>
          <Button variant="secondary" icon="cancel" onClick={onClose}>
            Close
          </Button>
          <Button icon="signature" onClick={onSign}>
            Sign Timesheet
          </Button>
        </ModalFooter>
      ) : null}
    </Modal>
  );
}

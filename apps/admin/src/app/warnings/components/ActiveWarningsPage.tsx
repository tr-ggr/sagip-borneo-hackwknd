'use client';

import {
  useAdminOperationsControllerCancelWarning,
  useAdminOperationsControllerDeleteWarning,
  useAdminOperationsControllerListWarnings,
} from '@wira-borneo/api-client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast';
import { useI18n } from '../../../i18n/context';

type WarningStatus = 'DRAFT' | 'SENT' | 'CANCELLED';
type HazardType = 'FLOOD' | 'TYPHOON' | 'EARTHQUAKE' | 'AFTERSHOCK';
type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
type WarningStatusFilter = 'ALL' | WarningStatus;

interface WarningTargetArea {
  id: string;
  areaName: string;
}

interface WarningItem {
  id: string;
  title: string;
  message: string;
  hazardType: HazardType;
  severity: SeverityLevel;
  status: WarningStatus;
  startsAt: string;
  endsAt?: string | null;
  createdAt: string;
  targetAreas: WarningTargetArea[];
}

const warningFilters: WarningStatusFilter[] = ['ALL', 'SENT', 'DRAFT', 'CANCELLED'];

function toWarnings(raw: unknown): WarningItem[] {
  const payload = (raw as { data?: unknown })?.data ?? raw;
  return Array.isArray(payload) ? (payload as WarningItem[]) : [];
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

export function ActiveWarningsPage() {
  const [status, setStatus] = useState<WarningStatusFilter>('SENT');
  const { t } = useI18n();

  const warningsQuery = useAdminOperationsControllerListWarnings(
    { status: status === 'ALL' ? undefined : status },
    {
      query: {
        select: (response: unknown) => toWarnings(response),
      },
    },
  );
  const cancelMutation = useAdminOperationsControllerCancelWarning();
  const deleteMutation = useAdminOperationsControllerDeleteWarning();
  const { showToast } = useToast();

  useEffect(() => {
    if (warningsQuery.error) {
      showToast(toErrorMessage(warningsQuery.error, t('admin.warnings.failedToLoad')), 'error');
    }
  }, [warningsQuery.error, showToast, t]);

  const reload = useCallback(() => {
    void warningsQuery.refetch();
  }, [warningsQuery]);

  const onCancelWarning = useCallback(
    (warningId: string) => {
      cancelMutation.mutate(
        { id: warningId },
        {
          onSuccess: () => {
            showToast(t('admin.warnings.cancelledSuccess'), 'success');
            reload();
          },
          onError: (error) => {
            showToast(toErrorMessage(error, t('admin.warnings.failedToCancel')), 'error');
          },
        },
      );
    },
    [cancelMutation, reload, showToast],
  );

  const onDeleteWarning = useCallback(
    async (warningId: string) => {
      const proceed = window.confirm(t('admin.warnings.deleteConfirm'));
      if (!proceed) {
        return;
      }

      deleteMutation.mutate(
        { id: warningId },
        {
          onSuccess: () => {
            showToast(t('admin.warnings.deletedSuccess'), 'success');
            reload();
          },
          onError: (error) => {
            showToast(toErrorMessage(error, t('admin.warnings.failedToDelete')), 'error');
          },
        },
      );
    },
    [deleteMutation, reload, showToast, t],
  );

  const warnings = warningsQuery.data ?? [];
  const sortedWarnings = useMemo(
    () => [...warnings].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [warnings],
  );

  return (
    <section className="page-shell">
      <div className="volunteer-registry-section">
        <header className="volunteer-registry-header">
          <div>
            <h1 className="volunteer-registry-title">{t('admin.warnings.activeWarnings')}</h1>
            <p className="volunteer-registry-subtitle">
              {t('admin.warnings.subtitle')}
            </p>
          </div>
        </header>

        <div
          className="card filter-row"
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            margin: '16px 16px 0',
          }}
        >
          {warningFilters.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip ${status === item ? 'chip-active' : ''}`}
              onClick={() => setStatus(item)}
            >
              {item === 'ALL' ? t('admin.warnings.all') : item === 'SENT' ? t('admin.warnings.sent') : item === 'DRAFT' ? t('admin.warnings.draft') : t('admin.warnings.cancelled')}
            </button>
          ))}
        </div>

        <div className="volunteer-table-wrap" style={{ marginTop: '12px' }}>
          <table className="volunteer-table">
            <thead>
              <tr>
                <th>{t('admin.warnings.title')}</th>
                <th>{t('admin.warnings.hazard')}</th>
                <th>{t('admin.warnings.severity')}</th>
                <th>{t('admin.warnings.status')}</th>
                <th>{t('admin.warnings.targetAreas')}</th>
                <th>{t('admin.warnings.created')}</th>
                <th>{t('admin.warnings.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {warningsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="muted small" style={{ textAlign: 'center' }}>
                    {t('admin.warnings.loadingWarnings')}
                  </td>
                </tr>
              ) : sortedWarnings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted small" style={{ textAlign: 'center' }}>
                    {t('admin.warnings.noWarningsFound')}
                  </td>
                </tr>
              ) : (
                sortedWarnings.map((warning) => {
                  const isCancelling =
                    cancelMutation.isPending && cancelMutation.variables?.id === warning.id;
                  const isDeleting =
                    deleteMutation.isPending && deleteMutation.variables?.id === warning.id;

                  return (
                    <tr key={warning.id}>
                      <td>
                        <div className="volunteer-table-name">{warning.title}</div>
                        <div className="volunteer-table-id">{warning.message.slice(0, 64)}</div>
                      </td>
                      <td>
                        {warning.hazardType === 'FLOOD'
                          ? t('admin.warnings.flood')
                          : warning.hazardType === 'TYPHOON'
                            ? t('admin.warnings.typhoon')
                            : warning.hazardType === 'EARTHQUAKE'
                              ? t('admin.warnings.earthquake')
                              : t('admin.warnings.aftershock')}
                      </td>
                      <td>
                        <span className={`warning-severity-pill ${warning.severity.toLowerCase()}`}>
                          {warning.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`warning-status-pill ${warning.status.toLowerCase()}`}>
                          {warning.status}
                        </span>
                      </td>
                      <td className="volunteer-table-notes">
                        {warning.targetAreas.length > 0
                          ? warning.targetAreas.map((area) => area.areaName).join(', ')
                          : '-'}
                      </td>
                      <td>{new Date(warning.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="volunteer-table-actions">
                          <button
                            type="button"
                            className="volunteer-table-btn-deny"
                            onClick={() => onDeleteWarning(warning.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? t('admin.warnings.deleting') : t('admin.warnings.delete')}
                          </button>
                          <button
                            type="button"
                            className="volunteer-table-btn-approve"
                            onClick={() => onCancelWarning(warning.id)}
                            disabled={warning.status !== 'SENT' || isCancelling}
                          >
                            {isCancelling ? t('admin.warnings.cancelling') : t('admin.warnings.cancel')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="volunteer-registry-footer">
          {sortedWarnings.length === 1
            ? t('admin.warnings.warningCount').replace('{count}', '1')
            : t('admin.warnings.warningCountPlural').replace('{count}', String(sortedWarnings.length))}
        </footer>
      </div>
    </section>
  );
}

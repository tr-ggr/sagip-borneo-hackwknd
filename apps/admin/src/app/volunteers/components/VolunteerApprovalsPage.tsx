'use client';

import {
  useAdminOperationsControllerListVolunteerApplications,
  useAdminOperationsControllerReviewVolunteer,
  useAdminOperationsControllerBulkReviewVolunteers,
  useAdminOperationsControllerSuspendVolunteer,
  useAdminOperationsControllerReactivateVolunteer,
  useAdminOperationsControllerGetApplicationHistory,
} from '@wira-borneo/api-client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { ActionModal } from './ActionModal';
import { useI18n } from '../../../i18n/context';

interface VolunteerApplication {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

type VolunteerStatusFilter = 'ALL' | VolunteerApplication['status'];

const statusFilters: Array<VolunteerStatusFilter> = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
];

function toApplications(raw: unknown): VolunteerApplication[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw as VolunteerApplication[];
}

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase();
}

function exportApplicationsToCsv(applications: VolunteerApplication[]) {
  const headers = ['Name', 'Email', 'Status', 'Notes', 'Submitted'];
  const rows = applications.map((a) => [
    a.user?.name ?? 'Unknown',
    a.user?.email ?? '',
    a.status,
    a.notes ?? '',
    new Date(a.createdAt).toISOString(),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `volunteer-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function VolunteerApprovalsPage() {
  const [status, setStatus] = useState<VolunteerStatusFilter>('PENDING');
  const { t } = useI18n();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showHistoryId, setShowHistoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    application?: VolunteerApplication;
    actionType?: 'REJECT' | 'SUSPEND' | 'REACTIVATE';
  }>({
    isOpen: false,
  });

  const applicationsQuery = useAdminOperationsControllerListVolunteerApplications(
    {
      status: status === 'ALL' ? '' : status,
      sortBy: 'createdAt',
      sortOrder,
    },
    {
      query: {
        select: (response: unknown) => toApplications((response as { data?: unknown })?.data ?? response),
      },
    },
  );

  const reviewMutation = useAdminOperationsControllerReviewVolunteer();
  const bulkReviewMutation = useAdminOperationsControllerBulkReviewVolunteers();
  const suspendMutation = useAdminOperationsControllerSuspendVolunteer();
  const reactivateMutation = useAdminOperationsControllerReactivateVolunteer();
  const historyQuery = useAdminOperationsControllerGetApplicationHistory(
    showHistoryId || '',
    {
      query: {
        enabled: !!showHistoryId,
      },
    },
  );

  const applications = applicationsQuery.data ?? [];

  useEffect(() => {
    // Selection only makes sense for the visible pending set
    setSelectedIds([]);
    setRejectionReason('');
    setShowHistoryId(null);
  }, [status]);

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) => {
      const name = a.user?.name ?? '';
      const email = a.user?.email ?? '';
      const id = a.id ?? '';
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q) ||
        id.slice(-6).toLowerCase().includes(q)
      );
    });
  }, [applications, search]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (status !== 'PENDING') return;
    const pending = filteredApplications.filter((a) => a.status === 'PENDING');
    const allSelected = pending.every((a) => selectedIds.includes(a.id));
    setSelectedIds(allSelected ? [] : pending.map((a) => a.id));
  }, [status, filteredApplications, selectedIds]);

  const handleBulkReview = (nextStatus: 'APPROVED' | 'REJECTED') => {
    if (nextStatus === 'REJECTED' && !rejectionReason) {
      alert('Please provide a rejection reason.');
      return;
    }

    bulkReviewMutation.mutate(
      {
        data: {
          applicationIds: selectedIds,
          nextStatus,
          reason: rejectionReason,
        },
      },
      {
        onSuccess: () => {
          setSelectedIds([]);
          setRejectionReason('');
          applicationsQuery.refetch();
        },
      },
    );
  };

  const handleActionConfirm = (reason: string) => {
    const { application, actionType } = modalConfig;
    if (!application) return;

    if (actionType === 'REJECT') {
      reviewMutation.mutate(
        { id: application.id, data: { nextStatus: 'REJECTED', reason } },
        { onSuccess: () => applicationsQuery.refetch() },
      );
    } else if (actionType === 'SUSPEND' && application.user) {
      suspendMutation.mutate(
        { userId: application.user.id, data: { reason } },
        { onSuccess: () => applicationsQuery.refetch() },
      );
    } else if (actionType === 'REACTIVATE' && application.user) {
      reactivateMutation.mutate(
        { userId: application.user.id, data: { reason } },
        { onSuccess: () => applicationsQuery.refetch() },
      );
    }

    setModalConfig({ isOpen: false });
  };

  const handleExportCsv = () => {
    exportApplicationsToCsv(filteredApplications);
  };

  const statusLabel = status === 'ALL' ? t('admin.volunteers.all') : status.charAt(0) + status.slice(1).toLowerCase();
  const footerText = applicationsQuery.isLoading
    ? t('admin.common.loading')
    : status === 'ALL'
      ? (filteredApplications.length === 1 ? t('admin.volunteers.showingApplicants').replace('{count}', '1') : t('admin.volunteers.showingApplicantsPlural').replace('{count}', String(filteredApplications.length)))
      : t('admin.volunteers.showingOf')
          .replace('{count}', String(filteredApplications.length))
          .replace('{total}', String(filteredApplications.length))
          .replace('{status}', statusLabel);

  return (
    <section className="page-shell">
      <div className="volunteer-registry-section">
        <header className="volunteer-registry-header">
          <div>
            <h1 className="volunteer-registry-title">{t('admin.volunteers.registryTitle')}</h1>
            <p className="volunteer-registry-subtitle">
              {t('admin.volunteers.registrySubtitle')}
            </p>
          </div>
          <button
            type="button"
            className="volunteer-registry-export-btn"
            onClick={handleExportCsv}
            disabled={applications.length === 0}
          >
            {t('admin.volunteers.exportCsv')}
          </button>
        </header>

        <div style={{ padding: '16px 16px 0' }}>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}
          >
            <input
              type="search"
              className="input"
              placeholder={t('admin.volunteers.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', flex: 1 }}
            />
            <button type="submit" className="btn btn-neutral">
              {t('admin.volunteers.search')}
            </button>
          </form>
        </div>

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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {statusFilters.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${status === item ? 'chip-active' : ''}`}
                onClick={() => setStatus(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <select
              className="input small"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">{t('admin.volunteers.newest')}</option>
              <option value="asc">{t('admin.volunteers.oldest')}</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div
            className="card toolbar"
            style={{
              background: 'rgba(13, 79, 92, 0.08)',
              border: '1px solid var(--wira-teal)',
              margin: '12px 16px 0',
            }}
          >
            <p className="mono small">{t('admin.volunteers.applicationsSelected').replace('{count}', String(selectedIds.length))}</p>
            <div className="action-row" style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder={t('admin.volunteers.reasonPlaceholder')}
                className="input"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <button
                className="btn btn-safe"
                onClick={() => handleBulkReview('APPROVED')}
                disabled={bulkReviewMutation.isPending}
              >
                {t('admin.volunteers.bulkApprove')}
              </button>
              <button
                className="btn btn-critical"
                onClick={() => handleBulkReview('REJECTED')}
                disabled={bulkReviewMutation.isPending}
              >
                {t('admin.volunteers.bulkReject')}
              </button>
            </div>
          </div>
        )}

        {applicationsQuery.isLoading && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p className="muted">{t('admin.volunteers.loadingApplications')}</p>
          </div>
        )}
        {applicationsQuery.isError && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p className="error-text">{t('admin.volunteers.unableToLoad')}</p>
          </div>
        )}

        {!applicationsQuery.isLoading && !applicationsQuery.isError && (
          <>
            <div className="volunteer-table-wrap">
            <table className="volunteer-table">
              <thead>
                <tr>
                  {status === 'PENDING' && (
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={filteredApplications.length > 0 && filteredApplications.every((a) => selectedIds.includes(a.id))}
                        onChange={handleSelectAll}
                        aria-label={t('admin.volunteers.selectAll')}
                      />
                    </th>
                  )}
                  <th>{t('admin.volunteers.name')}</th>
                  <th>{t('admin.volunteers.notes')}</th>
                  <th>{t('admin.volunteers.status')}</th>
                  <th>{t('admin.volunteers.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => {
                  const isPending = application.status === 'PENDING';
                  const isApproved = application.status === 'APPROVED';
                  const isSuspended = application.status === 'SUSPENDED';
                  const name = application.user?.name ?? t('admin.volunteers.unknownApplicant');

                  return (
                    <tr key={application.id}>
                      {status === 'PENDING' && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(application.id)}
                            onChange={() => handleSelect(application.id)}
                            aria-label={t('admin.volunteers.selectName').replace('{name}', name)}
                          />
                        </td>
                      )}
                      <td>
                        <div className="volunteer-table-name-cell">
                          <div className="volunteer-table-avatar" aria-hidden>
                            {getInitials(name)}
                          </div>
                          <div>
                            <div className="volunteer-table-name">{name}</div>
                            <div className="volunteer-table-id">ID: #{application.id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="volunteer-table-notes" title={application.notes ?? undefined}>
                          {application.notes || '—'}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`volunteer-table-status-pill ${application.status.toLowerCase()}`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td>
                        <div className="volunteer-table-actions">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                className="volunteer-table-btn-approve"
                                disabled={reviewMutation.isPending}
                                onClick={() => {
                                  reviewMutation.mutate(
                                    { id: application.id, data: { nextStatus: 'APPROVED' } },
                                    { onSuccess: () => applicationsQuery.refetch() },
                                  );
                                }}
                              >
                                {t('admin.volunteers.approve')}
                              </button>
                              <button
                                type="button"
                                className="volunteer-table-btn-deny"
                                disabled={reviewMutation.isPending}
                                onClick={() => {
                                  setModalConfig({
                                    isOpen: true,
                                    application,
                                    actionType: 'REJECT',
                                  });
                                }}
                              >
                                {t('admin.volunteers.deny')}
                              </button>
                            </>
                          )}
                          {isApproved && application.user && (
                            <button
                              type="button"
                              className="btn btn-critical"
                              style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
                              disabled={suspendMutation.isPending}
                              onClick={() => {
                                setModalConfig({
                                  isOpen: true,
                                  application,
                                  actionType: 'SUSPEND',
                                });
                              }}
                            >
                              {t('admin.volunteers.suspend')}
                            </button>
                          )}
                          {isSuspended && application.user && (
                            <button
                              type="button"
                              className="volunteer-table-btn-approve"
                              disabled={reactivateMutation.isPending}
                              onClick={() => {
                                setModalConfig({
                                  isOpen: true,
                                  application,
                                  actionType: 'REACTIVATE',
                                });
                              }}
                            >
                              {t('admin.volunteers.reactivate')}
                            </button>
                          )}
                          <button
                            type="button"
                            className="volunteer-table-btn-deny"
                            onClick={() =>
                              setShowHistoryId(showHistoryId === application.id ? null : application.id)
                            }
                          >
                            {showHistoryId === application.id ? t('admin.volunteers.hideHistory') : t('admin.volunteers.history')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            {showHistoryId && (() => {
              const app = filteredApplications.find((a) => a.id === showHistoryId);
              return (
              <div
                className="history-view small"
                style={{
                  margin: '0 24px 16px',
                  background: 'var(--bg-subtle, #f8fafc)',
                  padding: '1rem',
                  borderRadius: '8px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <h3 className="mono small bold">{t('admin.volunteers.decisionLog').replace('{name}', app?.user?.name ?? 'Application')}</h3>
                {historyQuery.isLoading && <p className="muted">{t('admin.volunteers.loadingHistory')}</p>}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
                  {(() => {
                    const raw = historyQuery.data as unknown;
                    const list = (raw && typeof raw === 'object' && 'data' in raw ? (raw as { data: unknown }).data : raw) ?? [];
                    return Array.isArray(list) ? list : [];
                  })().map(
                    (log: { id: string; previousStatus?: string; nextStatus: string; actor?: { name?: string }; createdAt: string; reason?: string }) => (
                      <li
                        key={log.id}
                        style={{
                          marginBottom: '0.5rem',
                          paddingBottom: '0.5rem',
                          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
                        }}
                      >
                        <p className="mono">
                          {log.previousStatus ?? '—'} → <strong>{log.nextStatus}</strong>
                        </p>
                        <p className="muted small">
                          By: {log.actor?.name ?? 'System'} on {new Date(log.createdAt).toLocaleString()}
                        </p>
                        {log.reason && <p className="italic">"{log.reason}"</p>}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              );
            })()}

            <footer className="volunteer-registry-footer">{footerText}</footer>
          </>
        )}
      </div>

      <ActionModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false })}
        onConfirm={handleActionConfirm}
        title={
          modalConfig.actionType === 'REJECT'
            ? t('admin.volunteers.rejectApplication')
            : modalConfig.actionType === 'SUSPEND'
              ? t('admin.volunteers.suspendVolunteer')
              : t('admin.volunteers.reactivateVolunteer')
        }
        description={
          modalConfig.actionType === 'REJECT'
            ? t('admin.volunteers.rejectModalDesc').replace('{name}', modalConfig.application?.user?.name ?? '')
            : modalConfig.actionType === 'SUSPEND'
              ? t('admin.volunteers.suspendModalDesc').replace('{name}', modalConfig.application?.user?.name ?? '')
              : t('admin.volunteers.reactivateModalDesc').replace('{name}', modalConfig.application?.user?.name ?? '')
        }
        confirmText={
          modalConfig.actionType === 'REJECT'
            ? t('admin.volunteers.rejectConfirm')
            : modalConfig.actionType === 'SUSPEND'
              ? t('admin.volunteers.suspendConfirm')
              : t('admin.volunteers.reactivateConfirm')
        }
        type={modalConfig.actionType === 'REACTIVATE' ? 'SAFE' : 'CRITICAL'}
        placeholder={t('admin.volunteers.provideReason')}
        required
      />
    </section>
  );
}

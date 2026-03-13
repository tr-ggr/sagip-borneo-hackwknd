'use client';

import {
  useAdminOperationsControllerCreateWarning,
  useAdminOperationsControllerGetPromptSuggestion,
} from '@wira-borneo/api-client';
import { useEffect, useMemo, useState } from 'react';
import {
  canProceedToConfirmation,
  warningFlowReducer,
  warningSummary,
} from './warning-flow.utils';
import WarningMapSupport, { type WarningCoordinatePoint } from './WarningMapSupport';
import {
  getLastWarningLocation,
  isLocationEmpty,
  saveLastWarningLocation,
} from './location-prediction.utils';
import { useToast } from '../../../components/Toast';
import { useI18n } from '../../../../i18n/context';

type HazardType = 'FLOOD' | 'TYPHOON' | 'EARTHQUAKE' | 'AFTERSHOCK';
type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
type DrawMode = 'pin' | 'box' | 'polygon';

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

function coordinateLabel(
  drawMode: DrawMode,
  index: number,
  total: number,
  t: (key: string) => string
): string {
  if (drawMode === 'box' && total === 4) {
    const keys = ['admin.warnings.point1', 'admin.warnings.point2', 'admin.warnings.point3', 'admin.warnings.point4'] as const;
    return t(keys[index] ?? 'admin.warnings.point1');
  }
  return t('admin.warnings.pinN').replace('{n}', String(index + 1));
}

const defaultTarget = {
  areaName: '',
  latitude: '',
  longitude: '',
  radiusKm: '5',
  polygonGeoJson: '',
};

export function ManualWarningPage() {
  const [step, setStep] = useState<'compose' | 'confirm'>('compose');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [hazardType, setHazardType] = useState<HazardType>('FLOOD');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState('');
  const [target, setTarget] = useState(defaultTarget);
  const [drawMode, setDrawMode] = useState<DrawMode>('pin');
  const [targetCoordinates, setTargetCoordinates] = useState<WarningCoordinatePoint[]>([]);

  const promptMutation = useAdminOperationsControllerGetPromptSuggestion();
  const createWarningMutation = useAdminOperationsControllerCreateWarning();
  const { showToast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    const saved = getLastWarningLocation();
    if (!saved) {
      return;
    }

    setTarget((current) => (isLocationEmpty(current) ? saved : current));
  }, []);

  const payload = useMemo(
    () => ({
      title,
      message,
      hazardType,
      severity,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      suggestedPrompt: (() => {
        const d = promptMutation.data as unknown as { prompt?: string } | undefined;
        return d?.prompt ? String(d.prompt) : undefined;
      })(),
      targets: [
        {
          areaName: target.areaName,
          latitude: target.latitude ? Number(target.latitude) : undefined,
          longitude: target.longitude ? Number(target.longitude) : undefined,
          // Only include radiusKm for pin mode; for box/polygon, use polygonGeoJson
          radiusKm: drawMode === 'pin' && target.radiusKm ? Number(target.radiusKm) : undefined,
          polygonGeoJson: target.polygonGeoJson || undefined,
        },
      ],
      evacuationAreaIds: [] as string[],
    }),
    [
      title,
      message,
      hazardType,
      severity,
      startsAt,
      endsAt,
      promptMutation.data,
      target.areaName,
      target.latitude,
      target.longitude,
      target.radiusKm,
      target.polygonGeoJson,
      drawMode,
    ],
  );

  const summary = warningSummary({
    title: payload.title,
    message: payload.message,
    areaName: payload.targets[0].areaName,
    radiusKm: drawMode === 'pin' ? payload.targets[0].radiusKm : undefined,
    drawMode: drawMode,
    hasPolygon: Boolean(payload.targets[0].polygonGeoJson),
    evacuationCount: payload.evacuationAreaIds.length,
  });

  const coordinateCountLabel =
    drawMode === 'box'
      ? t('admin.warnings.fourCorners')
      : `${targetCoordinates.length} ${targetCoordinates.length === 1 ? t('admin.warnings.pin') : t('admin.warnings.pins')}`;

  return (
    <section className="page-shell warning-page">
      {step === 'compose' ? (
        <div className="warning-modal-shell">
          <div className="warning-modal-header">
            <div className="warning-modal-header-left">
              <div className="warning-modal-ribbon" aria-hidden="true">
                <span className="ribbon-block ribbon-blue" />
                <span className="ribbon-block ribbon-gold" />
                <span className="ribbon-block ribbon-red" />
              </div>
              <div>
                <h2 className="warning-modal-title">
                  {t('admin.warnings.alertDispatchWorkflow')}
                </h2>
                <p className="warning-modal-step small mono">
                  {t('admin.warnings.step12Config')}
                </p>
              </div>
            </div>
          </div>

          <div className="warning-modal-body">
            <article className="warning-column card">
              <header className="warning-section-header">
                <div className="step-pill step-pill-primary">1</div>
                <div>
                  <h3 className="card-title">{t('admin.warnings.composeMessage')}</h3>
                  <p className="small muted">
                    {t('admin.warnings.composeDesc')}
                  </p>
                </div>
              </header>

              <div className="warning-field-group">
                <label className="field-label">
                  {t('admin.warnings.hazardType')}
                  <div className="hazard-toggle-row">
                    {(['FLOOD', 'TYPHOON', 'EARTHQUAKE', 'AFTERSHOCK'] as HazardType[]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          className={`hazard-chip ${
                            hazardType === type ? 'hazard-chip-active' : ''
                          }`}
                          onClick={() => setHazardType(type)}
                        >
                          {type === 'FLOOD'
                            ? t('admin.warnings.flood')
                            : type === 'TYPHOON'
                              ? t('admin.warnings.typhoon')
                              : type === 'EARTHQUAKE'
                                ? t('admin.warnings.earthquake')
                                : t('admin.warnings.aftershock')}
                        </button>
                      ),
                    )}
                  </div>
                </label>

                <label className="field-label">
                  {t('admin.warnings.alertTitle')}
                  <input
                    className="field"
                    placeholder={t('admin.warnings.alertTitlePlaceholder')}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>

                <div className="warning-message-header">
                  <div>
                    <p className="field-label-heading">
                      {t('admin.warnings.messageContent')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="suggest-prompt-chip"
                    onClick={() => {
                      promptMutation.mutate(
                        {
                          data: {
                            hazardType,
                            areaOrRegion: target.areaName || 'selected area',
                            radiusKm: Number(target.radiusKm),
                          },
                        },
                        {
                          onSuccess: (response: unknown) => {
                            const d = response as { prompt?: string } | undefined;
                            const prompt = String(d?.prompt ?? '');
                            if (prompt) {
                              setMessage(prompt);
                            }
                          },
                        },
                      );
                    }}
                    disabled={promptMutation.isPending}
                  >
                    {promptMutation.isPending ? t('admin.warnings.generatingPrompt') : t('admin.warnings.suggestPrompt')}
                  </button>
                </div>
                <textarea
                  className="field warning-message-input"
                  rows={6}
                  placeholder={t('admin.warnings.messagePlaceholder')}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <p className="small muted character-helper">
                  {t('admin.warnings.charactersSms').replace('{count}', String(message.length))}
                </p>

                <div className="warning-severity-group">
                  <p className="field-label-heading">{t('admin.warnings.severityLevel')}</p>
                  <div className="severity-row">
                    {([
                      { value: 'LOW', key: 'admin.warnings.advisory' as const },
                      { value: 'MODERATE', key: 'admin.warnings.warning' as const },
                      { value: 'HIGH', key: 'admin.warnings.emergencyDanger' as const },
                      { value: 'CRITICAL', key: 'admin.warnings.critical' as const },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`severity-chip ${
                          severity === option.value ? 'severity-chip-active' : ''
                        }`}
                        onClick={() => setSeverity(option.value as SeverityLevel)}
                      >
                        {t(option.key)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row-2">
                  <label className="field-label">
                    {t('admin.warnings.startMyt')}
                    <input
                      type="datetime-local"
                      className="field"
                      value={startsAt}
                      onChange={(event) => setStartsAt(event.target.value)}
                    />
                  </label>
                  <label className="field-label">
                    {t('admin.warnings.endOptional')}
                    <input
                      type="datetime-local"
                      className="field"
                      value={endsAt}
                      onChange={(event) => setEndsAt(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </article>

            <aside className="warning-column card warning-target-column">
              <header className="warning-section-header">
                <div className="step-pill step-pill-secondary">2</div>
                <div>
                  <h3 className="card-title">{t('admin.warnings.targetArea')}</h3>
                  <p className="small muted">
                    {t('admin.warnings.targetAreaDesc')}
                  </p>
                </div>
              </header>

              <div className="warning-field-group">
                <label className="field-label small">
                  {t('admin.warnings.searchArea')}
                  <input
                    className="field"
                    placeholder={t('admin.warnings.searchAreaPlaceholder')}
                    value={target.areaName}
                    onChange={(event) =>
                      setTarget((prev) => ({ ...prev, areaName: event.target.value }))
                    }
                  />
                </label>

                <div className="row-3 warning-latlng-row">
                  {drawMode === 'pin' ? (
                    <>
                      <label className="field-label small">
                        {t('admin.warnings.latLong')}
                        <input
                          className="field"
                          placeholder={t('admin.warnings.latitude')}
                          value={target.latitude}
                          onChange={(event) =>
                            setTarget((prev) => ({ ...prev, latitude: event.target.value }))
                          }
                        />
                      </label>
                      <label className="field-label small">
                        &nbsp;
                        <input
                          className="field"
                          placeholder={t('admin.warnings.longitude')}
                          value={target.longitude}
                          onChange={(event) =>
                            setTarget((prev) => ({ ...prev, longitude: event.target.value }))
                          }
                        />
                      </label>
                      <label className="field-label small">
                        {t('admin.warnings.radiusKm')}
                        <div className="radius-row">
                          <input
                            type="number"
                            min={1}
                            className="field"
                            value={target.radiusKm}
                            onChange={(event) =>
                              setTarget((prev) => ({ ...prev, radiusKm: event.target.value }))
                            }
                          />
                          <span className="radius-unit small muted">km</span>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div className="warning-shape-info">
                      <p className="small">
                        <strong>
                          {drawMode === 'box' ? t('admin.warnings.boundingBoxCoordinates') : t('admin.warnings.polygonVertices')}
                        </strong>
                      </p>
                      <p className="small muted">
                        {targetCoordinates.length > 0
                          ? coordinateCountLabel
                          : drawMode === 'box'
                            ? t('admin.warnings.drawBox')
                            : t('admin.warnings.drawPolygon')}
                      </p>
                      {targetCoordinates.length > 0 ? (
                        <div className="coordinate-grid">
                          {targetCoordinates.map((point, index) => (
                            <div key={`${point.latitude}-${point.longitude}-${index}`} className="coordinate-card">
                              <p className="small muted mono coordinate-card-label">
                                {coordinateLabel(drawMode, index, targetCoordinates.length, t)}
                              </p>
                              <p className="small">Lat: {formatCoordinate(point.latitude)}</p>
                              <p className="small">Long: {formatCoordinate(point.longitude)}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="warning-map-shell">
                  <div className="warning-map-header">
                    <p className="small muted mono">{t('admin.warnings.hpixVectorTiles')}</p>
                  </div>
                  <div className="warning-map-body">
                    <WarningMapSupport
                      drawMode={drawMode}
                      radiusKm={Number(target.radiusKm) || 5}
                      onDrawModeChange={(mode) => {
                        setDrawMode(mode);
                        if (mode !== drawMode) {
                          setTargetCoordinates([]);
                          setTarget((prev) => ({
                            ...prev,
                            latitude: '',
                            longitude: '',
                            polygonGeoJson: '',
                          }));
                        }
                      }}
                      onTargetChange={(data: {
                        latitude?: number | string;
                        longitude?: number | string;
                        radiusKm?: number | string;
                        polygonGeoJson?: string;
                        coordinates?: WarningCoordinatePoint[];
                      }) => {
                        if (
                          data.latitude == null &&
                          data.longitude == null &&
                          data.polygonGeoJson == null
                        ) {
                          setTargetCoordinates([]);
                          setTarget((prev) => ({
                            ...prev,
                            latitude: '',
                            longitude: '',
                            polygonGeoJson: '',
                          }));
                          return;
                        }

                        setTargetCoordinates(data.coordinates ?? []);
                        setTarget((prev) => ({
                          ...prev,
                          latitude:
                            data.latitude != null ? data.latitude.toString() : prev.latitude,
                          longitude:
                            data.longitude != null ? data.longitude.toString() : prev.longitude,
                          radiusKm: data.radiusKm?.toString() ?? prev.radiusKm,
                          polygonGeoJson: data.polygonGeoJson ?? '',
                        }));
                      }}
                    />
                    {target.polygonGeoJson && (
                      <p className="small success-text warning-map-success">
                        {t('admin.warnings.customShapeCaptured')}
                      </p>
                    )}
                  </div>
                  <div className="warning-map-footer">
                    <p className="small mono">
                      {t('admin.warnings.estimatedPopulationReach')}{' '}
                      <span className="warning-map-population">{t('admin.warnings.activeSubscribers')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="warning-modal-footer">
            <div className="footer-stage-indicator small mono">
              <span className="footer-stage-dot" aria-hidden="true" />
              {t('admin.warnings.stage1Prep')}
            </div>
            <div className="footer-actions">
              <button
                type="button"
                className="btn btn-neutral"
                onClick={() => {
                  setTitle('');
                  setMessage('');
                  setEndsAt('');
                  setTarget(defaultTarget);
                }}
              >
                {t('admin.warnings.cancelBatal')}
              </button>
              <button
                type="button"
                className="btn btn-critical footer-primary"
                disabled={
                  !canProceedToConfirmation({
                    title,
                    message,
                    areaName: target.areaName,
                  })
                }
                onClick={() =>
                  setStep((current) => warningFlowReducer(current, { type: 'CONTINUE' }))
                }
              >
                {t('admin.warnings.continueToVerification')}
              </button>
            </div>
          </footer>
        </div>
      ) : (
        <article className="card warning-confirm-card">
          <h2 className="card-title">{t('admin.warnings.confirmDispatch')}</h2>
          <p className="muted small">
            {t('admin.warnings.confirmDispatchDesc')}
          </p>
          <dl className="summary-grid warning-summary">
            <dt>{t('admin.warnings.summaryTitle')}</dt>
            <dd>{summary.heading}</dd>
            <dt>{t('admin.warnings.summaryMessage')}</dt>
            <dd>{summary.body}</dd>
            <dt>{t('admin.warnings.summaryTarget')}</dt>
            <dd>{summary.target}</dd>
            <dt>{t('admin.warnings.evacuationAreas')}</dt>
            <dd>{summary.evacuationCount}</dd>
          </dl>
          <div className="action-row warning-confirm-actions">
            <button
              type="button"
              className="btn btn-neutral"
              onClick={() => setStep((current) => warningFlowReducer(current, { type: 'CANCEL' }))}
            >
              {t('admin.warnings.backToEditing')}
            </button>
            <button
              type="button"
              className="btn btn-critical"
              onClick={() => {
                createWarningMutation.mutate(
                  { data: payload },
                  {
                    onSuccess: () => {
                      setStep((current) => warningFlowReducer(current, { type: 'SENT' }));
                      setTitle('');
                      setMessage('');
                      saveLastWarningLocation(target);
                      setTarget(defaultTarget);
                      showToast(t('admin.warnings.warningSentSuccess'), 'success');
                    },
                    onError: () => {
                      showToast(t('admin.warnings.failedToSend'), 'error');
                    },
                  },
                );
              }}
              disabled={createWarningMutation.isPending}
            >
              {t('admin.warnings.confirmAndSend')}
            </button>
          </div>
        </article>
      )}

      <style jsx>{`
        .warning-page {
          display: flex;
          flex-direction: column;
                    <WarningMapSupport
                      drawMode={drawMode as 'pin' | 'box' | 'polygon'}
                      radiusKm={Number(target.radiusKm) || 5}
                      onDrawModeChange={(mode) => {
                        setDrawMode(mode as DrawMode);
                        // Clear previous collected data when switching modes
                        if (mode !== drawMode) {
                          setTarget((prev) => ({
                            ...prev,
                            latitude: '',
                            longitude: '',
                            polygonGeoJson: '',
                          }));
                        }
                      }}
                      onTargetChange={(data: {
                        latitude?: number | string;
                        longitude?: number | string;
                        radiusKm?: number | string;
                        polygonGeoJson?: string;
                      }) => {
                        setTarget((prev) => ({
                          ...prev,
                          latitude: data.latitude?.toString() ?? prev.latitude,
                          longitude: data.longitude?.toString() ?? prev.longitude,
                          radiusKm: data.radiusKm?.toString() ?? prev.radiusKm,
                          polygonGeoJson: data.polygonGeoJson ?? '',
                        }));
                      }}
                    />
          color: #e5e7eb;
        }

        .warning-modal-header-left {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .warning-modal-ribbon {
          display: inline-flex;
          align-items: stretch;
          border-right: 1px solid #334155;
          padding-right: 16px;
        }

        .ribbon-block {
          width: 12px;
          height: 32px;
        }

        .ribbon-blue {
          background: #00368e;
        }

        .ribbon-gold {
          background: #facc15;
        }

        .ribbon-red {
          background: var(--status-critical);
        }

        .warning-modal-title {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.02em;
          color: #f9fafb;
        }

        .warning-modal-step {
          margin: 4px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
        }

        .warning-modal-body {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(0, 2.2fr);
          gap: 1.5rem;
          padding: 24px 24px 20px;
          background: #f8fafc;
        }

        .warning-column {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .warning-section-header {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .step-pill {
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .step-pill-primary {
          background: var(--status-critical);
          color: #ffffff;
        }

        .step-pill-secondary {
          background: #1e293b;
          color: #ffffff;
        }

        .warning-field-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hazard-toggle-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }

        .hazard-chip {
          border-radius: 6px;
          border: 2px solid #e2e8f0;
          background: #ffffff;
          padding: 8px 16px;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
        }

        .hazard-chip-active {
          background: #fef2f2;
          border-color: var(--status-critical);
          color: var(--status-critical);
        }

        .warning-message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }

        .field-label-heading {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .suggest-prompt-chip {
          border-radius: 9999px;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
          cursor: pointer;
          min-height: 0;
        }

        .warning-message-input {
          resize: vertical;
        }

        .character-helper {
          text-align: right;
        }

        .warning-severity-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .severity-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .severity-chip {
          border-radius: 9999px;
          border: 1px solid #cbd5e1;
          padding: 6px 14px;
          font-size: 12px;
          text-transform: uppercase;
          background: #ffffff;
          cursor: pointer;
        }

        .severity-chip-active {
          background: #1d4ed8;
          color: #ffffff;
          border-color: #1d4ed8;
        }

        .warning-target-column {
          background: #f8fafc;
        }

        .warning-latlng-row {
          align-items: flex-end;
        }

        .radius-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 4px;
          align-items: center;
        }

        .radius-unit {
          padding-right: 4px;
        }

        .warning-map-shell {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .warning-map-header {
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
          background: rgba(248, 250, 252, 0.9);
        }

        .warning-map-body {
          padding: 10px;
        }

        .warning-map-success {
          margin-top: 0.5rem;
        }

        .warning-shape-info {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .coordinate-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        .coordinate-card {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          padding: 0.75rem;
        }

        .coordinate-card-label {
          margin: 0 0 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .warning-map-footer {
          padding: 8px 10px 10px;
          border-top: 1px solid #e2e8f0;
          background: #eff6ff;
        }

        .warning-map-population {
          color: #1d4ed8;
          font-weight: 700;
        }

        .warning-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .footer-stage-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
        }

        .footer-stage-dot {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: var(--status-critical);
          box-shadow: 0 0 0 2px #ffffff;
        }

        .footer-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .footer-primary {
          min-width: 260px;
          text-transform: none;
        }

        .warning-confirm-card {
          max-width: 800px;
        }

        .warning-summary {
          margin-top: 1rem;
        }

        .warning-confirm-actions {
          margin-top: 1.25rem;
          justify-content: flex-end;
        }

        @media (max-width: 1024px) {
          .warning-modal-body {
            grid-template-columns: minmax(0, 1fr);
          }

          .warning-target-column {
            order: 2;
          }
        }

        @media (max-width: 640px) {
          .warning-modal-shell {
            border-radius: 10px;
          }

          .warning-modal-body {
            padding: 16px 12px 12px;
          }

          .warning-modal-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .footer-actions {
            width: 100%;
            flex-direction: column-reverse;
          }

          .footer-primary {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

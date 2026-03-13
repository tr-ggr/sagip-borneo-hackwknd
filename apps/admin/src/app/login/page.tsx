'use client';

import { useState } from 'react';
import { useAuthControllerSignIn } from '@wira-borneo/api-client';
import { useAuth } from '../../lib/auth';
import { useI18n } from '../../i18n/context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const { mutateAsync: signIn, isPending } = useAuthControllerSignIn();
  const { isLoading: isStatusLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn({
        data: {
          email,
          password,
        },
      });
      window.location.href = '/';
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : null;
      setError(message || t('admin.login.errorInvalid'));
    }
  };

  if (isStatusLoading) {
    return <div className="flex items-center justify-center min-h-screen">{t('admin.common.loading')}</div>;
  }

  return (
    <div className="login-container">
      <div className="card login-card">
        <header className="section-header">
          <p className="eyebrow">{t('admin.login.eyebrow')}</p>
          <h1 className="title">{t('admin.login.title')}</h1>
          <p className="subtitle">{t('admin.login.subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="field-label">
            {t('admin.login.email')}
            <input
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('admin.login.placeholderEmail')}
            />
          </label>

          <label className="field-label">
            {t('admin.login.password')}
            <input
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="error-text mb-4">{error}</p>}

          <button
            type="submit"
            className="btn btn-warning w-full mt-4"
            disabled={isPending}
          >
            {isPending ? t('admin.login.loggingIn') : t('admin.login.submit')}
          </button>
        </form>

        <p className="small muted mt-6">{t('admin.login.footer')}</p>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 48px);
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
        }
        .w-full {
          width: 100%;
        }
        .mb-4 {
          margin-bottom: 1rem;
        }
        .mt-4 {
          margin-top: 1rem;
        }
        .mt-6 {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

import Head from 'next/head';
import { Moon, Sun } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { useLayout } from '@/components/layout/LayoutContext';
import { useThemeMode } from '@/components/common/ThemeProvider';

export default function SettingsPage() {
  const { onMenuClick } = useLayout();
  const { mode, setMode } = useThemeMode();

  return (
    <>
      <Head>
        <title>Settings | BFL Digital Twin</title>
      </Head>

      <div className="page">
        <Header
          onMenuClick={onMenuClick}
          title="Settings"
          subtitle="Workspace and user preferences"
          lastUpdated={new Date()}
          isRefreshing={false}
          onRefresh={() => undefined}
        />

        <div className="page-body">
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 20,
              maxWidth: 480,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Appearance
            </h3>
            <p
              style={{
                margin: '4px 0 16px',
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              Choose how the app looks on this device.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setMode('light')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border:
                    mode === 'light'
                      ? '2px solid var(--brand-yellow)'
                      : '1px solid var(--border)',
                  background: mode === 'light' ? '#fff' : 'transparent',
                  color: 'var(--text)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Sun size={16} />
                Light
              </button>

              <button
                type="button"
                onClick={() => setMode('dark')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border:
                    mode === 'dark'
                      ? '2px solid var(--brand-yellow)'
                      : '1px solid var(--border)',
                  background: mode === 'dark' ? '#fff' : 'transparent',
                  color: 'var(--text)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

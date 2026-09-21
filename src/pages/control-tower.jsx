import Head from 'next/head';

import { ControlTowerPage } from '@/components/personas/ControlTowerPage';
import { getControlTowerDashboard } from '@/services/controlTower.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

const TIMEFRAMES = ['today', 'yesterday', 'last7'];

const first = (value) => (Array.isArray(value) ? value[0] : value);

export async function getServerSideProps({ query }) {
  const timeframe = TIMEFRAMES.includes(first(query.timeframe))
    ? first(query.timeframe)
    : 'today';
  const date = first(query.date) || undefined;

  try {
    const dashboard = await getControlTowerDashboard({ date });

    return {
      props: serializeProps({
        initialDashboard: dashboard,
        initialTimeframe: timeframe,
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: serializeProps({
        initialDashboard: null,
        initialTimeframe: timeframe,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(
          error,
          'Failed to load Control Tower data.',
        ),
      }),
    };
  }
}

export default function ControlTowerRoute({
  initialDashboard,
  initialTimeframe,
  fetchedAt,
  initialError = '',
}) {
  return (
    <>
      <Head>
        <title>Control Tower | BFL Digital Twin</title>
      </Head>
      <ControlTowerPage
        initialDashboard={initialDashboard}
        initialTimeframe={initialTimeframe}
        fetchedAt={fetchedAt}
        initialError={initialError}
      />
    </>
  );
}

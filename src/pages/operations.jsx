import Head from 'next/head';

import { OperationsPage } from '@/components/personas/OperationsPage';
import { getOperationsDashboard } from '@/services/operations.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

const TIMEFRAMES = ['today', 'yesterday', 'last7'];

const first = (value) => (Array.isArray(value) ? value[0] : value);

export async function getServerSideProps({ query }) {
  const timeframe = TIMEFRAMES.includes(first(query.timeframe))
    ? first(query.timeframe)
    : 'today';
  const warehouse = first(query.warehouse) || '';
  const date = first(query.date) || undefined;

  try {
    const dashboard = await getOperationsDashboard({ date });

    return {
      props: serializeProps({
        initialDashboard: dashboard,
        initialTimeframe: timeframe,
        initialWarehouse: warehouse,
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: serializeProps({
        initialDashboard: null,
        initialTimeframe: timeframe,
        initialWarehouse: warehouse,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load Operations data.'),
      }),
    };
  }
}

export default function OperationsRoute({
  initialDashboard,
  initialTimeframe,
  initialWarehouse,
  fetchedAt,
  initialError = '',
}) {
  return (
    <>
      <Head>
        <title>Operations | BFL Digital Twin</title>
      </Head>
      <OperationsPage
        initialDashboard={initialDashboard}
        initialTimeframe={initialTimeframe}
        initialWarehouse={initialWarehouse}
        fetchedAt={fetchedAt}
        initialError={initialError}
      />
    </>
  );
}

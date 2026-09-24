import Head from 'next/head';

import { ScenariosPage } from '@/components/scenarios/ScenariosPage';
import { getSimulationDashboard } from '@/services/simulation.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

const first = (value) => (Array.isArray(value) ? value[0] : value);

export async function getServerSideProps({ query }) {
  const warehouse = first(query.warehouse) || '';
  const date = first(query.date) || undefined;

  try {
    const dashboard = await getSimulationDashboard({ date });
    return {
      props: serializeProps({
        initialDashboard: dashboard,
        initialWarehouse: warehouse,
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: serializeProps({
        initialDashboard: null,
        initialWarehouse: warehouse,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load scenario data.'),
      }),
    };
  }
}

export default function ScenariosRoute({
  initialDashboard,
  initialWarehouse,
  fetchedAt,
  initialError = '',
}) {
  return (
    <>
      <Head>
        <title>Scenarios | BFL Digital Twin</title>
      </Head>
      <ScenariosPage
        initialDashboard={initialDashboard}
        initialWarehouse={initialWarehouse}
        fetchedAt={fetchedAt}
        initialError={initialError}
      />
    </>
  );
}

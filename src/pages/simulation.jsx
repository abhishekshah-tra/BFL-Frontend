import Head from 'next/head';

import { SimulationPage } from '@/components/simulation/SimulationPage';
import { getSimulationDashboard } from '@/services/simulation.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

const first = (value) => (Array.isArray(value) ? value[0] : value);

export async function getServerSideProps({ query }) {
  const warehouse = first(query.warehouse) || '';
  const template = first(query.template) || '';
  const date = first(query.date) || undefined;

  try {
    const dashboard = await getSimulationDashboard({ date });
    return {
      props: serializeProps({
        initialDashboard: dashboard,
        initialWarehouse: warehouse,
        initialTemplate: template,
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: serializeProps({
        initialDashboard: null,
        initialWarehouse: warehouse,
        initialTemplate: template,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load simulation data.'),
      }),
    };
  }
}

export default function SimulationRoute({
  initialDashboard,
  initialWarehouse,
  initialTemplate,
  fetchedAt,
  initialError = '',
}) {
  return (
    <>
      <Head>
        <title>Simulation | BFL Digital Twin</title>
      </Head>
      <SimulationPage
        initialDashboard={initialDashboard}
        initialWarehouse={initialWarehouse}
        initialTemplate={initialTemplate}
        fetchedAt={fetchedAt}
        initialError={initialError}
      />
    </>
  );
}

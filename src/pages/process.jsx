import Head from 'next/head';

import { ProcessPage } from '@/components/personas/ProcessPage';
import { getProcessDetails } from '@/services/processDetails.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

const first = (value) => (Array.isArray(value) ? value[0] : value);

export async function getServerSideProps({ query }) {
  const warehouse = first(query.warehouse) || '';
  const processName = first(query.process) || '';
  const date = first(query.date) || undefined;

  try {
    const dashboard = await getProcessDetails({ date });

    return {
      props: serializeProps({
        initialDashboard: dashboard,
        initialWarehouse: warehouse,
        initialProcess: processName,
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: serializeProps({
        initialDashboard: null,
        initialWarehouse: warehouse,
        initialProcess: processName,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load process details.'),
      }),
    };
  }
}

export default function ProcessRoute({
  initialDashboard,
  initialWarehouse,
  initialProcess,
  fetchedAt,
  initialError = '',
}) {
  return (
    <>
      <Head>
        <title>Process Details | BFL Digital Twin</title>
      </Head>
      <ProcessPage
        initialDashboard={initialDashboard}
        initialWarehouse={initialWarehouse}
        initialProcess={initialProcess}
        fetchedAt={fetchedAt}
        initialError={initialError}
      />
    </>
  );
}

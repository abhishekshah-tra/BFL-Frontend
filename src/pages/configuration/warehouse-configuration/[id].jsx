import WarehouseConfigFormPage from './_FormPage';
import { PROCESS_MASTER_DATA } from '@/data/processMaster';
import {
  mapWarehouseConfigToForm,
} from '@/data/warehouseConfiguration';
import { WAREHOUSE_MASTER_DATA } from '@/data/warehouseMaster';
import { getWarehouseConfigById } from '@/services/configuration.service';
import { getProcesses } from '@/services/process.service';
import { getWarehouses } from '@/services/warehouse.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

export async function getServerSideProps({ query }) {
  const configId = Array.isArray(query.id) ? query.id[0] : query.id;
  const mode = query.mode === 'view' ? 'view' : 'edit';

  try {
    const [warehouseData, processData] = await Promise.all([
      getWarehouses(),
      getProcesses(),
    ]);

    const warehouses = Array.isArray(warehouseData)
      ? warehouseData
      : WAREHOUSE_MASTER_DATA;
    const processes = Array.isArray(processData)
      ? processData
      : PROCESS_MASTER_DATA;

    if (!configId) {
      return {
        props: serializeProps({
          mode,
          configId: '',
          warehouses,
          processes,
          initialRow: null,
          fetchedAt: new Date().toISOString(),
          initialError: '',
          notFound: true,
        }),
      };
    }

    try {
      const row = await getWarehouseConfigById(configId);

      if (!row) {
        return {
          props: serializeProps({
            mode,
            configId,
            warehouses,
            processes,
            initialRow: null,
            fetchedAt: new Date().toISOString(),
            initialError: '',
            notFound: true,
          }),
        };
      }

      return {
        props: serializeProps({
          mode,
          configId,
          warehouses,
          processes,
          initialRow: row,
          initialForm: mapWarehouseConfigToForm(row, processes),
          fetchedAt: new Date().toISOString(),
          initialError: '',
          notFound: false,
        }),
      };
    } catch (loadError) {
      return {
        props: serializeProps({
          mode,
          configId,
          warehouses,
          processes,
          initialRow: null,
          fetchedAt: new Date().toISOString(),
          initialError: getErrorMessage(
            loadError,
            'Failed to load configuration.',
          ),
          notFound: true,
        }),
      };
    }
  } catch (error) {
    return {
      props: serializeProps({
        mode,
        configId: configId || '',
        warehouses: WAREHOUSE_MASTER_DATA,
        processes: PROCESS_MASTER_DATA,
        initialRow: null,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load master data.'),
        notFound: true,
      }),
    };
  }
}

export default function WarehouseConfigurationDetailPage(props) {
  return <WarehouseConfigFormPage {...props} />;
}

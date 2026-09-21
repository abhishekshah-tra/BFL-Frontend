import WarehouseConfigFormPage from './_FormPage';
import { PROCESS_MASTER_DATA } from '@/data/processMaster';
import { WAREHOUSE_MASTER_DATA } from '@/data/warehouseMaster';
import { getProcesses } from '@/services/process.service';
import { getWarehouses } from '@/services/warehouse.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

export async function getServerSideProps() {
  try {
    const [warehouseData, processData] = await Promise.all([
      getWarehouses(),
      getProcesses(),
    ]);

    return {
      props: serializeProps({
        mode: 'add',
        warehouses: Array.isArray(warehouseData)
          ? warehouseData
          : WAREHOUSE_MASTER_DATA,
        processes: Array.isArray(processData)
          ? processData
          : PROCESS_MASTER_DATA,
        fetchedAt: new Date().toISOString(),
        initialError: '',
        notFound: false,
      }),
    };
  } catch (error) {
    return {
      props: serializeProps({
        mode: 'add',
        warehouses: WAREHOUSE_MASTER_DATA,
        processes: PROCESS_MASTER_DATA,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load master data.'),
        notFound: false,
      }),
    };
  }
}

export default function NewWarehouseConfigurationPage(props) {
  return <WarehouseConfigFormPage {...props} />;
}

import {
  createWarehouseConfig,
  getWarehouseConfigs,
} from '@/services/configuration.service';
import { createCollectionHandler } from '@/utils/apiRoute';

export default createCollectionHandler({
  list: getWarehouseConfigs,
  create: createWarehouseConfig,
});

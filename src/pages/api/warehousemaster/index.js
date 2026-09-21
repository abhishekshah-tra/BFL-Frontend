import {
  createWarehouse,
  getWarehouses,
} from '@/services/warehouse.service';
import { createCollectionHandler } from '@/utils/apiRoute';

export default createCollectionHandler({
  list: getWarehouses,
  create: createWarehouse,
});

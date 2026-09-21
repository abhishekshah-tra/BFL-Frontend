import {
  deleteWarehouse,
  getWarehouseById,
  updateWarehouse,
} from '@/services/warehouse.service';
import { createItemHandler } from '@/utils/apiRoute';

export default createItemHandler({
  getById: getWarehouseById,
  update: updateWarehouse,
  remove: deleteWarehouse,
});

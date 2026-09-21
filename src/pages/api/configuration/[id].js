import {
  deleteWarehouseConfig,
  getWarehouseConfigById,
  updateWarehouseConfig,
} from '@/services/configuration.service';
import { createItemHandler } from '@/utils/apiRoute';

export default createItemHandler({
  getById: getWarehouseConfigById,
  update: updateWarehouseConfig,
  remove: deleteWarehouseConfig,
});

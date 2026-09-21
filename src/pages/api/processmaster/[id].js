import {
  deleteProcess,
  getProcessById,
  updateProcess,
} from '@/services/process.service';
import { createItemHandler } from '@/utils/apiRoute';

export default createItemHandler({
  getById: getProcessById,
  update: updateProcess,
  remove: deleteProcess,
});

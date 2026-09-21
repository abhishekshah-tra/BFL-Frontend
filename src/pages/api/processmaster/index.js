import { createProcess, getProcesses } from '@/services/process.service';
import { createCollectionHandler } from '@/utils/apiRoute';

export default createCollectionHandler({
  list: getProcesses,
  create: createProcess,
});

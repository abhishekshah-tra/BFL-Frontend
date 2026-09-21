import { getErrorMessage } from '@/utils/api';

const sendError = (res, error) => {
  const status = error?.response?.status || 500;
  return res.status(status).json({ message: getErrorMessage(error) });
};

export const createCollectionHandler = ({ list, create }) =>
  async function handler(req, res) {
    try {
      if (req.method === 'GET') {
        const data = await list();
        return res.status(200).json(data);
      }

      if (req.method === 'POST') {
        const data = await create(req.body);
        return res.status(201).json(data);
      }

      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
      return sendError(res, error);
    }
  };

export const createItemHandler = ({ getById, update, remove }) =>
  async function handler(req, res) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    try {
      if (req.method === 'GET') {
        const data = await getById(id);
        return res.status(200).json(data);
      }

      if (req.method === 'PATCH' || req.method === 'PUT') {
        const data = await update(id, req.body);
        return res.status(200).json(data);
      }

      if (req.method === 'DELETE') {
        const data = await remove(id);
        return res.status(200).json(data ?? { success: true });
      }

      res.setHeader('Allow', ['GET', 'PATCH', 'PUT', 'DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
      return sendError(res, error);
    }
  };

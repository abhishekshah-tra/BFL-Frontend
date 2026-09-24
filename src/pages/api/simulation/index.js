import { getSimulationDashboard } from '@/services/simulation.service';
import { getErrorMessage } from '@/utils/api';

const first = (value) => (Array.isArray(value) ? value[0] : value);

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const data = await getSimulationDashboard({ date: first(req.query.date) });
    return res.status(200).json(data);
  } catch (error) {
    const status = error?.response?.status || 500;
    return res.status(status).json({ message: getErrorMessage(error) });
  }
}

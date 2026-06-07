import client from './client';

export const downloadRoute = async (wardId) => {
  const response = await client.get(`/sync/download_route?ward_id=${wardId}`);
  return response.data;
};

export const uploadBatch = async (transactions) => {
  const response = await client.post('/sync/upload_batch', { transactions });
  return response.data;
};

export const getRouteStatus = async () => {
  const response = await client.get('/sync/route_status');
  return response.data;
};

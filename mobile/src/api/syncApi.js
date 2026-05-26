import client from './client';

export const syncApi = {
  // Morning: download citizen list for ward
  downloadRoute: (ward_no) =>
    client.get('/v1/sync/download_route', { params: { ward_no } }),

  // Afternoon: upload batch of offline transactions
  uploadBatch: (ward_no, transactions) =>
    client.post('/v1/sync/upload_batch', { ward_no, transactions }),
};

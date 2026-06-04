import client from './client';

// Backend router: prefix="/api/v1/sync" (sync.py)
// client.js baseURL already includes "/api", so paths here start from /v1/sync/
// Confirmed correct — no change needed from V1 paths.

export const syncApi = {
  // Morning: download citizen list for ward
  // GET /api/v1/sync/download_route?ward_no=4
  downloadRoute: (ward_no) =>
    client.get('/v1/sync/download_route', { params: { ward_no } }),

  // Afternoon: upload batch of offline transactions
  // POST /api/v1/sync/upload_batch
  uploadBatch: (ward_no, transactions) =>
    client.post('/v1/sync/upload_batch', { ward_no, transactions }),
};

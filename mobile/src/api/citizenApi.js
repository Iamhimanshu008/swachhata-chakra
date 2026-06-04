import client from './client';

export const citizenApi = {
  getProfile: () => client.get('/citizen/profile'),
  getWallet: () => client.get('/citizen/wallet'),
  register: (name, phone_number, ward_no) =>
    client.post('/citizen/register', null, {
      params: { name, phone_number, ward_no }
    }),
  getLeaderboard: (ward_no) =>
    client.get('/points/leaderboard', { params: { ward_no } }),
  // Note: no public store/items endpoint exists yet — /admin/store/items
  // is admin-only. Returns empty array on 403 to avoid UI crash.
  fetchStoreItems: () =>
    client.get('/admin/store/items').catch(() => ({ data: [] })),
  redeemItem: (itemId, pointsToRedeem) =>
    client.post('/points/redeem', { item_id: itemId, points_to_redeem: pointsToRedeem }),
};

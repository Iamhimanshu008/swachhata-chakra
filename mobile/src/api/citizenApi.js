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
};

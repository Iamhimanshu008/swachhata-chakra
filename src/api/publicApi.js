import client from './client';
import { API_BASE_URL } from '../config';

export const getBins = async () => {
    const res = await client.get('/public/bins');
    return res.data;
};

export const submitPublicReport = async (formData) => {
  const response = await client.post('/public/report', formData, {
    headers: {
      'Content-Type': undefined,  // Let axios auto-set with boundary
    },
    timeout: 90000,  // Image uploads need more time
    transformRequest: (data) => data,  // Prevent axios from re-serializing FormData
  });
  return response.data;
};

export const getReportStatus = async (id) => {
    const res = await client.get(`/public/report/${id}/status`);
    return res.data;
};

export const getLiveStatus = async () => {
    const res = await client.get('/public/live-status');
    return res.data;
};

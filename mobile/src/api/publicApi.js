import client from './client';

export const getBins = async () => {
    const res = await client.get('/public/bins');
    return res.data;
};

export const submitPublicReport = async (formData) => {
  const MAX_RETRIES = 3;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${MAX_RETRIES}`);
      
      const response = await client.post('/public/report', formData, {
        transformRequest: (data, headers) => {
          delete headers.post['Content-Type'];
          delete headers.common['Content-Type'];
          delete headers['Content-Type'];
          return data;
        },
        timeout: 120000,
      });
      
      console.log('Upload success:', response.data);
      return response.data;
      
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (error.response) {
        // Server responded with error — no retry needed
        console.log('Server error:', error.response.status, error.response.data);
        throw new Error(
          error.response?.data?.detail || 
          `Server error ${error.response.status}`
        );
      }
      
      // No response (timeout/network) — wait and retry
      if (attempt < MAX_RETRIES) {
        console.log(`Waiting 5s before retry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  throw new Error('Server unavailable after 3 attempts. Try again in 1 minute.');
};

export const getReportStatus = async (id) => {
    const res = await client.get(`/public/report/${id}/status`);
    return res.data;
};

export const getLiveStatus = async () => {
    const res = await client.get('/public/live-status');
    return res.data;
};

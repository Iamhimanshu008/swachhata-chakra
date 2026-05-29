import client from './client';

export const getDashboard = async () => {
    const res = await client.get('/admin/dashboard');
    return res.data;
};

export const getUsers = async () => {
    const res = await client.get('/admin/users');
    return res.data;
};

export const createUser = async (data) => {
    const res = await client.post('/admin/users', data);
    return res.data;
};

export const updateUser = async (id, data) => {
    const res = await client.put(`/admin/users/${id}`, data);
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await client.delete(`/admin/users/${id}`);
    return res.data;
};

export const getZones = async () => {
    const res = await client.get('/admin/zones');
    return res.data;
};

export const createZone = async (data) => {
    const res = await client.post('/admin/zones', data);
    return res.data;
};

export const updateZone = async (id, data) => {
    const res = await client.put(`/admin/zones/${id}`, data);
    return res.data;
};

export const deleteZone = async (id) => {
    const res = await client.delete(`/admin/zones/${id}`);
    return res.data;
};

export const getBins = async () => {
    const res = await client.get('/admin/bins');
    return res.data;
};

export const createBin = async (data) => {
    const res = await client.post('/admin/bins', data);
    return res.data;
};

export const updateBin = async (id, data) => {
    const res = await client.put(`/admin/bins/${id}`, data);
    return res.data;
};

export const deleteBin = async (id) => {
    const res = await client.delete(`/admin/bins/${id}`);
    return res.data;
};

export const getAnalytics = async () => {
    const res = await client.get('/admin/analytics');
    return res.data;
};

export const getQRStatusStats = async () => {
    const res = await client.get('/admin/qr/status');
    return res.data;
};

// --- Panchayat Endpoints ---

export const registerPanchayat = async (data) => {
    const res = await client.post('/admin/panchayat/register', data);
    return res.data;
};

export const getPanchayats = async () => {
    const res = await client.get('/admin/panchayats');
    return res.data;
};

export const approvePanchayat = async (id) => {
    const res = await client.patch(`/admin/panchayat/${id}/approve`);
    return res.data;
};

export const getPanchayatVitals = async (id) => {
    const res = await client.get(`/admin/panchayat/${id}/vitals`);
    return res.data;
};

export const createSubAdmin = async (id, data) => {
    const res = await client.post(`/admin/panchayat/${id}/sub_admin`, data);
    return res.data;
};

export const getRoutes = async () => {
    const res = await client.get('/admin/routes');
    return res.data;
};

export const generateRoutes = async (zoneId) => {
    const params = zoneId ? `?zone_id=${zoneId}` : '';
    const res = await client.post(`/admin/routes/generate${params}`, null, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
        },
    });
    return res.data;
};

export const getSettings = async () => {
    const res = await client.get('/admin/settings');
    return res.data;
};

export const updateSettings = async (data) => {
    const res = await client.put('/admin/settings', data);
    return res.data;
};

export const getReports = async () => {
    const res = await client.get('/admin/reports');
    return res.data;
};

export const exportExcel = async () => {
    const res = await client.get('/admin/export/excel', { responseType: 'blob' });
    return res.data;
};

export const getWardSummary = async (wardNo) => {
    const res = await client.get('/points/ward_summary', { params: { ward_no: wardNo } });
    return res.data;
};

export const updateQRStatus = async (houseId, status) => {
    const res = await client.patch('/admin/qr/status', { house_id: houseId, status });
    return res.data;
};

export const getCitizensByWard = async (wardNo) => {
    const res = await client.get('/admin/qr/citizens', { params: { ward_no: wardNo } });
    return res.data;
};

import client from './client';

export const login = async (email, password, role) => {
    const payload = { email, password, role: role || 'collector' };
    try {
        const res = await client.post('/auth/login', payload);
        return res.data;
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            throw new Error('Server is waking up, please wait 30 seconds and try again');
        } else if (!err.response) {
            throw new Error('Cannot reach server. Check your internet connection.');
        } else if (err.response.status === 401) {
            throw new Error('Invalid email or password');
        } else {
            throw new Error(err.response?.data?.detail || 'Login failed');
        }
    }
};

export const getMe = async () => {
    const res = await client.get('/auth/me');
    return res.data;
};

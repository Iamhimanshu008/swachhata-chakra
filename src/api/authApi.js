import client from './client';

export const login = async (email, password, role) => {
    const payload = { email, password, role: role || 'collector' };
    const res = await client.post('/auth/login', payload, {
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
};

export const getMe = async () => {
    const res = await client.get('/auth/me');
    return res.data;
};

import client from './client';

export const getTodayRoute = async () => {
    const res = await client.get('/collector/route/today');
    return res.data;
};

// V1 bins endpoint deprecated — collection is now handled via
// QR scan + weight entry in CollectionScreen → AfternoonSync upload flow.
export const collectBin = async (binId) => {
    // No-op: V1 /collector/bins/:id/collect no longer used.
    // Return success silently so any legacy callers don't crash.
    return { success: true, deprecated: true };
};

export const getHistory = async () => {
    const res = await client.get('/collector/history');
    return res.data;
};

export const getStats = async () => {
    const res = await client.get('/collector/stats');
    return res.data;
};

export const updateLocation = async (lat, lng) => {
    const res = await client.post('/collector/location/update', {
        latitude: lat,
        longitude: lng
    });
    return res.data;
};

export const uploadWasteImage = async (imageUri, transactionId) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    
    formData.append('file', { uri: imageUri, name: filename, type });
    if (transactionId) {
        formData.append('transaction_id', transactionId);
    }

    const res = await client.post('/ai_grading/grade_waste', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

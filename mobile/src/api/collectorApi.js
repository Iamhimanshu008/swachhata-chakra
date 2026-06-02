import client from './client';

export const getTodayRoute = async () => {
    const res = await client.get('/collector/route/today');
    return res.data;
};

export const collectBin = async (binId, kg_collected = 0, notes = null, collector_lat = null, collector_lng = null) => {
    const payload = {
        kg_collected,
        notes,
    };
    
    // Pass location as query parameters to match backend expectations
    const res = await client.post(`/collector/bins/${binId}/collect`, payload, {
        params: {
            collector_lat: collector_lat ? parseFloat(collector_lat) : null,
            collector_lng: collector_lng ? parseFloat(collector_lng) : null
        }
    });
    return res.data;
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

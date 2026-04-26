import client from './client';

export const getNews = async () => {
  const response = await client.get('/news/');
  return response.data;
};

import apiClient from './apiClient';

export const estimateRideFare = (payload) => apiClient.post('/rides/estimate', payload).then((r) => r.data);

export const bookRide = (payload) => apiClient.post('/rides/book', payload).then((r) => r.data);

export const getActiveRide = () => apiClient.get('/rides/active').then((r) => r.data);

export const getRideById = (id) => apiClient.get(`/rides/${id}`).then((r) => r.data);

export const getRideHistory = (page = 1) => apiClient.get(`/rides/history?page=${page}`).then((r) => r.data);

export const cancelRide = (id, reason) => apiClient.put(`/rides/${id}/cancel`, { reason }).then((r) => r.data);

export const rateRide = (id, rating, review) =>
  apiClient.post(`/rides/${id}/rate`, { rating, review }).then((r) => r.data);

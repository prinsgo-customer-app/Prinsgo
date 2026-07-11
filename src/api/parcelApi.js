import apiClient from './apiClient';

export const estimateParcelCharge = (payload) =>
  apiClient.post('/parcels/estimate', payload).then((r) => r.data);

export const bookParcel = (payload) => apiClient.post('/parcels/book', payload).then((r) => r.data);

export const getActiveParcels = () => apiClient.get('/parcels/active').then((r) => r.data);

export const getParcelById = (id) => apiClient.get(`/parcels/${id}`).then((r) => r.data);

export const getParcelHistory = (page = 1) =>
  apiClient.get(`/parcels/history?page=${page}`).then((r) => r.data);

export const cancelParcel = (id, reason) =>
  apiClient.put(`/parcels/${id}/cancel`, { reason }).then((r) => r.data);

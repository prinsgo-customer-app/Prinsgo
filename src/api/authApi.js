import apiClient from './apiClient';

export const sendOtp = (phone) => apiClient.post('/auth/send-otp', { phone }).then((r) => r.data);

export const verifyOtp = (phone, code, name) =>
  apiClient.post('/auth/verify-otp', { phone, code, name }).then((r) => r.data);

export const getMe = () => apiClient.get('/auth/me').then((r) => r.data);

export const updateProfile = (payload) => apiClient.put('/auth/profile', payload).then((r) => r.data);

export const addAddress = (payload) => apiClient.post('/auth/address', payload).then((r) => r.data);

export const deleteAddress = (addressId) =>
  apiClient.delete(`/auth/address/${addressId}`).then((r) => r.data);

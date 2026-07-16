import apiClient from './apiClient';

export const getWalletTransactions = (page = 1) =>
  apiClient.get(`/wallet/transactions?page=${page}`).then((r) => r.data);

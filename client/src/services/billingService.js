import api from './api';

export const searchBillingProducts = async (query = '') => {
  const { data } = await api.get(`/bills/search-products?q=${encodeURIComponent(query)}`);
  return data;
};

export const createBill = async (billData) => {
  const { data } = await api.post('/bills', billData);
  return data;
};

export const getBills = async ({ page = 1, limit = 15, keyword = '', paymentMode = 'All', date = '' } = {}) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (keyword) params.append('keyword', keyword);
  if (paymentMode && paymentMode !== 'All') params.append('paymentMode', paymentMode);
  if (date) params.append('date', date);

  const { data } = await api.get(`/bills?${params.toString()}`);
  return data;
};

export const getBillById = async (id) => {
  const { data } = await api.get(`/bills/${id}`);
  return data;
};

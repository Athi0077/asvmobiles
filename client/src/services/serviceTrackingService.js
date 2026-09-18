import api from './api';

export const createServiceRecord = async (serviceData) => {
  const { data } = await api.post('/services', serviceData);
  return data;
};

export const getAdminServices = async () => {
  const { data } = await api.get('/services');
  return data;
};

export const getServiceById = async (id) => {
  const { data } = await api.get(`/services/${id}`);
  return data;
};

export const updateServiceRecord = async (id, serviceData) => {
  const { data } = await api.put(`/services/${id}`, serviceData);
  return data;
};

export const updateServiceStatus = async (id, status) => {
  const { data } = await api.patch(`/services/${id}/status`, { status });
  return data;
};

export const deleteServiceRecord = async (id) => {
  const { data } = await api.delete(`/services/${id}`);
  return data;
};

export const getPublicTrackingDetails = async (trackingToken) => {
  const { data } = await api.get(`/services/track/${trackingToken}`);
  return data;
};

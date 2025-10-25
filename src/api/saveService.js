import api from "@/lib/axios";

const cleanParams = (params) => {
  const cleaned = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

export const saveService = {
  saveItem: (itemType, itemId) => api.post('/api/saved', { itemType, itemId }),
  unsaveItem: (itemType, itemId) => api.delete(`/api/saved/${itemType}/${itemId}`),
  getSavedItems: (params) => api.get('/api/saved', { params: cleanParams(params) }),
  getSavedJobs: (params) => api.get('/api/saved/jobs', { params: cleanParams(params) }),
  getSavedGigs: (params) => api.get('/api/saved/gigs', { params: cleanParams(params) }),
  checkIfSaved: (itemType, itemId) => api.get(`/api/saved/check/${itemType}/${itemId}`),
  getSavedCount: (params) => api.get('/api/saved/count', { params: cleanParams(params) }),
  getSavedStats: () => api.get('/api/saved/stats'),
  bulkUnsaveItems: (items) => api.delete('/api/saved/bulk', { data: { items } })
};
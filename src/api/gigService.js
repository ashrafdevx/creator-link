import api from "@/lib/axios";

export const gigService = {
  createGig: (gigData) => api.post('/api/gigs', gigData),
  searchGigs: (params) => api.get('/api/gigs/search', { params }),
  getAllGigs: (params) => api.get('/api/gigs', { params }),
  getGigById: (gigId) => api.get(`/api/gigs/${gigId}`),
  updateGig: (gigId, updateData) => api.put(`/api/gigs/${gigId}`, updateData),
  deleteGig: (gigId) => api.delete(`/api/gigs/${gigId}`),
  toggleGigStatus: (gigId, status) => api.patch(`/api/gigs/${gigId}/status`, { status }),
  getMyGigs: (params) => api.get('/api/gigs/my-gigs', { params }),
  getUserGigs: (userId, params) => api.get(`/api/gigs/user/${userId}`, { params }),
  getGigStats: () => api.get('/api/gigs/stats'),
  getGigCategories: () => api.get('/api/gigs/categories'),
  calculateOrderTotal: (gigId, packageType) => api.get(`/api/gigs/${gigId}/order-total/${packageType}`),
  orderGig: (gigId, packageType) => api.post(`/api/gigs/${gigId}/order`, { packageType }),

  // Image upload methods
  getGigImageUploadUrl: (uploadData) => api.post('/api/gigs/image/upload-url', uploadData),
  confirmGigImageUpload: (uploadData) => api.post('/api/gigs/image/confirm-upload', uploadData),
  deleteGigImage: (gigId) => api.delete(`/api/gigs/${gigId}/image`)
};
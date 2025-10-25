import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const submitContactForm = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/api/contact`, formData, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const documentApi = {
  getDocuments: async () => {
    const response = await apiClient.get('/documents');
    return response.data.documents;
  },

  getDocumentById: async (id) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data.document;
  },

  createDocument: async (docData) => {
    const response = await apiClient.post('/documents', docData);
    return response.data.document;
  },

  deleteDocument: async (id) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },
};

export default apiClient;

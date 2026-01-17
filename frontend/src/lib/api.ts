import axios from 'axios';
import type {
  Project,
  Rating,
  ContactInfo,
  ContactMessage,
  LoginResponse,
  Analytics,
  ApiResponse,
} from '@/types';

// Use relative paths for API routes in production (Next.js API routes)
// For local development, can override with NEXT_PUBLIC_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API
export const api = {
  getProjects: async (filters?: {
    category?: string;
    tech?: string;
    year?: string;
    sort?: string;
  }): Promise<ApiResponse<Project[]>> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tech) params.append('tech', filters.tech);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.sort) params.append('sort', filters.sort);

    const { data } = await apiClient.get(`/projects?${params.toString()}`);
    return data;
  },

  getFilterOptions: async (): Promise<ApiResponse<{ categories: string[]; technologies: string[] }>> => {
    const { data } = await apiClient.get('/projects/filter-options');
    return data;
  },

  getProjectById: async (id: string): Promise<ApiResponse<Project>> => {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },

  createRating: async (ratingData: {
    rating: number;
    feedback?: string;
  }): Promise<ApiResponse<Rating>> => {
    const { data } = await apiClient.post('/ratings', ratingData);
    return data;
  },

  getContactInfo: async (): Promise<ApiResponse<ContactInfo>> => {
    const { data } = await apiClient.get('/contact');
    return data;
  },

  createContactMessage: async (
    message: ContactMessage
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/contact', message);
    return data;
  },
};

// Admin API
export const adminApi = {
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post('/admin/login', credentials);
    return data;
  },

  createProject: async (
    token: string,
    projectData: Partial<Project>
  ): Promise<ApiResponse<Project>> => {
    const { data } = await apiClient.post('/admin/projects', projectData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  updateProject: async (
    token: string,
    id: string,
    projectData: Partial<Project>
  ): Promise<ApiResponse<Project>> => {
    const { data } = await apiClient.put(
      `/admin/projects/${id}`,
      projectData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  },

  deleteProject: async (
    token: string,
    id: string
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.delete(`/admin/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  getRatings: async (token: string): Promise<ApiResponse<Rating[]>> => {
    const { data } = await apiClient.get('/admin/ratings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  deleteRating: async (token: string, id: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.delete(`/admin/ratings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  updateContactInfo: async (
    token: string,
    contactData: Partial<ContactInfo>
  ): Promise<ApiResponse<ContactInfo>> => {
    const { data } = await apiClient.put('/admin/contact', contactData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  getAnalytics: async (token: string): Promise<ApiResponse<Analytics>> => {
    const { data } = await apiClient.get('/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};

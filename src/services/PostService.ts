import axios from 'axios';
import { Post } from '../models/PostModel';

const API_URL = 'https://localhost:44352/Posts';

export const PostService = {
  getAllPosts: async (): Promise<Post[]> => {
    try {
      const response = await axios.get<Post[]>(API_URL, {
        responseType: 'json',
        timeout: 30000, // 30 seconds timeout
      });
      return response.data;
    } catch (error) {
      console.error('Get all posts error:', error);
      throw error;
    }
  },

  getFilteredPosts: async (fileType: string, searchTerm: string): Promise<Post[]> => {
    try {
      const params = {
        fileType,
        searchTerm,
      };
      const response = await axios.get<Post[]>(`${API_URL}/filter`, { params });
      return response.data;
    } catch (error) {
      console.error('Get filtered posts error:', error);
      throw error;
    }
  },
};

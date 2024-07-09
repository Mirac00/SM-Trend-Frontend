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

  likePost: async (postId: number, userId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('jwt'); // Pobieranie tokena z localStorage
      await axios.post(`${API_URL}/like`, { postId, userId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    } catch (error) {
      console.error('Like post error:', error);
      throw error;
    }
  },

  dislikePost: async (postId: number, userId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('jwt'); // Pobieranie tokena z localStorage
      await axios.post(`${API_URL}/dislike`, { postId, userId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    } catch (error) {
      console.error('Dislike post error:', error);
      throw error;
    }
  },

  getPostById: async (postId: number): Promise<Post> => {
    try {
      const response = await axios.get<Post>(`${API_URL}/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get post by id error:', error);
      throw error;
    }
  },
};

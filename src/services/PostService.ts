import axios from 'axios';
import { Post } from '../models/PostModel';

const API_URL = 'https://localhost:44352/Posts';

/**
 * Serwis obsługujący pobieranie wszystkich postów.
 * @returns Tablica postów.
 */
export const PostService = {
  getAllPosts: async (): Promise<Post[]> => {
    try {
      const response = await axios.get<Post[]>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Get all posts error:', error);
      return [];
    }
  },
};

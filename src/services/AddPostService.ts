import axios from 'axios';
import { AddPostRequest } from '../models/AddPostModel';

const API_URL = 'https://localhost:44352/Posts';

/**
 * Serwis obsługujący dodawanie nowego posta.
 * @param data Obiekt danych do dodania.
 * @param token Token autoryzacyjny.
 */
export const AddPostService = {
  createPost: async (data: AddPostRequest, token: string): Promise<void> => {
    try {
      await axios.post(API_URL, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Create post error:', error);
    }
  },
};

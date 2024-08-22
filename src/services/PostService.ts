import axios, { AxiosError } from 'axios';
import { Post } from '../models/PostModel';

const API_URL = 'https://localhost:44352/Posts';

export const PostService = {
  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await axios.get<Post[]>(API_URL);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get all posts error:');
      return []; // Return an empty array as a fallback
    }
  },

  async getFilteredPosts(fileType: string, searchTerm: string): Promise<Post[]> {
    try {
      const params = { fileType, searchTerm };
      const response = await axios.get<Post[]>(`${API_URL}/filter`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get filtered posts error:');
      return []; // Return an empty array as a fallback
    }
  },

  async getPostsByUser(userId: number): Promise<Post[]> {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('User is not authenticated');
      }
  
      const response = await axios.get<Post[]>(`${API_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },
  
  async getLikedPostsByUser(userId: number): Promise<Post[]> {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('User is not authenticated');
      }
  
      const response = await axios.get<Post[]>(`${API_URL}/liked/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      throw error;
    }
  },
  

  async likePost(postId: number, userId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');
      await axios.post(
        `${API_URL}/like`,
        { postId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Like post error:');
    }
  },

  async dislikePost(postId: number, userId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');
      await axios.post(
        `${API_URL}/dislike`,
        { postId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Dislike post error:');
    }
  },

  async getPostById(postId: number): Promise<Post> {
    try {
      const response = await axios.get<Post>(`${API_URL}/${postId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get post by id error:');
      return {} as Post; // Return an empty object as a fallback
    }
  },

  async getTopLikedPosts(): Promise<Post[]> {
    try {
      const response = await axios.get<Post[]>(`${API_URL}/top-liked`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get top liked posts error:');
      return []; // Return an empty array as a fallback
    }
  },

  getToken(): string | null {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('User is not authenticated.');
    }
    return token;
  },

  handleError(error: unknown, message: string): void {
    if (error instanceof AxiosError) {
      console.error(message, error.response?.status, error.response?.data);
    } else {
      console.error(message, error);
    }
  },
};

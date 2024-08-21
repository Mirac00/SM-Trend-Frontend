import axios, { AxiosError } from 'axios';
import { User } from '../models/User';
import { AuthenticateRequest } from '../models/AuthenticateRequest';

const API_URL = 'https://localhost:44352/Users';

export const UserService = {
  async getUserByToken(token: string): Promise<User | null> {
    try {
      const response = await axios.get<User>(`${API_URL}/GetUserByToken`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user by token:', error);
      return null;
    }
  },

  async authenticate(request: AuthenticateRequest): Promise<User | null> {
    try {
      const response = await axios.post<User>(`${API_URL}/authenticate`, request);
      const user = response.data;
      
      // Store the token in local storage
      localStorage.setItem('jwt', user.token);

      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  },

  async register(user: User): Promise<void> {
    try {
      await axios.post(`${API_URL}/register`, user);
    } catch (error) {
      console.error('Registration error:', error);
    }
  },

  async updateProfile(userId: number, updatedUser: Partial<User>): Promise<void> {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      await axios.put(`${API_URL}/${userId}/update-profile`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Profile update error:', error);
      } else {
        console.error('Unexpected error during profile update:', error);
      }
    }
  },

  async getAll(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  },

  async getById(id: number): Promise<User | null> {
    try {
      const response = await axios.get<User>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      return null;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(`Error deleting user with id ${id}:`, error);
      } else {
        console.error('Unexpected error during user deletion:', error);
      }
    }
  },
};

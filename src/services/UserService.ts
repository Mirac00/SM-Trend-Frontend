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
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        // Token jest nieprawidłowy lub wygasł
        console.error('Token jest nieprawidłowy lub wygasł:', error);
        // Usuwamy token z localStorage
        localStorage.removeItem('jwt');
        return null;
      } else {
        console.error('Błąd podczas pobierania użytkownika po tokenie:', error);
        return null;
      }
    }
  },

  async authenticate(request: AuthenticateRequest): Promise<User | null> {
    try {
      const response = await axios.post<User>(`${API_URL}/authenticate`, request);
      const user = response.data;
      
      // Zapisujemy token w localStorage
      localStorage.setItem('jwt', user.token);
      // Usuwamy flagę 'loggedOut' po zalogowaniu
      localStorage.removeItem('loggedOut');

      return user;
    } catch (error) {
      console.error('Błąd podczas uwierzytelniania:', error);
      return null;
    }
  },

  async register(user: User): Promise<void> {
    try {
      await axios.post(`${API_URL}/register`, user);
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error);
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
      if (axios.isAxiosError(error)) {
        console.error('Błąd podczas aktualizacji profilu:', error);
      } else {
        console.error('Nieoczekiwany błąd podczas aktualizacji profilu:', error);
      }
    }
  },

  async getAll(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania wszystkich użytkowników:', error);
      return [];
    }
  },

  async getById(id: number): Promise<User | null> {
    try {
      const response = await axios.get<User>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Błąd podczas pobierania użytkownika o id ${id}:`, error);
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
      if (axios.isAxiosError(error)) {
        console.error(`Błąd podczas usuwania użytkownika o id ${id}:`, error);
      } else {
        console.error('Nieoczekiwany błąd podczas usuwania użytkownika:', error);
      }
    }
  },
};

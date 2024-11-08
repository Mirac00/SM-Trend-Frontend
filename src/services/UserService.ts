// UserService.ts
import axios from 'axios';
import { User } from '../models/User';
import { AuthenticateRequest } from '../models/AuthenticateRequest';

const API_URL = 'https://localhost:44352/Users';

export const UserService = {
  /**
   * Pobiera użytkownika na podstawie tokenu JWT.
   * @param token Token JWT.
   * @returns Obiekt użytkownika lub null, jeśli nie znaleziono.
   */
  async getUserByToken(token: string): Promise<User | null> {
    try {
      console.log('Sending getUserByToken request with token:', token);
      const response = await axios.get<User>(`${API_URL}/GetUserByToken`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('getUserByToken response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        // Token jest nieprawidłowy lub wygasł
        console.error('Token jest nieprawidłowy lub wygasł:', error);
        // Usuwamy token z localStorage
        localStorage.removeItem('jwt');
        window.dispatchEvent(new Event('storage')); // Powiadamiamy AuthContext
        return null;
      } else {
        console.error('Błąd podczas pobierania użytkownika po tokenie:', error);
        return null;
      }
    }
  },

  /**
   * Uwierzytelnia użytkownika na podstawie nazwy użytkownika i hasła.
   * @param request Obiekt zawierający nazwę użytkownika i hasło.
   * @returns Obiekt użytkownika lub null, jeśli uwierzytelnianie się nie powiodło.
   */
  async authenticate(request: AuthenticateRequest): Promise<User | null> {
    try {
      console.log('Sending authenticate request with:', request);
      const response = await axios.post<User>(`${API_URL}/authenticate`, request);
      const user = response.data;

      console.log('User authenticated:', user);
      return user;
    } catch (error) {
      console.error('Błąd podczas uwierzytelniania:', error);
      return null;
    }
  },

  /**
   * Rejestruje nowego użytkownika.
   * @param user Obiekt użytkownika do zarejestrowania.
   */
  async register(user: User): Promise<void> {
    try {
      console.log('Sending register request with user:', user);
      await axios.post(`${API_URL}/register`, user);
      console.log('User registered successfully:', user);
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error);
    }
  },

  /**
   * Aktualizuje profil użytkownika.
   * @param userId ID użytkownika.
   * @param updatedUser Obiekt zawierający zaktualizowane dane użytkownika.
   */
  async updateProfile(userId: number, updatedUser: Partial<User>): Promise<void> {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      console.log(`Sending updateProfile request for user ID ${userId} with data:`, updatedUser);
      await axios.put(`${API_URL}/${userId}/update-profile`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`User profile updated for ID ${userId}:`, updatedUser);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Błąd podczas aktualizacji profilu:', error.response?.data || error.message);
      } else {
        console.error('Nieoczekiwany błąd podczas aktualizacji profilu:', error);
      }
      throw error; // Rzucenie błędu, aby można było go obsłużyć w komponencie
    }
  },

  /**
   * Pobiera wszystkich użytkowników.
   * @returns Tablica obiektów użytkowników.
   */
  async getAll(): Promise<User[]> {
    try {
      console.log('Sending getAllUsers request');
      const response = await axios.get<User[]>(API_URL);
      console.log('Fetched all users:', response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania wszystkich użytkowników:', error);
      return [];
    }
  },

  /**
   * Pobiera użytkownika na podstawie ID.
   * @param id ID użytkownika.
   * @returns Obiekt użytkownika lub null, jeśli nie znaleziono.
   */
  async getById(id: number): Promise<User | null> {
    try {
      console.log(`Sending getById request for user ID ${id}`);
      const response = await axios.get<User>(`${API_URL}/${id}`);
      console.log(`Fetched user by ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Błąd podczas pobierania użytkownika o id ${id}:`, error);
      return null;
    }
  },

  /**
   * Usuwa użytkownika na podstawie ID.
   * @param id ID użytkownika.
   */
  async delete(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      console.log(`Sending delete request for user ID ${id}`);
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`User deleted with ID ${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Błąd podczas usuwania użytkownika o id ${id}:`, error.response?.data || error.message);
      } else {
        console.error('Nieoczekiwany błąd podczas usuwania użytkownika:', error);
      }
      throw error; // Rzucenie błędu, aby można było go obsłużyć w komponencie
    }
  },

  /**
   * Odświeża token JWT.
   * @returns Nowy token JWT lub null, jeśli odświeżenie nie powiodło się.
   */
  async refreshToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        console.error('No token available to refresh.');
        return null;
      }

      console.log('Sending refreshToken request with token:', token);

      const response = await axios.post<{ token: string }>(`${API_URL}/RefreshToken`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newToken = response.data.token;
      console.log('Received new token from API:', newToken);
      return newToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error refreshing token:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error refreshing token:', error);
      }
      return null;
    }
  },
};

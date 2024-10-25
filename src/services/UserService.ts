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
      const response = await axios.post<User>(`${API_URL}/authenticate`, request);
      const user = response.data;

      // Zapisujemy token w localStorage
      localStorage.setItem('jwt', user.token);
      window.dispatchEvent(new Event('storage')); // Powiadamiamy AuthContext

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
      await axios.post(`${API_URL}/register`, user);
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

  /**
   * Pobiera wszystkich użytkowników.
   * @returns Tablica obiektów użytkowników.
   */
  async getAll(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(API_URL);
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
      const response = await axios.get<User>(`${API_URL}/${id}`);
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

import axios, { AxiosError, AxiosResponse } from 'axios';
import { User } from '../models/User';
import { AuthenticateRequest } from '../models/AuthenticateRequest';

/**
 * Klasa obsługująca usługi związane z użytkownikami.
 */
export class UserService {
  /**
   * Autentykacja użytkownika.
   * @param request Obiekt żądania autentykacji.
   * @returns Obiekt użytkownika lub null w przypadku błędu.
   */
  static async authenticate(request: AuthenticateRequest): Promise<User | null> {
    try {
      const response: AxiosResponse<User> = await axios.post<User>('https://localhost:44352/Users/authenticate', request);
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Pobranie informacji o użytkowniku na podstawie tokena.
   * @param token Token użytkownika.
   * @returns Obiekt użytkownika lub null w przypadku błędu.
   */
  static async getUserByToken(token: string): Promise<User | null> {
    try {
      const response: AxiosResponse<User> = await axios.get<User>('https://localhost:44352/Users/GetUserByToken', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('GetUserByToken error:', error);

      // Explisitly type the error object as AxiosError
      const axiosError = error as AxiosError;

      // Sprawdzenie, czy błąd wynika z wygaśnięcia tokenu
      if (axiosError.response && axiosError.response.status === 401) {
        // Token wygasł, obsługa wylogowania
        window.localStorage.removeItem('jwt');
        return null;
      }

      return null;
    }
  }
}

import { jwtDecode } from "jwt-decode";
import axios, { AxiosError, AxiosResponse } from 'axios';
import { User } from '../models/User';
import { AuthenticateRequest } from '../models/AuthenticateRequest';

export class UserService {
  static isTokenValid(token: string): boolean {
    if (!token) return false;

    const decoded = jwtDecode(token);
    const expirationTime: number | undefined = decoded.exp ? decoded.exp * 1000 : undefined; // convert to milliseconds

    return expirationTime ? Date.now() < expirationTime : false;
  }

  static async authenticate(request: AuthenticateRequest): Promise<User | null> {
    try {
      const response: AxiosResponse<User> = await axios.post<User>('https://localhost:44352/Users/authenticate', request);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  static async getUserByToken(token: string): Promise<User | null> {
    try {
      if (!this.isTokenValid(token)) {
        // If token is not valid, remove it and return null
        window.localStorage.removeItem('jwt');
        return null;
      }
  
      const response: AxiosResponse<User> = await axios.get<User>('https://localhost:44352/Users/GetUserByToken', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
  
      if (axiosError.response && axiosError.response.status === 401) {
        // If unauthorized, remove token and return null
        window.localStorage.removeItem('jwt');
        return null;
      }
  
      return null;
    }
  }
  

  static checkAndRemoveExpiredToken(token: string | null): void {
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.exp) {
        const expirationDate = new Date(decoded.exp * 1000);
      }
      if (!this.isTokenValid(token)) {
        window.localStorage.removeItem('jwt');
      }
    }
  }
}

// Nasłuchiwanie na zdarzenie zmiany w localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'jwt') {
    UserService.checkAndRemoveExpiredToken(event.newValue);
  }
});

// Sprawdzanie i usuwanie wygasłego tokenu przy starcie aplikacji
UserService.checkAndRemoveExpiredToken(window.localStorage.getItem('jwt'));

import axios from 'axios';
import { RegisterRequest } from '../models/RegisterRequest';

/**
 * Serwis obsługujący rejestrację użytkownika.
 * @param registerRequest Obiekt żądania rejestracji.
 * @returns Obiekt odpowiedzi lub obiekt z komunikatem o nieudanej rejestracji.
 */
export const register = async (registerRequest: RegisterRequest) => {
  try {
    const response = await axios.post('https://localhost:44352/Users/register', registerRequest);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    return { message: 'Rejestracja nieudana' };
  }
};

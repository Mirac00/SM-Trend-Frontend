// src/components/common/Login.tsx
import React, { useState } from 'react';
import { User } from '../../models/User';
import { AuthenticateRequest } from '../../models/AuthenticateRequest';
import { UserService } from '../../services/UserService';
import { useAuth } from '../../components/common/AuthContext'; // Upewnij się, że ścieżka jest poprawna

interface LoginProps {
  closeModal: () => void;
}

const Login: React.FC<LoginProps> = ({ closeModal }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth(); // Używamy useAuth()

  const handleLogin = async () => {
    const request: AuthenticateRequest = {
      Username: username,
      Password: password,
    };

    try {
      const user: User | null = await UserService.authenticate(request);

      if (user && user.token) {
        setUser(user); // Aktualizujemy stan użytkownika i zapisujemy token w AuthProvider
        closeModal();
      } else {
        alert('Nieprawidłowy login lub hasło');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Wystąpił błąd podczas logowania');
    }
  };

  return (
    <div className="container">
      <form>
        <div className="mb-3">
          <label htmlFor="username" className="form-label text-black">Login</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label text-black">Hasło</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="button" className="btn btn-primary m-2" onClick={handleLogin}>Zaloguj</button>
      </form>
    </div>
  );
};

export default Login;

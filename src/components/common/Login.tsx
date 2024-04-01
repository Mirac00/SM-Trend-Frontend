// Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../models/User';
import { AuthenticateRequest } from '../../models/AuthenticateRequest';
import { UserService } from '../../services/UserService';

interface LoginProps {
  setUser: (user: User | null) => void;
  closeModal: () => void;
}

const Login: React.FC<LoginProps> = ({ setUser, closeModal }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const request: AuthenticateRequest = {
      Username: username,
      Password: password,
    };

    const user: User | null = await UserService.authenticate(request);

    if (user) {
      window.localStorage.setItem('jwt', user.token);
      setUser(user);
      closeModal();
      navigate('/');
    } else {
      alert('Nieprawidłowy login lub hasło');
    }
  };

  return (
    <div className="container">
      <form>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Login</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Hasło</label>
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

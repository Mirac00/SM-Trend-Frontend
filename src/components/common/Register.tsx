// Register.tsx
import React, { useState } from 'react';
import { RegisterRequest } from '../../models/RegisterRequest';
import { register } from '../../services/userRegisterService';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

interface RegisterProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

const Register: React.FC<RegisterProps> = ({ setIsModalOpen }) => {
  const [registerRequest, setRegisterRequest] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [agreed, setAgreed] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterRequest({
      ...registerRequest,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agreed) {
      setMessage('Musisz zaakceptować regulamin.');
      return;
    }
    try {
      console.log('Submitting registration request:', registerRequest); // Debugging
      const response = await register(registerRequest);
      console.log('Registration response:', response); // Debugging
      setMessage(response.message);
      // Opcjonalnie: przekierowanie po udanej rejestracji
      // navigate('/welcome');
    } catch (error) {
      console.error('Error during registration:', error);
      setMessage('Wystąpił błąd podczas rejestracji');
    }
  };

  const handleSeeAll = () => {
    setIsModalOpen(false); // Zamknij modal rejestracji
    navigate('/regulamin'); // Przekieruj na podstronę regulaminu
  };

  return (
    <div className="container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Imię</label>
          <input type="text" name="firstName" onChange={handleInputChange} className="form-control" required />
        </div>
        <div className="form-group">
          <label>Nazwisko</label>
          <input type="text" name="lastName" onChange={handleInputChange} className="form-control" required />
        </div>
        <div className="form-group">
          <label>Nazwa użytkownika</label>
          <input type="text" name="username" onChange={handleInputChange} className="form-control" required />
        </div>
        <div className="form-group">
          <label>Hasło</label>
          <input type="password" name="password" onChange={handleInputChange} className="form-control" required />
        </div>
        <div className="form-group form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="regulamin"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
          />
          <label className="form-check-label" htmlFor="regulamin">
            Akceptuję regulamin.{' '}
            <button type="button" className="btn btn-link p-0" onClick={handleSeeAll}>
              Zobacz cały
            </button>
          </label>
        </div>
        <button type="submit" className="btn btn-primary m-2">
          Zarejestruj
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../../models/User';
import { UserService } from '../../services/UserService';

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const jwt = window.localStorage.getItem('jwt');
      if (jwt) {
        const fetchedUser = await UserService.getUserByToken(jwt);
        setUser(fetchedUser);
      }
    };

    checkUser();

    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

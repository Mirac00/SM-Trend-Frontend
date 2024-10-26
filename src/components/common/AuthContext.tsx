import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../../models/User';
import { UserService } from '../../services/UserService';
import 'bootstrap/dist/css/bootstrap.min.css'; // Upewnij się, że Bootstrap CSS jest zaimportowany

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
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Funkcja do dekodowania tokenu JWT
  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const jwt = window.localStorage.getItem('jwt');
      if (jwt) {
        const decoded: any = decodeToken(jwt);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          // Token jest ważny
          const fetchedUser = await UserService.getUserByToken(jwt);
          setUser(fetchedUser);

          // Ustawiamy timer na wygaśnięcie tokenu
          const timeout = decoded.exp * 1000 - Date.now();
          if (logoutTimer) {
            clearTimeout(logoutTimer);
          }
          const timer = setTimeout(() => {
            window.localStorage.removeItem('jwt');
            setUser(null);
            setShowSessionExpired(true);
            window.dispatchEvent(new Event('storage')); // Powiadom inne zakładki
          }, timeout);
          setLogoutTimer(timer);
        } else {
          // Token wygasł lub jest nieprawidłowy
          window.localStorage.removeItem('jwt');
          setUser(null);
          setShowSessionExpired(true);
        }
      } else {
        setUser(null); // Brak tokenu
      }
    };

    checkUser();

    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [logoutTimer]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
      {showSessionExpired && (
        <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 2000 }}>
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            Twoja sesja wygasła. Zaloguj się ponownie.
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowSessionExpired(false)}></button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

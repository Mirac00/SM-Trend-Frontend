// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '../../models/User';
import { UserService } from '../../services/UserService';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const isRefreshingRef = useRef(false); // Ref zamiast useState dla flagi odświeżania

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

  const handleLogout = useCallback(() => {
    console.log('Session expired, logging out and showing alert');
    window.localStorage.removeItem('jwt');
    setUser(null);
    setShowSessionExpired(true);
    window.dispatchEvent(new Event('storage'));
  }, []);

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('Token is already being refreshed.');
      return;
    }

    isRefreshingRef.current = true;
    console.log('Attempting to refresh token');

    try {
      const newToken = await UserService.refreshToken();
      console.log('New token received:', newToken);
      if (newToken) {
        localStorage.setItem('jwt', newToken);
        window.dispatchEvent(new Event('storage'));

        const fetchedUser = await UserService.getUserByToken(newToken);
        setUser(fetchedUser);
        console.log('User fetched after refresh:', fetchedUser);

        const decoded: any = decodeToken(newToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          const timeout = decoded.exp * 1000 - Date.now();
          console.log('Setting new logout timer for:', timeout, 'ms');
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

          logoutTimerRef.current = setTimeout(() => handleLogout(), timeout);
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [handleLogout]);

  const checkUser = useCallback(async () => {
    const jwt = window.localStorage.getItem('jwt');
    console.log('Checking user with token:', jwt);
    if (jwt) {
      const decoded: any = decodeToken(jwt);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const fetchedUser = await UserService.getUserByToken(jwt);
        console.log('User fetched on initial check:', fetchedUser);
        setUser(fetchedUser);

        const timeout = decoded.exp * 1000 - Date.now();
        console.log('Setting logout timer for:', timeout, 'ms');
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        logoutTimerRef.current = setTimeout(() => handleLogout(), timeout);
      } else {
        handleLogout();
      }
    } else {
      setUser(null);
    }
  }, [handleLogout]);

  useEffect(() => {
    checkUser();

    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [checkUser]);

  useEffect(() => {
    if (!user) {
      // Jeśli użytkownik nie jest zalogowany, nie ustawiaj czujki
      return;
    }

    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      console.log('User activity detected');
      const jwt = window.localStorage.getItem('jwt');
      if (jwt) {
        const decoded: any = decodeToken(jwt);
        if (decoded) {
          const remainingTime = decoded.exp * 1000 - Date.now();
          console.log('Remaining time:', remainingTime, 'ms');

          // Aktywuj czujkę tylko jeśli token wygasa w ciągu 15 minut lub mniej
          if (remainingTime <= 15 * 60 * 1000 && remainingTime > 0) { // <= 15 minut
            console.log('Remaining time <= 15 minutes, attempting to refresh token');
            refreshToken();
          }
        }
      }
    };

    const debounceActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        handleActivity();
      }, 300);
    };

    window.addEventListener('mousemove', debounceActivity);
    window.addEventListener('click', debounceActivity);
    window.addEventListener('keydown', debounceActivity);

    console.log('Activity listeners added');

    return () => {
      window.removeEventListener('mousemove', debounceActivity);
      window.removeEventListener('click', debounceActivity);
      window.removeEventListener('keydown', debounceActivity);
      clearTimeout(activityTimeout);
      console.log('Activity listeners removed');
    };
  }, [refreshToken, user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
      {showSessionExpired && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1050,
            minWidth: '300px',
          }}
        >
          <strong>Sesja wygasła!</strong> Zaloguj się ponownie, aby kontynuować korzystanie z aplikacji.
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setShowSessionExpired(false)}
          ></button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

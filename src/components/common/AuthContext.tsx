// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '../../models/User';
import { UserService } from '../../services/UserService';
import 'bootstrap/dist/css/bootstrap.min.css';

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshToken: () => void;
  isWatcherActive: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  logout: () => {},
  refreshToken: () => {},
  isWatcherActive: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isWatcherActive, setIsWatcherActive] = useState(false);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

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

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser && newUser.token) {
      window.localStorage.setItem('jwt', newUser.token);
    } else {
      window.localStorage.removeItem('jwt');
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = useCallback(() => {
    console.log('Session expired, logging out and showing alert');
    handleSetUser(null);
    setIsWatcherActive(false); // Wyłącz czujkę przy wylogowaniu
  }, []);

  const logout = useCallback(() => {
    console.log('User logged out manually');
    handleSetUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('Token is already being refreshed.');
      return;
    }

    isRefreshingRef.current = true;
    setIsWatcherActive(false); // Wyłącz czujkę podczas odświeżania tokena
    console.log('Attempting to refresh token');

    try {
      const newToken = await UserService.refreshToken();
      if (newToken) {
        window.localStorage.setItem('jwt', newToken);
        const fetchedUser = await UserService.getUserByToken(newToken);
        if (fetchedUser) {
          fetchedUser.token = newToken;
          setUser(fetchedUser);

          const decoded: any = decodeToken(newToken);
          if (decoded && decoded.exp * 1000 > Date.now()) {
            const timeout = decoded.exp * 1000 - Date.now();
            console.log('Setting new logout timer for:', timeout, 'ms');
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

            logoutTimerRef.current = setTimeout(() => handleLogout(), timeout);

            if (timeout <= 15 * 60 * 1000) {
              console.log('Czujka ponownie aktywna po odświeżeniu tokena.');
              setIsWatcherActive(true);
            }
          }
        }
      } else {
        console.error('Token refresh failed. Logging out.');
        handleLogout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [handleLogout]);

  const checkRemainingTime = useCallback(() => {
    const token = user?.token;
    if (!token) return;

    const decoded: any = decodeToken(token);
    if (!decoded) return;

    const remainingTimeMs = decoded.exp * 1000 - Date.now();

    if (remainingTimeMs <= 0) {
      console.log('Session expired');
      handleLogout();
    } else {
      const hours = Math.floor(remainingTimeMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);

      console.log(`Pozostały czas sesji: ${hours}h ${minutes}m ${seconds}s`);

      if (remainingTimeMs <= 15 * 60 * 1000 && !isWatcherActive) {
        console.log('Czujka aktywna: Pozostało mniej niż 15 minut.');
        setIsWatcherActive(true);
      } else if (remainingTimeMs > 15 * 60 * 1000 && isWatcherActive) {
        console.log('Czujka wyłączona: Pozostało więcej niż 15 minut.');
        setIsWatcherActive(false);
      }
    }
  }, [user, isWatcherActive, handleLogout]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkRemainingTime();
    }, 10000); // Wyświetlanie co 10 sekund

    return () => clearInterval(intervalId);
  }, [checkRemainingTime]);

  useEffect(() => {
    const jwt = window.localStorage.getItem('jwt');
    console.log('Checking user with token:', jwt);
    if (jwt) {
      const decoded: any = decodeToken(jwt);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        UserService.getUserByToken(jwt).then((fetchedUser) => {
          if (fetchedUser) {
            fetchedUser.token = jwt;
            setUser(fetchedUser);

            const timeout = decoded.exp * 1000 - Date.now();
            console.log('Setting logout timer for:', timeout, 'ms');
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

            logoutTimerRef.current = setTimeout(() => handleLogout(), timeout);

            if (timeout <= 15 * 60 * 1000) {
              console.log('Czujka aktywna: Pozostało mniej niż 15 minut.');
              setIsWatcherActive(true);
            }
          } else {
            handleLogout();
          }
        });
      } else {
        handleLogout();
      }
    }
  }, [handleLogout]);

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, logout, refreshToken, isWatcherActive }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

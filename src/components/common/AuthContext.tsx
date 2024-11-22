// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User } from '../../models/User';
import { UserService } from '../../services/UserService';

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshToken: () => void;
  isWatcherActive: boolean; // Czy czujka powinna być aktywna
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  logout: () => {},
  refreshToken: () => {},
  isWatcherActive: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isWatcherActive, setIsWatcherActive] = useState(false); // Czujka aktywna w ostatnich 15 minutach
  const isRefreshingRef = useRef(false);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  };

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('Token is already being refreshed.');
      return;
    }

    isRefreshingRef.current = true;

    try {
      const newToken = await UserService.refreshToken();
      console.log('New token received:', newToken);

      if (newToken) {
        const fetchedUser = await UserService.getUserByToken(newToken);
        if (fetchedUser) {
          fetchedUser.token = newToken;
          setUser(fetchedUser);

          // Po odświeżeniu tokena aktualizujemy czujkę
          const decoded: any = decodeToken(newToken);
          if (decoded) {
            const remainingTimeMs = decoded.exp * 1000 - Date.now();
            console.log(`Pozostały czas sesji po odświeżeniu: ${Math.floor(remainingTimeMs / 1000)}s`);

            setIsWatcherActive(false); // Wyłącz czujkę po odświeżeniu tokena
            if (remainingTimeMs <= 15 * 60 * 1000) {
              console.log('Czujka pozostanie aktywna, bo nowy token ma mniej niż 15 minut ważności.');
              setIsWatcherActive(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const checkRemainingTime = useCallback(() => {
    const token = user?.token;
    if (!token) return;

    const decoded: any = decodeToken(token);
    if (!decoded) return;

    const remainingTimeMs = decoded.exp * 1000 - Date.now();

    if (remainingTimeMs <= 0) {
      console.log('Session expired');
      setUser(null);
    } else if (remainingTimeMs <= 15 * 60 * 1000 && !isWatcherActive) {
      console.log('Czujka aktywna: Pozostało 15 minut lub mniej do wygaśnięcia tokena.');
      setIsWatcherActive(true);
    } else if (remainingTimeMs > 15 * 60 * 1000 && isWatcherActive) {
      console.log('Czujka wyłączona: Pozostało więcej niż 15 minut do wygaśnięcia tokena.');
      setIsWatcherActive(false);
    }

    const hours = Math.floor(remainingTimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
    console.log(`Pozostały czas sesji: ${hours}h ${minutes}m ${seconds}s`);
  }, [user, isWatcherActive]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkRemainingTime();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [checkRemainingTime]);

  useEffect(() => {
    const token = window.localStorage.getItem('jwt');
    if (token) {
      const decoded: any = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        UserService.getUserByToken(token).then((fetchedUser) => {
          if (fetchedUser) {
            fetchedUser.token = token;
            setUser(fetchedUser);
          } else {
            setUser(null);
          }
        });
      } else {
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout: () => setUser(null),
        refreshToken,
        isWatcherActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

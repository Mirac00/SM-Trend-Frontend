// src/contexts/auth/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { User } from '../../models/User';
import { UserService } from '../../services/UserService';
import 'bootstrap/dist/css/bootstrap.min.css';

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const isRefreshingRef = useRef(false);
  const [tokenRefreshCheckFlag, setTokenRefreshCheckFlag] = useState(false);
  const activityListenersRef = useRef(false);
  const activityCleanupRef = useRef<() => void>(() => {});

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

  const formatTime = (milliseconds: number) => {
    let totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser && newUser.token) {
      window.localStorage.setItem('jwt', newUser.token);
    } else {
      window.localStorage.removeItem('jwt');
    }
    window.dispatchEvent(new Event('storage')); // Powiadomienie innych zakładek
  };

  const handleLogout = useCallback(() => {
    console.log('Session expired, logging out and showing alert');
    handleSetUser(null);
    setShowSessionExpired(true);
  }, []);

  const logout = useCallback(() => {
    console.log('User logged out manually');
    handleSetUser(null);
    // Nie pokazujemy alertu o wygaśnięciu sesji
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
        handleSetUser({ ...user!, token: newToken }); // Aktualizujemy użytkownika z nowym tokenem
        const fetchedUser = await UserService.getUserByToken(newToken);
        if (fetchedUser) {
          fetchedUser.token = newToken; // Ustaw nowy token
          setUser(fetchedUser);
          console.log('User fetched after refresh:', fetchedUser);

          const decoded: any = decodeToken(newToken);
          if (decoded && decoded.exp * 1000 > Date.now()) {
            const timeout = decoded.exp * 1000 - Date.now();
            console.log('Setting new logout timer for:', formatTime(timeout));
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

            logoutTimerRef.current = setTimeout(() => handleLogout(), timeout);
          }
        } else {
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [handleLogout, user]);

  const checkUser = useCallback(async () => {
    const jwt = window.localStorage.getItem('jwt');
    console.log('Checking user with token:', jwt);
    if (jwt) {
      const decoded: any = decodeToken(jwt);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const fetchedUser = await UserService.getUserByToken(jwt);
        console.log('User fetched on initial check:', fetchedUser);
        if (fetchedUser) {
          fetchedUser.token = jwt;
          setUser(fetchedUser);

          const timeout = decoded.exp * 1000 - Date.now();
          console.log('Setting logout timer for:', formatTime(timeout));
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

          logoutTimerRef.current = setTimeout(() => handleLogout(), timeout);
        } else {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } else {
      setUser(null);
    }
  }, [handleLogout]);

  const getRemainingTime = () => {
    if (!user || !user.token) {
      return 0;
    }
    const token = user.token;
    const decoded: any = decodeToken(token);
    if (!decoded) {
      return 0;
    }
    return decoded.exp * 1000 - Date.now();
  };

  useEffect(() => {
    checkUser();

    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [checkUser]);

  useEffect(() => {
    if (!user || !user.token) {
      // Remove activity listeners if any
      if (activityCleanupRef.current) {
        activityCleanupRef.current();
      }
      return;
    }

    const remainingTime = getRemainingTime();

    if (remainingTime <= 0) {
      handleLogout();
      return;
    }

    const fifteenMinutes = 15 * 60 * 1000;

    console.log('Remaining time:', formatTime(remainingTime));

    if (remainingTime <= fifteenMinutes) {
      // Remaining time is less than or equal to 15 minutes, add activity listeners if not already added
      if (!activityListenersRef.current) {
        setupActivityListeners();
      }
    } else {
      // Remaining time is more than 15 minutes, remove activity listeners if they were added
      if (activityListenersRef.current && activityCleanupRef.current) {
        activityCleanupRef.current();
      }

      // Schedule a timeout to re-run this effect when remaining time reaches 15 minutes
      const timeUntil15Minutes = remainingTime - fifteenMinutes;
      console.log(
        'Scheduling re-check in:',
        formatTime(timeUntil15Minutes)
      );

      const timerId = setTimeout(() => {
        // Force re-run of this effect
        setTokenRefreshCheckFlag((prev) => !prev);
      }, timeUntil15Minutes);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [user, tokenRefreshCheckFlag, handleLogout]);

  const setupActivityListeners = () => {
    activityListenersRef.current = true;

    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      console.log('User activity detected');
      const remainingTime = getRemainingTime();
      console.log('Remaining time:', formatTime(remainingTime));

      const fifteenMinutes = 15 * 60 * 1000;

      if (remainingTime <= fifteenMinutes && remainingTime > 0) {
        console.log(
          'Remaining time <= 15 minutes, attempting to refresh token'
        );
        refreshToken();
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

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('mousemove', debounceActivity);
      window.removeEventListener('click', debounceActivity);
      window.removeEventListener('keydown', debounceActivity);
      clearTimeout(activityTimeout);
      activityListenersRef.current = false;
      console.log('Activity listeners removed');
    };

    activityCleanupRef.current = cleanup;
  };

  useEffect(() => {
    return () => {
      // On unmount or user change, remove activity listeners if they were added
      if (activityCleanupRef.current) {
        activityCleanupRef.current();
      }
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, logout }}>
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

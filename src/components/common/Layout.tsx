// Layout.tsx
import React, { useEffect } from 'react';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style/layoutStyle.css';
import Slider from './slider';
import Footer from './Footer';
import { useAuth } from './AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isWatcherActive, refreshToken } = useAuth(); // Pobieramy informacje o czujce i funkcji odświeżania

  useEffect(() => {
    if (!isWatcherActive) return; // Czujka działa tylko w ostatnich 15 minutach

    const handleActivity = () => {
      console.log('Interaction detected in Layout');
      refreshToken(); // Odśwież token po interakcji
    };

    console.log('Czujka aktywna: Nasłuchiwanie interakcji w Layout');
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      console.log('Czujka wyłączona: Usuwanie nasłuchów w Layout');
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isWatcherActive, refreshToken]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: '#f5f5f5' }}>
        <Navbar />
      </header>
      <main>
        <Slider />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

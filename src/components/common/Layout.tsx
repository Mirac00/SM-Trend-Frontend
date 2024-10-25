// Layout.tsx
import React from 'react';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style/layoutStyle.css';
import Slider from './slider';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: '#f5f5f5' }}>
        <Navbar /> {/* Nie przekazujemy już propsów */}
      </header>
      <main>
        <Slider />
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

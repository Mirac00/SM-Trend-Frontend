// layout.tsx
import React, { useState } from 'react';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style/layoutStyle.css';
import Slider from './slider';
import { User } from '../../models/User';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: '#f5f5f5' }}>
        <Navbar user={user} setUser={setUser} />
      </header>
      <main>
        <Slider />
        {children}
      </main>
      <footer style={{ background: '#f5f5f5', padding: '10px 0' }}>
        <p style={{ margin: '0', padding: '0 20px' }}>Stopka</p>
      </footer>
    </div>
  );
}

export default Layout;

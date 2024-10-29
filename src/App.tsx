// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './components/routes/home';
import TopTrend from './components/routes/TopTrend';
import Contact from './components/routes/contact';
import MyProfile from './components/routes/MyProfile';
import Regulamin from './components/routes/Regulamin'; // Import nowej podstrony
import { AuthProvider } from '../src/components/common/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/TopTrend" element={<TopTrend />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/regulamin" element={<Regulamin />} /> {/* Dodaj trasę regulaminu */}
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;

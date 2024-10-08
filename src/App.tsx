import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './components/routes/home';
import TopTrend from './components/routes/TopTrend';
import Contact from './components/routes/contact';
import MyProfile from './components/routes/MyProfile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/TopTrend" element={<TopTrend />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/my-profile" element={<MyProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}
 
export default App;

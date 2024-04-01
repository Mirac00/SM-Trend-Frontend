import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './components/routes/home';
import ActiveEvents from './components/routes/activeEvents';
import Contact from './components/routes/contact';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activeEvents" element={<ActiveEvents />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

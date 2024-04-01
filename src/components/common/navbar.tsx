import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../../style/navbarStyle.css';
import { User } from '../../models/User';
import Modal from 'react-modal';
import Login from './Login';
import Register from './Register';
import { UserService } from '../../services/UserService';

interface NavbarProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const jwt = window.localStorage.getItem('jwt');
      if (jwt) {
        const user: User | null = await UserService.getUserByToken(jwt);
        setUser(user);
      }
      setIsLoading(false);
    };
    checkUser();
  }, [setUser]);

  useEffect(() => {
    const checkScroll = () => {
      const navbar = document.querySelector('.sticky-top');
      const navbarText = document.querySelectorAll('.navbar-text');
      const buttonIcon = document.querySelector('.navbar-toggler-icon');
      const button = document.querySelector('.navbar-toggler');

      const isMobile = window.innerWidth <= 768;

      if ((isMenuOpen && !isMobile) || window.pageYOffset > 0 || (window.pageYOffset === 0 && (isMenuOpen || isMobile))) {
        navbar?.classList.add('scrolled');
        navbarText.forEach(element => element.classList.add('text-scrolled'));
        buttonIcon?.classList.add('icon-scrolled');
        button?.classList.add('button-scrolled');
      } else {
        navbar?.classList.remove('scrolled');
        navbarText.forEach(element => element.classList.remove('text-scrolled'));
        buttonIcon?.classList.remove('icon-scrolled');
        button?.classList.remove('button-scrolled');
      }
    };

    window.addEventListener('scroll', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    window.localStorage.removeItem('jwt');
    setUser(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleMenuToggle = () => {
    const navbar = document.querySelector('.sticky-top');
    const navbarText = document.querySelectorAll('.navbar-text');
    const buttonIcon = document.querySelector('.navbar-toggler-icon');
    const button = document.querySelector('.navbar-toggler');

    if (window.pageYOffset === 0) {
      navbar?.classList.toggle('scrolled');
      navbarText.forEach(element => element.classList.toggle('text-scrolled'));
      buttonIcon?.classList.toggle('icon-scrolled');
      button?.classList.toggle('button-scrolled');
    }

    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className={`navbar navbar-expand-lg navbar-light sticky-top${isMenuOpen ? ' scrolled' : ''}`}>
      <div className="container">
        <Link className={`navbar-text${isMenuOpen ? ' text-scrolled' : ''}`} to="/">
          SM Trend
        </Link>
        <div className="d-flex order-lg-2">
          {user ? (
            <>
              <span className="d-flex align-items-center fs-5 me-3">Witaj: {user.username}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setModalContent('login');
                }}
                className="btn btn-primary me-2"
              >
                Zaloguj
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setModalContent('register');
                }}
                className="btn btn-secondary"
              >
                Zarejestruj
              </button>
            </>
          )}
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={handleMenuToggle}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse${isMenuOpen ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav">
            <li>
              <Link to="/" className={`nav-link${isMenuOpen ? ' text-scrolled' : ''} nav-text navbar-text${isMenuOpen ? ' text-scrolled' : ''}`}>
                Strona główna
              </Link>
            </li>
            <li>
              <Link to="/activeEvents" className={`nav-link${isMenuOpen ? ' text-scrolled' : ''} navbar-text${isMenuOpen ? ' text-scrolled' : ''}`}>
                Top Trend
              </Link>
            </li>
            <li>
              <Link to="/contact" className={`nav-link${isMenuOpen ? ' text-scrolled' : ''} navbar-text${isMenuOpen ? ' text-scrolled' : ''}`}>
                Kontakt
              </Link>
            </li>
          </ul>
        </div>
        
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="modal-dialog-centered"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <button
              type="button"
              className="btn-close m-2"
              aria-label="Close"
              onClick={closeModal}
            ></button>
            {modalContent === 'login' ? (
              <Login setUser={setUser} closeModal={closeModal} />
            ) : (
              <Register setIsModalOpen={setIsModalOpen} />
            )}
          </div>
        </Modal>
      </div>
    </nav>
  );
};

export default Navbar;

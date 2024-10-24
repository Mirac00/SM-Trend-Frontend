import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Dodany stan
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const jwt = window.localStorage.getItem('jwt');
      if (!jwt) {
        setUser(null);
        setIsSessionExpired(true);
      } else {
        const user: User | null = await UserService.getUserByToken(jwt);
        setUser(user);
      }
      setIsLoading(false);
    };

    checkUser();

    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, [setUser]);

  useEffect(() => {
    const checkScroll = () => {
      if (window.pageYOffset > 0 || isMenuOpen) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Początkowe sprawdzenie po zamontowaniu komponentu

    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    window.localStorage.removeItem('jwt');
    setUser(null);
    setIsSessionExpired(false);
    window.dispatchEvent(new Event('storage'));
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className={`navbar navbar-expand-lg navbar-light sticky-top${isScrolled || isMenuOpen ? ' scrolled' : ''}`}>
      <div className="container">
        <Link className={`navbar-text${isScrolled ? ' text-scrolled' : ''}`} to="/">
          SM Trend
        </Link>
        <div className="d-flex order-lg-2 text-white ">
          {user ? (
            <>
              <span className={`d-flex align-items-center fs-5 me-3 navbar-text${isScrolled ? ' text-scrolled' : ''}`}>Witaj: {user.username}</span>
              <button className={`btn-user navbar-btn ${isScrolled ? 'btn-scrolled' : ''}`} onClick={handleLogout}>
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
                className={`btn-user navbar-btn ${isScrolled ? 'btn-scrolled' : ''}`}
              >
                Zaloguj
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setModalContent('register');
                }}
                className={`btn-user navbar-btn ${isScrolled ? 'btn-scrolled' : ''}`}
              >
                Zarejestruj
              </button>
            </>
          )}
        </div>
        <button
          className={`navbar-toggler${isScrolled ? ' button-scrolled' : ''}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen ? 'true' : 'false'}
          aria-label="Toggle navigation"
          onClick={handleMenuToggle}
        >
          <span className={`navbar-toggler-icon${isScrolled ? ' icon-scrolled' : ''}`}></span>
        </button>
        <div className={`collapse navbar-collapse${isMenuOpen ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav">
            <li>
              <Link to="/" className={`nav-link nav-text navbar-text${isScrolled ? ' text-scrolled' : ''}`}>
                <p className='text-center mb-0 btn-text'>Strona główna</p>
              </Link>
            </li>
            <li>
              <Link to="/TopTrend" className={`nav-link nav-text navbar-text${isScrolled ? ' text-scrolled' : ''}`}>
                <p className='text-center mb-0 btn-text'>Top Trend</p>
              </Link>
            </li>
            <li>
              {user && (
                <Link to="/my-profile" className={`nav-link nav-text navbar-text${isScrolled ? ' text-scrolled' : ''}`}>
                  <p className='text-center mb-0 btn-text'>Mój Profil</p>
                </Link>
              )}
            </li>
            <li>
              <Link to="/Contact" className={`nav-link nav-text navbar-text${isScrolled ? ' text-scrolled' : ''}`}>
                <p className='text-center mb-0 btn-text'>Kontakt</p>
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
        {isSessionExpired && (
          <div className="popup bg-white p-3 border border-dark rounded text-center mx-auto popup-sesion-over">
            <div className="popup-inner">
              <p>Twoja sesja wygasła. Zaloguj się ponownie.</p>
              <button onClick={() => setIsSessionExpired(false)} className="close-popup">&#10006;</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

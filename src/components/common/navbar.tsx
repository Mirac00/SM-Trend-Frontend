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
  const [isSessionExpired, setIsSessionExpired] = useState(false);

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
      const navbar = document.querySelector('.sticky-top');
      const navbarText = document.querySelectorAll('.navbar-text');
      const navbarBtn = document.querySelectorAll('.navbar-btn');
      const buttonIcon = document.querySelector('.navbar-toggler-icon');
      const button = document.querySelector('.navbar-toggler');


      if ((isMenuOpen) || window.pageYOffset > 0 || (window.pageYOffset === 0 && (isMenuOpen))) {
        navbar?.classList.add('scrolled');
        navbarText.forEach(element => element.classList.add('text-scrolled'));
        navbarBtn.forEach(element => element.classList.add('btn-scrolled'));
        buttonIcon?.classList.add('icon-scrolled');
        button?.classList.add('button-scrolled');
      } else {
        navbar?.classList.remove('scrolled');
        navbarText.forEach(element => element.classList.remove('text-scrolled'));
        navbarBtn.forEach(element => element.classList.remove('btn-scrolled'));
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
    setIsSessionExpired(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleMenuToggle = () => {
    const navbar = document.querySelector('.sticky-top');
    const navbarText = document.querySelectorAll('.navbar-text');
    const navbarBtn = document.querySelectorAll('.navbar-btn');
    const buttonIcon = document.querySelector('.navbar-toggler-icon');
    const button = document.querySelector('.navbar-toggler');

    if (window.pageYOffset === 0) {
      navbar?.classList.toggle('scrolled');
      navbarText.forEach(element => element.classList.toggle('text-scrolled'));
      navbarBtn.forEach(element => element.classList.toggle('btn-scrolled'));
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
        <div className="d-flex order-lg-2 text-white ">
          {user ? (
            <>
              <span className="d-flex align-items-center fs-5 me-3">Witaj: {user.username}</span>
              <button className={`btn-user navbar-btn ${isMenuOpen ? 'btn-scrolled' : ''}`} onClick={handleLogout}>
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
                className={`btn-user navbar-btn ${isMenuOpen ? 'btn-scrolled' : ''}`}
              >
                Zaloguj
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setModalContent('register');
                }}
                className={`btn-user navbar-btn ${isMenuOpen ? 'btn-scrolled' : ''}`}
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
              <p className='text-center mb-0 btn-text'>Strona główna</p>
              </Link>
            </li>
            <li>
              <Link to="/activeEvents" className={`nav-link${isMenuOpen ? ' text-scrolled' : ''} navbar-text${isMenuOpen ? ' text-scrolled' : ''}`}>
              <p className='text-center mb-0 btn-text'>Top Trend</p>
              </Link>
            </li>
            <li>
              <Link to="/contact" className={`nav-link${isMenuOpen ? ' text-scrolled' : ''} navbar-text${isMenuOpen ? ' text-scrolled' : ''}`}>
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
            <div className="popup-inner ">
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

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style/AnimatedBnaerStyle.css';
import Register from './Register';
import { Modal } from 'react-bootstrap';

const AnimatedBanner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="container-fluid banner d-flex align-items-center justify-content-center position-relative rounded">
      <div className="content text-center">
        <h1 className="display-4 text-white">Dołącz do naszej społeczności!</h1>
        <p className="lead text-white">Podziel się materiałami trendującymi w social media i bądź na bieżąco!</p>
        <button className="btn btn-warning mt-3" onClick={() => setIsModalOpen(true)}>Załóż konto teraz</button>
      </div>
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className="bubble position-absolute animate-bubble"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
        />
      ))}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rejestracja</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Register setIsModalOpen={setIsModalOpen} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AnimatedBanner;
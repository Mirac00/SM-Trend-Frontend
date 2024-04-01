import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ContactForm from '../common/ContactForm';

/**
 * Komponent reprezentujący stronę kontaktową.
 * Umożliwia wysyłanie zapytań do serwisu.
 */
function Contact() {
  return (
    <div className="container mt-3">
      <div className="grid">
        <div className="row">
          <div className="col rounded bg-white">
            <h2 className="m-3">Tutaj możesz wysłać zapytanie do serwisu</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;

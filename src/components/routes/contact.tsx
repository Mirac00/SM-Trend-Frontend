import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ContactForm from '../common/ContactForm';


/**
 * Komponent reprezentujący stronę kontaktową.
 * Umożliwia wysyłanie zapytań do serwisu.
 */
function Contact() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 rounded bg-light p-4 shadow">
          <h2 className="mb-4 text-success">Tutaj możesz wysłać zapytanie do serwisu</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

export default Contact;

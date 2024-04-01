import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ContactForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Tu w przyszłości logika wysyłania wiadomości
    console.log({ email, name, message });
  };

  return (
    <div className="card p-3 ">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Imię i nazwisko</label>
          <input type="text" className="form-control" id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Treść</label>
          <textarea className="form-control" id="message" value={message} onChange={e => setMessage(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Wyślij</button>
      </form>
    </div>
  );
};

export default ContactForm;

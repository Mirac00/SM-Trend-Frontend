// Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#333', color: '#fff', padding: '20px 0', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <p style={{ margin: '10px 0' }}>
          Ta aplikacja to profesjonalne narzędzie do publikowania i pobierania materiałów do mediów społecznościowych. 
          Projekt realizowany jest w ramach studiów jako profesjonalna aplikacja webowa.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

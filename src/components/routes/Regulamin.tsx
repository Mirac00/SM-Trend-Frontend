// src/components/routes/Regulamin.tsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Regulamin: React.FC = () => {
  return (
    <div className="container mt-5 text-white">
      <h2>Regulamin</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel mauris quam. Nullam scelerisque
        neque at libero viverra, a hendrerit dui interdum. Integer a urna nec lorem tincidunt dictum.
      </p>
      <p>
        Fusce sit amet quam vitae urna pretium malesuada. Suspendisse potenti. Phasellus at dui at tortor
        dignissim varius. Vivamus vitae velit nec nulla tempor tincidunt.
      </p>
      {/* Dodaj więcej treści regulaminu w miarę potrzeb */}
    </div>
  );
};

export default Regulamin;

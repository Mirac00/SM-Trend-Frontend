import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import '../../style/sliderStyle.css';
import Image1 from '../../images/img1.png';
import Image2 from '../../images/2eko.jpg';
import Image3 from '../../images/3eko.jpg';
import Image4 from '../../images/4eko.jpg';
import Image5 from '../../images/5eko.png';

const images = [Image1, Image2, Image3, Image4, Image5];

const Slider: React.FC = () => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  return (
<div className='carousel-bg'>
  <Carousel activeIndex={index} onSelect={handleSelect} interval={5000} indicators={true} controls={true} >
    {images.map((image, i) => (
      <Carousel.Item key={i} >
        <div className="slider-img">
          <img
            src={image}
            alt={`Slide ${i}`}
            className="centered-img"
          />
        </div>
      </Carousel.Item>
    ))}
  </Carousel>
</div>

  );
};

export default Slider;

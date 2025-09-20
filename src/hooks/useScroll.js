import { useState, useEffect } from 'react';

export const useScroll = () => {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = () => {
    // If window.scrollY is more than 10, set scrolled to true, otherwise false
    setScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    // Add event listener when component mounts
    window.addEventListener('scroll', handleScroll);
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs only once

  return scrolled;
};
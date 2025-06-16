import React, { useEffect, useRef } from 'react';

const VantaBackground = () => {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);
  
  useEffect(() => {
    // Dynamic script loading function
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };
    
    // Load scripts and initialize effect
    const initVanta = async () => {
      try {
        // Check if Three.js is already loaded
        if (!window.THREE) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js');
        }
        
        // Check if VANTA is already loaded
        if (!window.VANTA) {
          await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js');
        }
        
        // Initialize the effect if not already initialized
        if (window.VANTA && !effectRef.current) {
          // Target the entire home-container
          const targetElement = document.querySelector('.home-container');
          
          if (targetElement) {
            effectRef.current = window.VANTA.FOG({
              el: targetElement,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              highlightColor: 0x4A6CF7, // Blue from the site branding
              midtoneColor: 0x9013FE,   // Purple from the gradient
              baseColor: 0x121212,      // Dark background color
              blurFactor: 0.6,          // Slightly blurred fog
              speed: 1.5,               // Slightly faster movement
              zoom: 0.3                 // Slightly zoomed out
            });
          }
        }
      } catch (error) {
        console.error('Failed to load scripts or initialize Vanta effect:', error);
      }
    };
    
    // Initialize after a short delay to ensure DOM is fully loaded
    const timer = setTimeout(initVanta, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);
  
  return null; // No need to render anything as we're targeting an existing element
};

export default VantaBackground; 
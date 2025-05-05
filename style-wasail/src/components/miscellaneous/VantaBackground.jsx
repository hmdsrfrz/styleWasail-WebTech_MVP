// src/components/VantaBackground.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import FOG from "vanta/dist/vanta.fog.min";

export default function VantaBackground() {
  const vantaRef = useRef(null);

  useEffect(() => {
    let vantaEffect;
    let resizeTimeout;

    const initVanta = () => {
      if (!vantaRef.current) return;

      vantaEffect = FOG({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        highlightColor: 0xe885d7,
        midtoneColor: 0xffc9c9,
        lowlightColor: 0xff0096,
        baseColor: 0xffeeee
      });

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (vantaEffect) {
            vantaEffect.resize();
            vantaRef.current.style.width = window.innerWidth + 'px';
            vantaRef.current.style.height = window.innerHeight + 'px';
          }
        }, 100);
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    };

    const initTimeout = setTimeout(initVanta, 150);

    return () => {
      clearTimeout(initTimeout);
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 0xff0096, // Fallback dark pink
        zIndex: -1,
        overflow: 'hidden'
      }}
    />
  );
}

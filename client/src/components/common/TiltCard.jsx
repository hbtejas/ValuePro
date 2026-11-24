import { useState } from 'react';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function TiltCard({ children, className = '', intensity = 8 }) {
  const [tilt, setTilt] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    transitionDuration: '450ms',
  });

  const handleMove = (e) => {
    if (reducedMotion()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      transform: `perspective(1000px) rotateX(${(-y * intensity).toFixed(2)}deg) rotateY(${(x * intensity).toFixed(2)}deg) translateY(-2px)`,
      transitionDuration: '80ms',
    });
  };

  const handleLeave = () => {
    setTilt({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transitionDuration: '450ms',
    });
  };

  return (
    <div
      className={`tilt-surface ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={tilt}
    >
      {children}
    </div>
  );
}

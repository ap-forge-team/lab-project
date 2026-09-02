import { useRef, useState } from 'react';

export default function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 8; // max 8deg
    const rotateX = ((centerY - y) / centerY) * 6; // max 6deg
    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`
    );
    setGlowPos({ x, y });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)');
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`relative cursor-pointer h-full ${className}`}
      style={{
        transform: transform || 'perspective(1000px)',
        transition: isHovered
          ? 'transform .1s ease, box-shadow .1s ease'
          : 'transform .4s ease, box-shadow .4s ease',
        willChange: 'transform',
        boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.1)' : 'none',
      }}
      onMouseMove={(e) => { setIsHovered(true); handleMouseMove(e); }}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight glow overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay rounded-[inherit]"
          style={{
            background: `radial-gradient(400px circle at ${glowPos.x}px ${glowPos.y}px, rgba(37,99,235,0.15) 0%, transparent 80%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

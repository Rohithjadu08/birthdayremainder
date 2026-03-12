'use client';

import { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#D689B9', '#9D38DB', '#FAE9F5', '#fdd835', '#4caf50'];
const CONFETTI_COUNT = 100;

export default function Confetti() {
  const [pieces, setPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: CONFETTI_COUNT }).map((_, index) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        animationDelay: `${Math.random() * 5}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      };
      return <i key={index} style={style} className="confetti-piece" />;
    });
    setPieces(newPieces);
  }, []);

  return (
    <div aria-hidden="true" className="confetti-container">
      {pieces}
      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 20;
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 16px;
          opacity: 0;
          animation: fall 5s linear infinite;
        }
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import Moveable from 'react-moveable';

export default function GameBoard({ level, onBackToMenu }) {
  const [score, setScore] = useState(0);
  

  const vipRef = useRef(null);
  const moveableRef = useRef(null);

  const activeCollisions = useRef(new Set());

  // ─── MAPA DE NIVELES
  const levelMaps = {
    1: [
      { id: 1, top: '150px', left: '200px', width: '100px', height: '100px' },
      { id: 2, top: '400px', left: '500px', width: '100px', height: '100px' },
    ],
    2: [
      { id: 1, top: '100px', left: '300px', width: '300px', height: '50px' },
      { id: 2, top: '300px', left: '100px', width: '50px', height: '250px' },
      { id: 3, top: '450px', left: '500px', width: '150px', height: '150px' },
    ],
    3: [
      { id: 1, top: '100px', left: '150px', width: '80px', height: '80px' },
      { id: 2, top: '100px', left: '450px', width: '80px', height: '80px' },
      { id: 3, top: '300px', left: '300px', width: '120px', height: '120px' },
      { id: 4, top: '500px', left: '150px', width: '80px', height: '80px' },
      { id: 5, top: '500px', left: '450px', width: '80px', height: '80px' },
    ],
  };

  const currentObstacles = levelMaps[level] || levelMaps[1];

  // ─── DETECCIÓN DE COLISIONES ───────────────────────────────────────────────
  // Se llama en cada evento onDrag
  const checkCollisions = useCallback(() => {
    if (!vipRef.current) return;

    const vipRect = vipRef.current.getBoundingClientRect();
    const obstacles = document.querySelectorAll('.obstacle');

    obstacles.forEach((obs, index) => {
      const obsRect = obs.getBoundingClientRect();


      const isOverlapping =
        vipRect.left   < obsRect.right  &&
        vipRect.right  > obsRect.left   &&
        vipRect.top    < obsRect.bottom &&
        vipRect.bottom > obsRect.top;

      if (isOverlapping) {
        if (!activeCollisions.current.has(index)) {
          activeCollisions.current.add(index);
          setScore((prev) => prev + 1);   
          obs.classList.add('obstacle-hit');

          setTimeout(() => obs.classList.remove('obstacle-hit'), 400);
        }
      } else {
        activeCollisions.current.delete(index);
      }
    });
  }, []);

  return (
    <div className="game-board">
      <button className="back-btn" onClick={onBackToMenu}>Volver al Menú</button>

      {/* 
        PUNTO DE INTEGRACIÓN PARA LA PERSONA 3:
        Cambia este div por su componente <Scoreboard score={score} /> 
        cuando lo tenga listo. El prop `score` ya está disponible.
      */}
      <div className="scoreboard">
        <h2>Nivel {level} &nbsp;|&nbsp; Colisiones: {score}</h2>
      </div>

      <div ref={vipRef} className="vip-box" id="vip">
        <svg
          className="vip-character"
          viewBox="0 0 60 70"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cabeza */}
          <circle cx="30" cy="14" r="11" fill="#FDBCB4" />

          {/* Cabello */}
          <path d="M19 14 Q19 5 30 5 Q41 5 41 14" fill="#2c1a0e" />

          {/* Lentes de sol */}
          <rect x="19" y="12" width="9" height="5" rx="2.5" fill="#0f172a" opacity="0.9"/>
          <rect x="32" y="12" width="9" height="5" rx="2.5" fill="#0f172a" opacity="0.9"/>
          <line x1="28" y1="14" x2="32" y2="14" stroke="#0f172a" strokeWidth="1.5"/>

          {/* Cuerpo – traje negro */}
          <rect x="16" y="28" width="28" height="30" rx="6" fill="#1a1a2e" />

          {/* Corbata / pechera blanca */}
          <polygon points="30,29 26,33 30,52 34,33" fill="#f8fafc" />
          <rect x="27" y="27" width="6" height="4" rx="1" fill="#f8fafc" />

          {/* Solapa izquierda */}
          <polygon points="30,29 16,28 20,40" fill="#16213e" />
          {/* Solapa derecha */}
          <polygon points="30,29 44,28 40,40" fill="#16213e" />

          {/* Brazos */}
          <rect x="5"  y="28" width="11" height="22" rx="5" fill="#1a1a2e" />
          <rect x="44" y="28" width="11" height="22" rx="5" fill="#1a1a2e" />

          {/* Manos */}
          <circle cx="10" cy="51" r="5" fill="#FDBCB4" />
          <circle cx="50" cy="51" r="5" fill="#FDBCB4" />

          {/* Pin VIP en solapa */}
          <circle cx="23" cy="35" r="3" fill="#f1c40f" />
          <text x="23" y="37" textAnchor="middle" fontSize="3" fill="#451a03" fontWeight="bold">V</text>
        </svg>

        <span className="vip-label">VIP</span>
      </div>

      <Moveable
        ref={moveableRef}
        target={vipRef}
        draggable={true}
        bounds={{ left: 0, top: 0, right: 0, bottom: 0 }}
        onDrag={(e) => {
          e.target.style.transform = e.transform;
          checkCollisions();
        }}
      />
      {currentObstacles.map((obs) => (
        <div
          key={obs.id}
          className="obstacle"
          style={{
            top: obs.top,
            left: obs.left,
            width: obs.width,
            height: obs.height,
          }}
        >
          <span className="obstacle-icon">⚠️</span>
        </div>
      ))}
    </div>
  );
}
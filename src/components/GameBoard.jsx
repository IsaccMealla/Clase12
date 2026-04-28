import { useState, useRef, useCallback } from 'react';
import Moveable from 'react-moveable';

export default function GameBoard({ level, onBackToMenu }) {
  const [score, setScore] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false); 
  
  const vipRef = useRef(null);
  const moveableRef = useRef(null);
  const activeCollisions = useRef(new Set());

  const levelMaps = {
    1: {
      obstacles: [
        { id: 1, top: '150px', left: '200px', width: '100px', height: '100px' },
        { id: 2, top: '400px', left: '500px', width: '100px', height: '100px' },
      ],
      start: { top: '50px', left: '50px' },          
      goal:  { top: '520px', left: '650px' },        
    },
    2: {
      obstacles: [
        { id: 1, top: '100px', left: '300px', width: '300px', height: '50px' },
        { id: 2, top: '300px', left: '100px', width: '50px',  height: '250px' },
        { id: 3, top: '450px', left: '500px', width: '150px', height: '150px' },
      ],
      start: { top: '50px', left: '50px' },
      goal:  { top: '520px', left: '650px' },
    },
    3: {
      obstacles: [
        { id: 1, top: '100px', left: '150px', width: '80px',  height: '80px' },
        { id: 2, top: '100px', left: '450px', width: '80px',  height: '80px' },
        { id: 3, top: '300px', left: '300px', width: '120px', height: '120px' },
        { id: 4, top: '500px', left: '150px', width: '80px',  height: '80px' },
        { id: 5, top: '500px', left: '450px', width: '80px',  height: '80px' },
      ],
      start: { top: '50px', left: '50px' },
      goal:  { top: '50px', left: '650px' },
    },
  };

  const currentMap = levelMaps[level] || levelMaps[1];

  // ─── DETECCIÓN DE COLISIÓN CON OBSTÁCULOS ────────────────────────────────
  const checkCollisions = useCallback(() => {
    if (!vipRef.current) return;
    const vipRect = vipRef.current.getBoundingClientRect();

    // Obstáculos
    document.querySelectorAll('.obstacle').forEach((obs, index) => {
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

    // ─── DETECCIÓN CON EL PUNTO B ─────────────────────────────────────────
    const goalEl = document.getElementById('goal-point');
    if (goalEl) {
      const goalRect = goalEl.getBoundingClientRect();
      const reachedGoal =
        vipRect.left   < goalRect.right  &&
        vipRect.right  > goalRect.left   &&
        vipRect.top    < goalRect.bottom &&
        vipRect.bottom > goalRect.top;

      if (reachedGoal) {
        setLevelComplete(true);
      }
    }
  }, []);

  // ─── PANTALLA DE VICTORIA
  if (levelComplete) {
    return (
      <div className="victory-screen">
        <div className="victory-card">
          <div className="victory-icon">🛡️</div>
          <h1 className="victory-title">¡Misión Cumplida!</h1>
          <p className="victory-level">Nivel {level} completado</p>
          <p className="victory-score">
            Colisiones sufridas: <span>{score}</span>
          </p>

          <div className="victory-buttons">
            {/* Si hay siguiente nivel, ofrecer continuar */}
            {level < 3 && (
              <button
                className="victory-btn primary"
                onClick={() => {
                  setLevelComplete(false);
                  setScore(0);
                  activeCollisions.current.clear();
                  // Reinicia la posición del VIP
                  if (vipRef.current) {
                    vipRef.current.style.transform = 'translate(0px, 0px)';
                  }
                  // Le decimos al padre que suba al siguiente nivel
                  onBackToMenu(); // 👈 La Persona 3 puede cambiar esto por onNextLevel(level + 1)
                }}
              >
                Siguiente Nivel →
              </button>
            )}
            <button className="victory-btn secondary" onClick={onBackToMenu}>
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER NORMAL ────────────────────────────────────────────────────────
  return (
    <div className="game-board">
      <button className="back-btn" onClick={onBackToMenu}>Volver al Menú</button>

      <div className="scoreboard">
        <h2>Nivel {level} &nbsp;|&nbsp; Colisiones: {score}</h2>
      </div>

      {/* PUNTO A — Indicador visual de origen  */}
      <div
        className="point-marker point-a"
        style={{ top: currentMap.start.top, left: currentMap.start.left }}
      >
        <span>A</span>
      </div>

      {/* PUNTO B — Meta del nivel */}
      <div
        id="goal-point"
        className="point-marker point-b"
        style={{ top: currentMap.goal.top, left: currentMap.goal.left }}
      >
        <div className="goal-pulse" />
        <span>B</span>
      </div>

      {/* VIP */}
      <div
        ref={vipRef}
        className="vip-box"
        id="vip"
        style={{ top: currentMap.start.top, left: currentMap.start.left }}
      >
        <svg className="vip-character" viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="14" r="11" fill="#FDBCB4" />
          <path d="M19 14 Q19 5 30 5 Q41 5 41 14" fill="#2c1a0e" />
          <rect x="19" y="12" width="9" height="5" rx="2.5" fill="#0f172a" opacity="0.9"/>
          <rect x="32" y="12" width="9" height="5" rx="2.5" fill="#0f172a" opacity="0.9"/>
          <line x1="28" y1="14" x2="32" y2="14" stroke="#0f172a" strokeWidth="1.5"/>
          <rect x="16" y="28" width="28" height="30" rx="6" fill="#1a1a2e" />
          <polygon points="30,29 26,33 30,52 34,33" fill="#f8fafc" />
          <rect x="27" y="27" width="6" height="4" rx="1" fill="#f8fafc" />
          <polygon points="30,29 16,28 20,40" fill="#16213e" />
          <polygon points="30,29 44,28 40,40" fill="#16213e" />
          <rect x="5"  y="28" width="11" height="22" rx="5" fill="#1a1a2e" />
          <rect x="44" y="28" width="11" height="22" rx="5" fill="#1a1a2e" />
          <circle cx="10" cy="51" r="5" fill="#FDBCB4" />
          <circle cx="50" cy="51" r="5" fill="#FDBCB4" />
          <circle cx="23" cy="35" r="3" fill="#f1c40f" />
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

      {currentMap.obstacles.map((obs) => (
        <div
          key={obs.id}
          className="obstacle"
          style={{ top: obs.top, left: obs.left, width: obs.width, height: obs.height }}
        >
          <span className="obstacle-icon">⚠️</span>
        </div>
      ))}
    </div>
  );
}
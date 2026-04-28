import Moveable from 'react-moveable';
import { useState, useRef, useCallback, useEffect } from 'react';
import Timer from './Timer';

export default function GameBoard({ level, onBackToMenu }) {
  const [score, setScore] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  const vipRef = useRef(null);
  const moveableRef = useRef(null);
  const activeCollisions = useRef(new Set());

  // ⏱️ tiempo
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  // 🔊 sonido
  const audioRef = useRef(null);

  const levelMaps = { /* 🔹 TU MISMO MAPA (NO CAMBIA) */ 
    1: {
      obstacles: [
        { id: 1, top: '150px', left: '200px', width: '100px', height: '100px' },
        { id: 2, top: '400px', left: '500px', width: '100px', height: '100px' },
      ],
      start: { top: '50px', left: '50px' },
      goal: { top: '520px', left: '650px' },
    },
    2: {
      obstacles: [
        { id: 1, top: '100px', left: '300px', width: '300px', height: '50px' },
        { id: 2, top: '300px', left: '100px', width: '50px', height: '250px' },
        { id: 3, top: '450px', left: '500px', width: '150px', height: '150px' },
      ],
      start: { top: '50px', left: '50px' },
      goal: { top: '520px', left: '650px' },
    },
    3: {
      obstacles: [
        { id: 1, top: '100px', left: '150px', width: '80px', height: '80px' },
        { id: 2, top: '100px', left: '450px', width: '80px', height: '80px' },
        { id: 3, top: '300px', left: '300px', width: '120px', height: '120px' },
        { id: 4, top: '500px', left: '150px', width: '80px', height: '80px' },
        { id: 5, top: '500px', left: '450px', width: '80px', height: '80px' },
      ],
      start: { top: '50px', left: '50px' },
      goal: { top: '50px', left: '650px' },
    },
  };

  const currentMap = levelMaps[level] || levelMaps[1];

  // ⏱️ cronómetro
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [level]);

  const resetGame = () => {
    setScore(0);
    setTime(0);
    clearInterval(timerRef.current);
    activeCollisions.current.clear();

    if (vipRef.current) {
      vipRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  // 🧠 COLISIONES (ARREGLADO)
  const checkCollisions = useCallback(() => {
    if (!vipRef.current) return;

    const vipRect = vipRef.current.getBoundingClientRect();

    // 🔴 Obstáculos
    document.querySelectorAll('.obstacle').forEach((obs) => {
      const obsRect = obs.getBoundingClientRect();
      const id = obs.dataset.id;

      const isOverlapping =
        vipRect.left < obsRect.right &&
        vipRect.right > obsRect.left &&
        vipRect.top < obsRect.bottom &&
        vipRect.bottom > obsRect.top;

      if (isOverlapping) {
        if (!activeCollisions.current.has(id)) {
          activeCollisions.current.add(id);
          setScore((prev) => prev + 1);

          // 🔊 sonido
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }

          obs.classList.add('obstacle-hit');
          setTimeout(() => obs.classList.remove('obstacle-hit'), 400);
        }
      } else {
        activeCollisions.current.delete(id);
      }
    });

    // 🟢 META (SEPARADO CORRECTAMENTE)
    const goalEl = document.getElementById('goal-point');
    if (goalEl) {
      const goalRect = goalEl.getBoundingClientRect();

      const reachedGoal =
        vipRect.left < goalRect.right &&
        vipRect.right > goalRect.left &&
        vipRect.top < goalRect.bottom &&
        vipRect.bottom > goalRect.top;

      if (reachedGoal) {
        clearInterval(timerRef.current);
        setLevelComplete(true);
      }
    }
  }, []);

  // 🏁 VICTORIA (igual, solo agregamos tiempo)
  if (levelComplete) {
    return (
      <div className="victory-screen">
        <div className="victory-card">
          <h1 className="victory-title">listoo</h1>
          <p className="victory-level">Nivel {level} completado</p>
          <p>Colisiones: {score}</p>
          <p>Tiempo: {time}s</p>

          <button onClick={() => { resetGame(); onBackToMenu(); }}>
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  // 🎮 JUEGO (TU DISEÑO INTACTO)
  return (
    <div className="game-board">
      {/* 🔊 audio oculto */}
      <audio ref={audioRef} src="/sounds/hit.mp3" preload="auto" />

      <button
        className="back-btn"
        onClick={() => {
          resetGame();
          onBackToMenu();
        }}
      >
        Volver al Menú
      </button>

      <div className="scoreboard">
        <h2>
          Nivel {level} | Colisiones: {score} | <Timer time={time} />
        </h2>
      </div>

      {/* PUNTO A */}
      <div
        className="point-marker point-a"
        style={{ top: currentMap.start.top, left: currentMap.start.left }}
      >
        <span>A</span>
      </div>

      {/* META */}
      <div
        id="goal-point"
        className="point-marker point-b"
        style={{ top: currentMap.goal.top, left: currentMap.goal.left }}
      >
        <div className="goal-pulse" />
        <span>B</span>
      </div>

      {/* VIP (TU SVG ORIGINAL) */}
      <div
        ref={vipRef}
        className="vip-box"
        style={{ top: currentMap.start.top, left: currentMap.start.left }}
      >
        {/* 👇 TU SVG COMPLETO AQUÍ (NO LO TOQUÉ) */}
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

      {/* OBSTÁCULOS (igual pero con data-id) */}
      {currentMap.obstacles.map((obs) => (
        <div
          key={obs.id}
          data-id={obs.id}
          className="obstacle"
          style={{
            top: obs.top,
            left: obs.left,
            width: obs.width,
            height: obs.height
          }}
        >
          <span className="obstacle-icon">⚠️</span>
        </div>
      ))}
    </div>
  );
}
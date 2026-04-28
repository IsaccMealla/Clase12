import Moveable from 'react-moveable';
import { useState, useRef, useCallback, useEffect } from 'react';
import Timer from './Timer';

export default function GameBoard({ level, onBackToMenu, onSelectLevel }) {
  const [score, setScore] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [particles, setParticles] = useState([]);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [shieldActive, setShieldActive] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedNextLevel, setSelectedNextLevel] = useState(null);
  const [collectedPowerUps, setCollectedPowerUps] = useState(new Set());

  const vipRef = useRef(null);
  const moveableRef = useRef(null);
  const gameboardRef = useRef(null);
  const activeCollisions = useRef(new Set());
  const particleIdRef = useRef(0);

  // ⏱️ tiempo
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  // 🎮 MAPAS CON OBSTÁCULOS PATRULLEROS - DIFICULTAD PROGRESIVA
  const levelMaps = {
    1: {
      name: 'El Camino',
      difficulty: '⭐ FÁCIL',
      timeLimit: 120,
      obstacles: [
        { id: 1, top: '150px', left: '200px', width: '100px', height: '100px', patrol: false },
        { id: 2, top: '400px', left: '500px', width: '100px', height: '100px', patrol: false },
      ],
      patrollers: [
        { id: 101, top: '280px', left: '150px', width: '80px', height: '80px', distance: 300, speed: 3.5 },
      ],
      powerUps: [
        { id: 'shield-1', top: '320px', left: '350px', type: 'shield' },
        { id: 'speed-bonus-1', top: '450px', left: '80px', type: 'speed' },
      ],
      start: { top: '50px', left: '50px' },
      goal: { top: '520px', left: '650px' },
    },
    2: {
      name: 'La Fortaleza',
      difficulty: '⭐⭐ NORMAL',
      timeLimit: 90,
      obstacles: [
        { id: 1, top: '80px', left: '250px', width: '250px', height: '50px', patrol: false },
        { id: 2, top: '200px', left: '100px', width: '50px', height: '200px', patrol: false },
        { id: 3, top: '180px', left: '550px', width: '120px', height: '80px', patrol: false },
        { id: 4, top: '400px', left: '300px', width: '180px', height: '50px', patrol: false },
        { id: 5, top: '500px', left: '550px', width: '100px', height: '100px', patrol: false },
      ],
      patrollers: [
        { id: 101, top: '200px', left: '100px', width: '70px', height: '70px', distance: 450, speed: 2.5 },
        { id: 102, top: '350px', left: '350px', width: '70px', height: '70px', distance: 400, speed: 2.2 },
        { id: 103, top: '250px', left: '500px', width: '65px', height: '65px', distance: 380, speed: 2.8 },
      ],
      powerUps: [
        { id: 'speed-1', top: '480px', left: '150px', type: 'speed' },
        { id: 'shield-2', top: '100px', left: '500px', type: 'shield' },
      ],
      start: { top: '50px', left: '50px' },
      goal: { top: '520px', left: '650px' },
    },
    3: {
      name: 'El Caos Total',
      difficulty: '⭐⭐⭐ DIFÍCIL',
      timeLimit: 60,
      obstacles: [
        { id: 1, top: '100px', left: '150px', width: '80px', height: '80px', patrol: false },
        { id: 2, top: '100px', left: '450px', width: '80px', height: '80px', patrol: false },
        { id: 3, top: '200px', left: '300px', width: '120px', height: '80px', patrol: false },
        { id: 4, top: '300px', left: '180px', width: '70px', height: '70px', patrol: false },
        { id: 5, top: '300px', left: '520px', width: '90px', height: '90px', patrol: false },
        { id: 6, top: '450px', left: '250px', width: '150px', height: '60px', patrol: false },
        { id: 7, top: '480px', left: '550px', width: '80px', height: '80px', patrol: false },
      ],
      patrollers: [
        { id: 101, top: '150px', left: '100px', width: '65px', height: '65px', distance: 550, speed: 1.8 },
        { id: 102, top: '250px', left: '200px', width: '65px', height: '65px', distance: 500, speed: 2 },
        { id: 103, top: '350px', left: '400px', width: '65px', height: '65px', distance: 480, speed: 2.2 },
        { id: 104, top: '200px', left: '520px', width: '60px', height: '60px', distance: 450, speed: 2.5 },
      ],
      powerUps: [
        { id: 'shield-3', top: '450px', left: '100px', type: 'shield' },
        { id: 'speed-2', top: '100px', left: '550px', type: 'speed' },
      ],
      start: { top: '50px', left: '50px' },
      goal: { top: '50px', left: '650px' },
    },
  };

  const currentMap = levelMaps[level] || levelMaps[1];

  // 🎵 Generar sonidos con Web Audio API
  const playSound = useCallback((type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'hit') {
        oscillator.frequency.value = 300;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } else if (type === 'victory') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else if (type === 'powerup') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  // ✨ CREAR PARTÍCULAS
  const createParticles = useCallback((x, y, count = 8) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const velocity = { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 };
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: velocity.x,
        vy: velocity.y,
        life: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // 📺 SCREEN SHAKE
  const triggerScreenShake = useCallback(() => {
    if (!gameboardRef.current) return;
    setIsShaking(true);
    gameboardRef.current.classList.add('screen-shake');
    setTimeout(() => {
      setIsShaking(false);
      gameboardRef.current?.classList.remove('screen-shake');
    }, 300);
  }, []);

  // ⏱️ cronómetro
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [level]);

  // 🎯 ACTUALIZAR PARTÍCULAS
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy + 0.2,
            vy: p.vy * 0.98,
            life: p.life - 0.05,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  // 💾 GUARDAR RÉCORD
  const saveRecord = useCallback(() => {
    const records = JSON.parse(localStorage.getItem('guardaespaldas-records') || '{}');
    const levelKey = `level-${level}`;
    
    if (!records[levelKey] || time < records[levelKey]) {
      records[levelKey] = time;
      localStorage.setItem('guardaespaldas-records', JSON.stringify(records));
    }
  }, [level, time]);

  // ⭐ CALCULAR ESTRELLAS BASADAS EN RENDIMIENTO
  const calculateStars = useCallback(() => {
    const currentMap = levelMaps[level];
    const timeLimit = currentMap.timeLimit;
    
    // 3 estrellas: menos del 50% del tiempo
    if (time <= timeLimit * 0.5) return 3;
    // 2 estrellas: menos del 75% del tiempo
    if (time <= timeLimit * 0.75) return 2;
    // 1 estrella: menos del tiempo límite
    if (time <= timeLimit) return 1;
    // Sin estrellas: pasó el tiempo límite
    return 0;
  }, [level, time]);

  // 🛡️ ACTIVAR POWER-UP
  const activatePowerUp = useCallback((type) => {
    playSound('powerup');
    if (type === 'shield') {
      setShieldActive(true);
      setTimeout(() => setShieldActive(false), 3000);
    } else if (type === 'speed') {
      setSpeedBoost(true);
      setTimeout(() => setSpeedBoost(false), 4000);
    }
  }, [playSound]);

  const resetGame = () => {
    setScore(0);
    setTime(0);
    setParticles([]);
    setActivePowerUp(null);
    setShieldActive(false);
    setSpeedBoost(false);
    setCollectedPowerUps(new Set());
    clearInterval(timerRef.current);
    activeCollisions.current.clear();

    if (vipRef.current) {
      vipRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  // 🧠 COLISIONES MEJORADAS
  const checkCollisions = useCallback(() => {
    if (!vipRef.current) return;

    const vipRect = vipRef.current.getBoundingClientRect();

    // 🔴 POWER-UPS
    document.querySelectorAll('.power-up').forEach((pu) => {
      const puRect = pu.getBoundingClientRect();
      const id = pu.dataset.id;

      const isOverlapping =
        vipRect.left < puRect.right &&
        vipRect.right > puRect.left &&
        vipRect.top < puRect.bottom &&
        vipRect.bottom > puRect.top;

      if (isOverlapping && !collectedPowerUps.has(id)) {
        setCollectedPowerUps((prev) => new Set([...prev, id]));
        const type = pu.dataset.type;
        activatePowerUp(type);
        playSound('powerup');
      }
    });

    // 🔴 OBSTÁCULOS Y PATRULLEROS
    const allObstacles = [
      ...document.querySelectorAll('.obstacle'),
      ...document.querySelectorAll('.patroller'),
    ];

    allObstacles.forEach((obs) => {
      const obsRect = obs.getBoundingClientRect();
      const id = obs.dataset.id;

      const isOverlapping =
        vipRect.left < obsRect.right &&
        vipRect.right > obsRect.left &&
        vipRect.top < obsRect.bottom &&
        vipRect.bottom > obsRect.top;

      if (isOverlapping) {
        if (!activeCollisions.current.has(id)) {
          if (!shieldActive) {
            activeCollisions.current.add(id);
            setScore((prev) => prev + 1);
            playSound('hit');
            createParticles(vipRect.left + vipRect.width / 2, vipRect.top + vipRect.height / 2);
            triggerScreenShake();
            obs.classList.add('obstacle-hit');
            setTimeout(() => obs.classList.remove('obstacle-hit'), 400);
          } else {
            setShieldActive(false);
            obs.classList.add('obstacle-hit');
            setTimeout(() => obs.classList.remove('obstacle-hit'), 400);
          }
        }
      } else {
        activeCollisions.current.delete(id);
      }
    });

    // 🟢 META
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
        playSound('victory');
        saveRecord();
        setLevelComplete(true);
      }
    }
  }, [shieldActive, activePowerUp, collectedPowerUps, playSound, createParticles, triggerScreenShake, activatePowerUp, saveRecord]);

  // 🏁 VICTORIA - PANTALLA CON MENÚ DE NIVELES
  if (levelComplete) {
    const currentMap = levelMaps[level];
    const records = JSON.parse(localStorage.getItem('guardaespaldas-records') || '{}');
    const bestTime = records[`level-${level}`] || null;
    const stars = calculateStars();

    return (
      <div className="victory-screen">
        <div className="victory-container">
          <div className="victory-card">
            <div className="victory-icon">🎉</div>
            <h1 className="victory-title">¡NIVEL COMPLETADO!</h1>
            <p className="victory-level">{currentMap.name}</p>
            
            {/* ESTRELLAS */}
            <div className="stars-display">
              {[1, 2, 3].map((star) => (
                <span key={star} className={`star ${star <= stars ? 'earned' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>
            
            <div className="victory-stats">
              <div className="stat-item">
                <span className="stat-label">Colisiones:</span>
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tiempo:</span>
                <span className="stat-value">{time}s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Límite:</span>
                <span className="stat-value">{currentMap.timeLimit}s</span>
              </div>
              {bestTime && (
                <div className="stat-item best">
                  <span className="stat-label">⭐ Mejor:</span>
                  <span className="stat-value">{bestTime}s</span>
                </div>
              )}
            </div>

            <div className="quick-action-buttons">
              <button 
                className="victory-btn action-btn"
                onClick={() => { resetGame(); onBackToMenu(); }}
              >
                ← Volver
              </button>
            </div>
          </div>

          {/* SELECTOR DE NIVELES */}
          <div className="levels-grid">
            <h2 className="levels-title">SELECCIONA SIGUIENTE NIVEL</h2>
            <div className="levels-container">
              {[1, 2, 3].map((lvl) => {
                const isCurrentLevel = lvl === level;
                const lvlMap = levelMaps[lvl];
                const lvlBestTime = records[`level-${lvl}`];
                const lvlStars = lvlBestTime ? 
                  (lvlBestTime <= lvlMap.timeLimit * 0.5 ? 3 : 
                   lvlBestTime <= lvlMap.timeLimit * 0.75 ? 2 : 1) : 0;

                return (
                  <div
                    key={lvl}
                    className={`level-select-card ${isCurrentLevel ? 'current' : ''} ${lvl <= level ? 'unlocked' : 'locked'}`}
                    onClick={() => {
                      if (lvl <= level + 1) {
                        setSelectedNextLevel(lvl);
                      }
                    }}
                  >
                    <div className="level-number">NIVEL {lvl}</div>
                    <div className="level-name">{lvlMap.name}</div>
                    <div className="level-difficulty">{lvlMap.difficulty}</div>
                    
                    {lvlStars > 0 && (
                      <div className="level-stars">
                        {[1, 2, 3].map((star) => (
                          <span key={star} className={`star-mini ${star <= lvlStars ? 'earned' : 'empty'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {lvl > level + 1 && <div className="level-lock">🔒</div>}
                  </div>
                );
              })}
            </div>

            {selectedNextLevel && (
              <div className="level-confirm">
                <button
                  className="confirm-btn"
                  onClick={() => {
                    resetGame();
                    onSelectLevel(selectedNextLevel);
                  }}
                >
                  Jugar Nivel {selectedNextLevel}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setSelectedNextLevel(null)}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 🎮 JUEGO PRINCIPAL
  return (
    <div ref={gameboardRef} className="game-board game-board-3d">
      {/* SCOREBOARD MEJORADO */}
      <div className="scoreboard">
        <div className="score-item">
          <span className="score-label">🎯 COLISIONES:</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-item">
          <span className="score-label">⏱️ TIEMPO:</span>
          <span className="score-value"><Timer time={time} /></span>
        </div>
        <div className="score-item">
          <span className="score-label">📍 NIVEL:</span>
          <span className="score-value">{level}</span>
        </div>
      </div>

      {/* POWER-UP STATUS */}
      {(shieldActive || speedBoost) && (
        <div className="power-up-status">
          {shieldActive && <div className="power-badge shield">🛡️ Escudo Activo</div>}
          {speedBoost && <div className="power-badge speed">⚡ Velocidad Boost</div>}
        </div>
      )}

      {/* BOTÓN VOLVER */}
      <button
        className="back-btn"
        onClick={() => {
          resetGame();
          onBackToMenu();
        }}
      >
        ← Menú
      </button>

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

      {/* VIP */}
      <div
        ref={vipRef}
        className={`vip-box ${shieldActive ? 'vip-shield' : ''} ${speedBoost ? 'vip-speed' : ''}`}
        style={{ top: currentMap.start.top, left: currentMap.start.left }}
      >
        {shieldActive && <div className="shield-effect" />}
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

      {/* OBSTÁCULOS ESTÁTICOS */}
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

      {/* OBSTÁCULOS PATRULLEROS */}
      {currentMap.patrollers.map((patrol) => (
        <div
          key={patrol.id}
          data-id={patrol.id}
          className="patroller"
          style={{
            top: patrol.top,
            left: patrol.left,
            width: patrol.width,
            height: patrol.height,
            '--patrol-distance': `${patrol.distance}px`,
            '--patrol-speed': `${patrol.speed}s`,
          }}
        >
          <span className="patroller-icon">🚨</span>
        </div>
      ))}

      {/* POWER-UPS */}
      {currentMap.powerUps.map((pu) => (
        !collectedPowerUps.has(pu.id) && (
          <div
            key={pu.id}
            data-id={pu.id}
            data-type={pu.type}
            className="power-up"
            style={{
              top: pu.top,
              left: pu.left,
            }}
          >
            <span className="power-up-icon">
              {pu.type === 'shield' ? '🛡️' : '⚡'}
            </span>
          </div>
        )
      ))}

      {/* PARTÍCULAS */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            opacity: p.life,
          }}
        />
      ))}
    </div>
  );
}
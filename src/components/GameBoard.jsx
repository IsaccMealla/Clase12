import { useState } from 'react';

export default function GameBoard({ level, onBackToMenu }) {
  const [score, setScore] = useState(0);

  // ESTRUCTURA DE LOS 3 NIVELES (Para la Persona 2 y 3)
  const levelMaps = {
    1: [ // Nivel Básico: 2 obstáculos simples
      { id: 1, top: '150px', left: '200px', width: '100px', height: '100px' },
      { id: 2, top: '400px', left: '500px', width: '100px', height: '100px' },
    ],
    2: [ // Nivel Intermedio: Formato de pasillo con muros
      { id: 1, top: '100px', left: '300px', width: '300px', height: '50px' },
      { id: 2, top: '300px', left: '100px', width: '50px', height: '250px' },
      { id: 3, top: '450px', left: '500px', width: '150px', height: '150px' },
    ],
    3: [ // Nivel Difícil: Obstáculos estrechos y múltiples
      { id: 1, top: '100px', left: '150px', width: '80px', height: '80px' },
      { id: 2, top: '100px', left: '450px', width: '80px', height: '80px' },
      { id: 3, top: '300px', left: '300px', width: '120px', height: '120px' },
      { id: 4, top: '500px', left: '150px', width: '80px', height: '80px' },
      { id: 5, top: '500px', left: '450px', width: '80px', height: '80px' },
    ]
  };

  // Obtenemos los obstáculos del nivel actual
  const currentObstacles = levelMaps[level] || levelMaps[1];

  return (
    <div className="game-board">
      <button className="back-btn" onClick={onBackToMenu}>Volver al Menú</button>
      
      <div className="scoreboard">
        <h2>Nivel {level} | Colisiones: {score}</h2>
      </div>

      <div className="vip-box" id="vip" style={{ top: '50px', left: '50px' }}>
        VIP
      </div>

      {/* Renderizamos los obstáculos dinámicamente con map() */}
      {currentObstacles.map((obs) => (
        <div 
          key={obs.id} 
          className="obstacle" 
          // Importante: le pasamos la clase 'obstacle' para que la Persona 3 
          // los pueda detectar fácilmente usando document.querySelectorAll('.obstacle')
          style={{ 
            top: obs.top, 
            left: obs.left, 
            width: obs.width, 
            height: obs.height 
          }}
        ></div>
      ))}
    </div>
  );
}
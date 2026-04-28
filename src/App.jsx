import { useState } from 'react';
import './App.css';

function App() {
  // Estado para guardar los puntos (cada colisión suma un punto)
  const [score, setScore] = useState(0);

  return (
    <div className="game-container">
      {/* Marcador */}
      <div className="scoreboard">
        <h2>Puntuación: {score}</h2>
      </div>

      {/* La caja VIP que se deberá arrastrar */}
      <div className="vip-box" id="vip">
        VIP
      </div>

      {/* Obstáculos de prueba para que tus compañeros detecten colisiones */}
      <div className="obstacle" style={{ top: '150px', left: '200px' }}></div>
      <div className="obstacle" style={{ top: '400px', left: '500px' }}></div>
    </div>
  );
}

export default App;
import { useState } from 'react';
import Menu from './components/Menu';
import GameBoard from './components/GameBoard';
import './App.css';

function App() {
  // Ahora guardamos qué nivel se seleccionó (null = estamos en el menú)
  const [currentLevel, setCurrentLevel] = useState(null);

  return (
    <div className="app-container">
      {currentLevel ? (
        <GameBoard level={currentLevel} onBackToMenu={() => setCurrentLevel(null)} />
      ) : (
        <Menu onSelectLevel={setCurrentLevel} />
      )}
    </div>
  );
}

export default App;
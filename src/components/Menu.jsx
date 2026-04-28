export default function Menu({ onSelectLevel }) {
  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1 className="menu-title">El Guardaespaldas</h1>
        <p className="menu-subtitle">
          Elige la dificultad de tu misión y protege a la caja VIP.
        </p>
        
        {/* Botones de selección de nivel */}
        <div className="level-buttons">
          <button className="start-btn" onClick={() => onSelectLevel(1)}>Nivel 1</button>
          <button className="start-btn" onClick={() => onSelectLevel(2)}>Nivel 2</button>
          <button className="start-btn" onClick={() => onSelectLevel(3)}>Nivel 3</button>
        </div>
      </div>
    </div>
  );
}
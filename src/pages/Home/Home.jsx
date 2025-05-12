import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="Home">
      <div className="hero-section">
        <h1>BiblioTech</h1>
        <p className="tagline">Tu portal digital hacia el conocimiento</p>
        
        <div className="cta-buttons">
          <Link to="/catalogo" className="primary-button">Explorar Catálogo</Link>
          <Link to="/login" className="secondary-button">Iniciar Sesión</Link>
        </div>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <h3>📚 Amplia Colección</h3>
          <p>Descubre miles de libros en diferentes géneros y formatos.</p>
        </div>
        <div className="feature-card">
          <h3>⏱️ Préstamos Rápidos</h3>
          <p>Reserva y renueva tus libros con solo un clic.</p>
        </div>
        <div className="feature-card">
          <h3>📱 Acceso 24/7</h3>
          <p>Disponible desde cualquier dispositivo, en cualquier momento.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
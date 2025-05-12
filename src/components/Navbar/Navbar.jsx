import "./Navbar.css"
import { BrowserRouter, Link } from "react-router-dom";

function Navbar() {

    return(

            <nav className="navbar">
                <div className="pages">
                    <Link to="/" className="logo">
                        <span className="title">BiblioTech</span>
                    </Link>
                    
                    <div className="pages">
                        <Link to="/catalogo">Catálogo</Link>
                        <Link to="/prestamos">Préstamos</Link>
                        <Link to="/reservas">Reservas</Link>
                        <Link to="/perfil">Mi Perfil</Link>
                    </div>
                    
                    <div className="auth-section">
                        <Link to="/login" className="login-btn">Iniciar Sesión</Link>
                        <Link to="/register" className="register-btn">Registrarse</Link>
                    </div>
                </div>
            </nav>
    )
}

export default Navbar
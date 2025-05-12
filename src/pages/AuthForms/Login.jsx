import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthForms.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de inicio de sesión aquí (simulada)
    console.log('Datos de inicio de sesión:', formData);
    alert('Inicio de sesión exitoso (simulación)');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" />
              Recordar sesión
            </label>
            <Link to="/forgot-password" className="auth-link">¿Olvidaste tu contraseña?</Link>
          </div>
          
          <button type="submit" className="auth-button">Iniciar Sesión</button>
        </form>
        
        <div className="auth-footer">
          <p>¿No tienes una cuenta? <Link to="/register" className="auth-link">Regístrate</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
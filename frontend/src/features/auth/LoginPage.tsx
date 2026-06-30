import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg-gradient"></div>
        <div className="login-bg-grid"></div>
        <div className="login-bg-blob login-bg-blob-1"></div>
        <div className="login-bg-blob login-bg-blob-2"></div>
      </div>

      <div className="login-container animate-fade-in">
        {/* Logo Section */}
        <div className="login-logo-section">
          <div className="login-logo">
            <Shield size={32} />
          </div>
          <h1>ERP <span>SSOMA</span></h1>
          <p>Seguridad, Salud Ocupacional y Medio Ambiente</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-card">
            <h2>Iniciar Sesión</h2>
            <p className="login-subtitle">Ingresa tus credenciales para acceder al sistema</p>

            {error && (
              <div className="login-error animate-fade-in">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="admin@ssoma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>

            <div className="login-demo">
              <p>Cuentas demo:</p>
              <div className="login-demo-accounts">
                <button type="button" onClick={() => { setEmail('admin@ssoma.com'); setPassword('password'); }}>
                  Admin
                </button>
                <button type="button" onClick={() => { setEmail('supervisor@ssoma.com'); setPassword('password'); }}>
                  Supervisor
                </button>
                <button type="button" onClick={() => { setEmail('prevencionista@ssoma.com'); setPassword('password'); }}>
                  Prevencionista
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

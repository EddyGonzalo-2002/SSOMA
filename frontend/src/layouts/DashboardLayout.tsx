import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Shield, LayoutDashboard, FolderKanban, MapPin,
  Users, FileText, ClipboardCheck, Sun, Moon,
  LogOut, Bell, Search, Settings, Menu
} from 'lucide-react';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, theme, setTheme } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-layout">
      {/* Overlay móvil */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={20} />
          </div>
          <div className="sidebar-logo-text">
            ERP <span>SSOMA</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Principal</div>

          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} className="sidebar-link-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/proyectos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FolderKanban size={20} className="sidebar-link-icon" />
            <span>Proyectos</span>
          </NavLink>

          <NavLink to="/areas" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <MapPin size={20} className="sidebar-link-icon" />
            <span>Áreas</span>
          </NavLink>

          <div className="sidebar-section-title">SSOMA</div>

          <NavLink to="/formularios" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} className="sidebar-link-icon" />
            <span>Formularios</span>
          </NavLink>

          <NavLink to="/respuestas" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ClipboardCheck size={20} className="sidebar-link-icon" />
            <span>Respuestas</span>
          </NavLink>

          {(user?.roles?.includes('superadmin') || user?.roles?.includes('admin')) && (
            <>
              <div className="sidebar-section-title">Administración</div>

              <NavLink to="/usuarios" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={20} className="sidebar-link-icon" />
                <span>Usuarios</span>
              </NavLink>
            </>
          )}

          <NavLink to="/configuracion" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} className="sidebar-link-icon" />
            <span>Configuración</span>
          </NavLink>
        </nav>

        {/* User section at bottom */}
        <div className="sidebar-user" onClick={() => navigate('/configuracion')} style={{ cursor: 'pointer' }} title="Ir a Configuración">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">
              {user?.roles?.[0] || 'Usuario'}
            </div>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="btn btn-icon btn-ghost menu-toggle" 
            onClick={() => setIsSidebarOpen(true)}
            title="Abrir menú"
          >
            <Menu size={20} />
          </button>
          
          <div className="header-search">
            <Search size={18} className="header-search-icon" />
            <input
              type="text"
              className="input"
              placeholder="Buscar proyectos, formularios..."
            />
          </div>
        </div>

        <div className="header-right">
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button className="btn btn-icon btn-ghost" title="Notificaciones">
            <Bell size={18} />
          </button>

          <button
            className="btn btn-icon btn-ghost"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>

          <div className="header-avatar" onClick={() => navigate('/configuracion')} title="Mi Perfil">
            {getInitials(user?.name || 'U')}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

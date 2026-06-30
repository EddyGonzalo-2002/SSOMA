import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProyectosPage from './features/projects/ProyectosPage';
import UsuariosPage from './features/users/UsuariosPage';
import AreasPage from './features/areas/AreasPage';
import FormulariosPage from './features/forms/FormulariosPage';
import FormBuilderPage from './features/forms/FormBuilderPage';
import FormRendererPage from './features/forms/FormRendererPage';
import RespuestasPage from './features/responses/RespuestasPage';
import ConfiguracionPage from './features/settings/ConfiguracionPage';
import ATS034RendererPage from './features/forms/custom/ATS034RendererPage';
import For067RendererPage from './features/forms/custom/For067RendererPage';
import Formato05RendererPage from './features/forms/custom/Formato05RendererPage';
import For017RendererPage from './features/forms/custom/For017RendererPage';

export default function App() {
  const { theme } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/proyectos" element={<ProyectosPage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/formularios" element={<FormulariosPage />} />
            <Route path="/formularios/:id/editar" element={<FormBuilderPage />} />
            <Route path="/formularios/:id/llenar" element={<FormRendererPage />} />
            <Route path="/formularios/:id/llenar/ats034" element={<ATS034RendererPage />} />
            <Route path="/formularios/:id/llenar/for067" element={<For067RendererPage />} />
            <Route path="/formularios/:id/llenar/formato05" element={<Formato05RendererPage />} />
            <Route path="/formularios/:id/llenar/for017" element={<For017RendererPage />} />
            <Route path="/formularios/nuevo" element={<FormBuilderPage />} />
            <Route path="/respuestas" element={<RespuestasPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}



import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, FileText, MoreVertical,
  CheckCircle2, Clock, Users, MapPin
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Formulario, PaginatedResponse } from '../../types';
import './FormulariosPage.css';

export default function FormulariosPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManagement = user?.roles?.includes('superadmin') || user?.roles?.includes('admin');
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFormularios();
  }, [search]);

  const loadFormularios = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.buscar = search;

      const response = await api.get<PaginatedResponse<Formulario>>('/formularios', { params });
      setFormularios(response.data.data);
    } catch (error) {
      console.error('Error loading formularios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      publicado: 'badge-success',
      borrador: 'badge-warning',
      archivado: 'badge-neutral',
    };
    return map[estado] || 'badge-neutral';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este formulario?')) return;
    try {
      await api.delete(`/formularios/${id}`);
      loadFormularios();
    } catch (error) {
      console.error('Error deleting formulario:', error);
    }
  };

  const getFormRoute = (formulario: Formulario) => {
    const code = (formulario.codigo || '').toUpperCase().replace(/[-_ ]/g, '');
    if (code.includes('SSTFOR034') || code.includes('034')) return `/formularios/${formulario.id}/llenar/ats034`;
    if (code.includes('SSTFOR067') || code.includes('067')) return `/formularios/${formulario.id}/llenar/for067`;
    if (code.includes('FORMATO05') || code.includes('FOR05') || code.includes('FORMAT05') || code.includes('05')) return `/formularios/${formulario.id}/llenar/formato05`;
    if (code.includes('SSTFOR017') || code.includes('017')) return `/formularios/${formulario.id}/llenar/for017`;
    return `/formularios/${formulario.id}/llenar`;
  };

  return (
    <div className="formularios-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Formularios SSOMA</h1>
          <p className="page-header-subtitle">
            Gestiona y diseña los formatos de inspección, ATS, PETS, etc.
          </p>
        </div>
        {isManagement && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/formularios/nuevo')}
          >
            <Plus size={18} />
            Nuevo Formato
          </button>
        )}
      </div>

      {/* Search */}
      <div className="formularios-search card">
        <div className="header-search">
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="formularios-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="card skeleton" style={{ height: 200 }}></div>
          ))}
        </div>
      ) : formularios.length === 0 ? (
        <div className="card empty-state">
          <FileText size={48} />
          <h3>No hay formularios</h3>
          <p>Crea tu primer formato SSOMA dinámico para empezar a registrar datos en campo.</p>
          {isManagement && (
            <button className="btn btn-primary" onClick={() => navigate('/formularios/nuevo')}>
              <Plus size={18} /> Crear Formato
            </button>
          )}
        </div>
      ) : (
        <div className="formularios-grid">
          {formularios.map((form, index) => (
            <div
              key={form.id}
              className="card form-card stagger-item animate-slide-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="form-card-header">
                <div className="form-card-icon">
                  <FileText size={20} />
                </div>
                <div className="form-card-status">
                  <span className={`badge ${getEstadoBadge(form.estado)}`}>
                    {form.estado}
                  </span>
                </div>
                <div className="form-card-menu">
                  <button className="btn btn-icon btn-ghost btn-sm">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="form-card-body">
                <h3 className="form-card-title">{form.nombre}</h3>
                <p className="form-card-code">{form.codigo}</p>
                {form.descripcion && (
                  <p className="form-card-desc">{form.descripcion}</p>
                )}
              </div>

              <div className="form-card-tags">
                {form.requiere_participantes && (
                  <span className="form-tag" title="Requiere firma de trabajadores">
                    <Users size={12} /> Participantes
                  </span>
                )}
                {form.requiere_geolocalizacion && (
                  <span className="form-tag" title="Requiere ubicación GPS">
                    <MapPin size={12} /> GPS
                  </span>
                )}
              </div>

              <div className="form-card-footer">
                <div className="form-card-stat">
                  <CheckCircle2 size={14} />
                  <span>{form.respuestas_count || 0} Registros</span>
                </div>
                <div className="form-card-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(getFormRoute(form))}
                    title="Llenar registro"
                  >
                    Llenar
                  </button>
                  {isManagement && (
                    <>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/formularios/${form.id}/editar`)}
                        title="Editar diseño"
                      >
                        Diseñar
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-danger"
                        onClick={() => handleDelete(form.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  Plus, Search, MapPin, Users, FileText,
  MoreVertical, Calendar, Loader2, Check,
  ClipboardList
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Proyecto, PaginatedResponse } from '../../types';
import './ProyectosPage.css';

export default function ProyectosPage() {
  const { user } = useAuthStore();
  const isSuperadmin = user?.roles?.includes('superadmin');
  const isAdmin = user?.roles?.includes('admin');
  const canEdit = isSuperadmin || isAdmin;

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal tabs
  const [activeTab, setActiveTab] = useState<'datos' | 'corporativo' | 'integrantes'>('datos');
  const [allUsers, setAllUsers] = useState<{id: number, name: string}[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Form state
  const [form, setForm] = useState({
    nombre: '', codigo: '', descripcion: '',
    ubicacion: '', estado: 'activo',
    fecha_inicio: '', fecha_fin: '',
    ruc: '20545318561', razon_social: 'TACTICAL IT',
    actividad_economica: 'Actividades de arquitectura e ingeniería y comunicaciones',
  });

  useEffect(() => {
    loadProyectos();
  }, [search]);

  const loadProyectos = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.buscar = search;

      const response = await api.get<PaginatedResponse<Proyecto>>('/proyectos', { params });
      setProyectos(response.data.data);
    } catch (error) {
      console.error('Error loading proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const usersRes = await api.get('/usuarios?per_page=100');
      setAllUsers(usersRes.data.data || []);
    } catch (e) {
      console.error('Error fetching dependencies', e);
    }
  };

  const openCreateModal = async () => {
    setEditingProyecto(null);
    setForm({
      nombre: '', codigo: '', descripcion: '',
      ubicacion: '', estado: 'activo',
      fecha_inicio: '', fecha_fin: '',
      ruc: '20545318561', razon_social: 'TACTICAL IT',
      actividad_economica: 'Actividades de arquitectura e ingeniería y comunicaciones',
    });
    setSelectedUsers([]);
    setActiveTab('datos');
    await fetchDependencies();
    setShowModal(true);
  };

  const openEditModal = async (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    setForm({
      nombre: proyecto.nombre,
      codigo: proyecto.codigo,
      descripcion: proyecto.descripcion || '',
      ubicacion: proyecto.ubicacion || '',
      estado: proyecto.estado,
      fecha_inicio: proyecto.fecha_inicio || '',
      fecha_fin: proyecto.fecha_fin || '',
      ruc: proyecto.ruc || '20545318561',
      razon_social: proyecto.razon_social || 'TACTICAL IT',
      actividad_economica: proyecto.actividad_economica || '',
    });
    setActiveTab('datos');
    await fetchDependencies();
    setShowModal(true);

    try {
      const res = await api.get(`/proyectos/${proyecto.id}`);
      const data = res.data.data;
      if (data.usuarios) setSelectedUsers(data.usuarios.map((u: any) => u.id));
    } catch (e) {
      console.error('Error fetching project details', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form };
      if (!payload.fecha_inicio) delete (payload as Record<string, unknown>).fecha_inicio;
      if (!payload.fecha_fin) delete (payload as Record<string, unknown>).fecha_fin;

      let proyectoId = editingProyecto?.id;

      if (proyectoId) {
        await api.put(`/proyectos/${proyectoId}`, payload);
      } else {
        const res = await api.post('/proyectos', payload);
        proyectoId = res.data.data.id;
      }

      // Sync users
      if (proyectoId) {
        await api.put(`/proyectos/${proyectoId}/usuarios`, { user_ids: selectedUsers });
      }

      setShowModal(false);
      loadProyectos();
    } catch (error) {
      console.error('Error saving proyecto:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      await api.delete(`/proyectos/${id}`);
      loadProyectos();
    } catch (error) {
      console.error('Error deleting proyecto:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      activo: 'badge-success',
      inactivo: 'badge-neutral',
      finalizado: 'badge-info',
    };
    return map[estado] || 'badge-neutral';
  };

  return (
    <div className="proyectos-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Proyectos</h1>
          <p className="page-header-subtitle">
            Gestiona los proyectos y sus datos corporativos
          </p>
        </div>
        {isSuperadmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            Nuevo Proyecto
          </button>
        )}
      </div>

      <div className="proyectos-search card">
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

      {loading ? (
        <div className="proyectos-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="card proyecto-card-skeleton">
              <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 8 }}></div>
              <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 16 }}></div>
              <div className="skeleton" style={{ width: '100%', height: 40, marginBottom: 12 }}></div>
              <div className="skeleton" style={{ width: '80%', height: 14 }}></div>
            </div>
          ))}
        </div>
      ) : proyectos.length === 0 ? (
        <div className="card empty-state">
          <FileText size={48} />
          <h3>No hay proyectos</h3>
          <p>Crea tu primer proyecto para empezar a gestionar tus formularios SSOMA</p>
          {isSuperadmin && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Crear Proyecto
            </button>
          )}
        </div>
      ) : (
        <div className="proyectos-grid">
          {proyectos.map((proyecto, index) => (
            <div
              key={proyecto.id}
              className="card proyecto-card stagger-item animate-slide-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="proyecto-card-header">
                <div>
                  <span className={`badge ${getEstadoBadge(proyecto.estado)}`}>
                    {proyecto.estado}
                  </span>
                  <h3 className="proyecto-card-title">{proyecto.nombre}</h3>
                  <p className="proyecto-card-code">{proyecto.codigo}</p>
                </div>
                {canEdit && (
                  <div className="proyecto-card-actions">
                    <button className="btn btn-icon btn-ghost" onClick={() => openEditModal(proyecto)}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                )}
              </div>

              {proyecto.descripcion && (
                <p className="proyecto-card-desc">{proyecto.descripcion}</p>
              )}

              {proyecto.ubicacion && (
                <div className="proyecto-card-location">
                  <MapPin size={14} />
                  <span>{proyecto.ubicacion}</span>
                </div>
              )}

              <div className="proyecto-card-stats">
                <div className="proyecto-stat">
                  <MapPin size={14} />
                  <span>{proyecto.areas_count || 0} Áreas</span>
                </div>
                <div className="proyecto-stat">
                  <Users size={14} />
                  <span>{proyecto.usuarios_count || 0} Usuarios</span>
                </div>
              </div>

              {(proyecto.usuarios && proyecto.usuarios.length > 0) && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {proyecto.usuarios.map((u: any) => (
                    <span key={`u-${u.id}`} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      👤 {u.name}
                    </span>
                  ))}
                </div>
              )}

              {(proyecto.fecha_inicio || proyecto.fecha_fin) && (
                <div className="proyecto-card-dates" style={{ marginTop: '1rem' }}>
                  <Calendar size={14} />
                  <span>
                    {proyecto.fecha_inicio || '—'} → {proyecto.fecha_fin || '—'}
                  </span>
                </div>
              )}

              {canEdit && (
                <div className="proyecto-card-footer">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(proyecto)}>
                    Editar
                  </button>
                  {isSuperadmin && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger-500)' }}
                      onClick={() => handleDelete(proyecto.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: 0 }}>
                {/* Tabs Header */}
                <div className="tabs-container" style={{ margin: 0, borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
                  <button type="button" className={`tab-btn ${activeTab === 'datos' ? 'active' : ''}`} onClick={() => setActiveTab('datos')}>
                    Datos Generales
                  </button>
                  <button type="button" className={`tab-btn ${activeTab === 'corporativo' ? 'active' : ''}`} onClick={() => setActiveTab('corporativo')}>
                    Datos Corporativos
                  </button>
                  <button type="button" className={`tab-btn ${activeTab === 'integrantes' ? 'active' : ''}`} onClick={() => setActiveTab('integrantes')}>
                    Integrantes
                  </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  {activeTab === 'datos' && (
                    <div className="animate-fade-in">
                      <div className="modal-form-grid">
                        <div className="input-group">
                          <label>Nombre *</label>
                          <input
                            className="input" required
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Nombre del proyecto"
                          />
                        </div>
                        <div className="input-group">
                          <label>Código *</label>
                          <input
                            className="input" required
                            value={form.codigo}
                            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                            placeholder="PROY-001"
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Descripción</label>
                        <textarea
                          className="input" rows={3}
                          value={form.descripcion}
                          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                          placeholder="Descripción del proyecto..."
                        />
                      </div>

                      <div className="input-group">
                        <label>Ubicación</label>
                        <input
                          className="input"
                          value={form.ubicacion}
                          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                          placeholder="Lima, Perú"
                        />
                      </div>

                      <div className="modal-form-grid">
                        <div className="input-group">
                          <label>Fecha Inicio</label>
                          <input
                            className="input" type="date"
                            value={form.fecha_inicio}
                            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                          />
                        </div>
                        <div className="input-group">
                          <label>Fecha Fin</label>
                          <input
                            className="input" type="date"
                            value={form.fecha_fin}
                            onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'corporativo' && (
                    <div className="animate-fade-in">
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        Estos datos se insertarán automáticamente en todos los PDFs de este proyecto.
                      </p>
                      <div className="modal-form-grid">
                        <div className="input-group">
                          <label>RUC</label>
                          <input
                            className="input"
                            value={form.ruc}
                            onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                            placeholder="20545318561"
                            maxLength={11}
                          />
                        </div>
                        <div className="input-group">
                          <label>Razón Social</label>
                          <input
                            className="input"
                            value={form.razon_social}
                            onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                            placeholder="TACTICAL IT"
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Actividad Económica</label>
                        <input
                          className="input"
                          value={form.actividad_economica}
                          onChange={(e) => setForm({ ...form, actividad_economica: e.target.value })}
                          placeholder="Actividades de arquitectura e ingeniería..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'integrantes' && (
                    <div className="animate-fade-in">
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        Selecciona los usuarios que tendrán acceso a este proyecto.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {allUsers.map(u => (
                          <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer', background: selectedUsers.includes(u.id) ? 'var(--primary-50)' : 'transparent' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedUsers.includes(u.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                                else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                              }}
                            />
                            {u.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

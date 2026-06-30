import { useEffect, useState } from 'react';
import {
  Plus, Search, MapPin, Map, MoreVertical, Loader2, FolderKanban,
  ClipboardList, Edit2, Trash2, Check, ChevronUp, ChevronDown
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Area, PaginatedResponse, Proyecto, Actividad } from '../../types';
import './AreasPage.css';

export default function AreasPage() {
  const { user } = useAuthStore();
  const isSuperadmin = user?.roles?.includes('superadmin');
  const isAdmin = user?.roles?.includes('admin');
  const canEdit = isSuperadmin || isAdmin;

  const [areas, setAreas] = useState<Area[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'datos' | 'actividades' | 'integrantes'>('datos');

  // Integrantes state
  const [allUsers, setAllUsers] = useState<{id: number, name: string}[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Form state
  const [form, setForm] = useState({
    proyecto_id: '', nombre: '', codigo: '',
    descripcion: '', tipo_area: '', nivel_riesgo: 'medio'
  });

  // Actividades state
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [showActividadForm, setShowActividadForm] = useState(false);
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null);
  const [actividadForm, setActividadForm] = useState({ nombre: '', descripcion: '', formulario_ids: [] as number[] });
  const [savingActividad, setSavingActividad] = useState(false);
  const [allForms, setAllForms] = useState<{id: number, nombre: string, codigo: string}[]>([]);

  // Expandir area para ver actividades
  const [expandedArea, setExpandedArea] = useState<number | null>(null);

  useEffect(() => {
    loadProyectos();
  }, []);

  useEffect(() => {
    loadAreas();
  }, [search]);

  const loadProyectos = async () => {
    try {
      const response = await api.get('/proyectos', { params: { per_page: 100 } });
      setProyectos(response.data.data);
    } catch (error) {
      console.error('Error loading proyectos:', error);
    }
  };

  const loadAreas = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.buscar = search;

      const response = await api.get<PaginatedResponse<Area>>('/areas', { params });
      setAreas(response.data.data);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const formsRes = await api.get('/formularios?per_page=100');
      setAllForms(formsRes.data.data || []);
      const usersRes = await api.get('/usuarios?per_page=100');
      setAllUsers(usersRes.data.data || []);
    } catch (e) {
      console.error('Error fetching dependencies', e);
    }
  };

  const loadActividades = async (areaId: number) => {
    try {
      const res = await api.get(`/areas/${areaId}/actividades`);
      setActividades(res.data.data || []);
    } catch (e) {
      console.error('Error loading actividades', e);
    }
  };

  const openCreateModal = () => {
    setEditingArea(null);
    setForm({
      proyecto_id: proyectos.length > 0 ? proyectos[0].id.toString() : '',
      nombre: '', codigo: '', descripcion: '',
      tipo_area: '', nivel_riesgo: 'medio'
    });
    setActividades([]);
    setSelectedUsers([]);
    setActiveTab('datos');
    fetchDependencies();
    setShowModal(true);
  };

  const openEditModal = async (area: Area) => {
    setEditingArea(area);
    setForm({
      proyecto_id: area.proyecto_id.toString(),
      nombre: area.nombre,
      codigo: area.codigo || '',
      descripcion: area.descripcion || '',
      tipo_area: area.tipo_area || '',
      nivel_riesgo: area.nivel_riesgo || 'medio'
    });
    setActiveTab('datos');
    await fetchDependencies();
    setShowModal(true);

    try {
      await loadActividades(area.id);
      const res = await api.get(`/areas/${area.id}`);
      if (res.data.data.usuarios) {
        setSelectedUsers(res.data.data.usuarios.map((u: any) => u.id));
      }
    } catch (e) {
      console.error('Error fetching area details', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let areaId = editingArea?.id;
      if (areaId) {
        await api.put(`/areas/${areaId}`, form);
      } else {
        const res = await api.post('/areas', form);
        areaId = res.data.data.id;
      }

      if (areaId) {
        await api.post(`/areas/${areaId}/asignar-usuarios`, { user_ids: selectedUsers });
      }

      setShowModal(false);
      loadAreas();
    } catch (error) {
      console.error('Error saving area:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveActividad = async () => {
    if (!editingArea || !actividadForm.nombre.trim()) return;
    setSavingActividad(true);
    try {
      if (editingActividad) {
        await api.put(`/areas/${editingArea.id}/actividades/${editingActividad.id}`, actividadForm);
      } else {
        await api.post(`/areas/${editingArea.id}/actividades`, actividadForm);
      }
      await loadActividades(editingArea.id);
      setShowActividadForm(false);
      setEditingActividad(null);
      setActividadForm({ nombre: '', descripcion: '', formulario_ids: [] });
      loadAreas(); // Para refrescar contador de actividades
    } catch (err) {
      console.error('Error saving actividad', err);
    } finally {
      setSavingActividad(false);
    }
  };

  const handleDeleteActividad = async (actividadId: number) => {
    if (!editingArea || !confirm('¿Eliminar esta actividad?')) return;
    try {
      await api.delete(`/areas/${editingArea.id}/actividades/${actividadId}`);
      await loadActividades(editingArea.id);
      loadAreas();
    } catch (err) {
      console.error('Error deleting actividad', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta área?')) return;

    try {
      await api.delete(`/areas/${id}`);
      loadAreas();
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  const getRiesgoBadge = (riesgo: string) => {
    const map: Record<string, string> = {
      bajo: 'badge-success',
      medio: 'badge-warning',
      alto: 'badge-danger',
    };
    return map[riesgo] || 'badge-neutral';
  };

  const toggleExpand = (areaId: number) => {
    if (expandedArea === areaId) {
      setExpandedArea(null);
    } else {
      setExpandedArea(areaId);
    }
  };

  return (
    <div className="areas-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Áreas / Sectores</h1>
          <p className="page-header-subtitle">
            Gestiona los sectores dentro de cada proyecto y las actividades a realizar
          </p>
        </div>
        {isSuperadmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            Nuevo Sector
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="areas-search card">
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
        <div className="areas-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="card area-card-skeleton skeleton"></div>
          ))}
        </div>
      ) : areas.length === 0 ? (
        <div className="card empty-state">
          <Map size={48} />
          <h3>No hay sectores registrados</h3>
          <p>Crea tu primer sector/área de trabajo para asignarle actividades y formularios</p>
          {isSuperadmin && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Crear Sector
            </button>
          )}
        </div>
      ) : (
        <div className="areas-grid">
          {areas.map((area, index) => (
            <div
              key={area.id}
              className="card area-card stagger-item animate-slide-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="area-card-header">
                <div>
                  <h3 className="area-card-title">{area.nombre}</h3>
                  <p className="area-card-code">{area.codigo}</p>
                </div>
                {canEdit && (
                  <div className="area-card-actions">
                    <button className="btn btn-icon btn-ghost" onClick={() => openEditModal(area)}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                )}
              </div>

              {area.descripcion && (
                <p className="area-card-desc">{area.descripcion}</p>
              )}

              <div className="area-card-details" style={{ marginBottom: '0.5rem' }}>
                {area.proyecto && (
                  <div className="area-detail">
                    <FolderKanban size={14} />
                    <span>{area.proyecto.nombre}</span>
                  </div>
                )}
                {area.tipo_area && (
                  <div className="area-detail">
                    <MapPin size={14} />
                    <span>{area.tipo_area}</span>
                  </div>
                )}
                <div className="area-detail">
                  <span>Riesgo: </span>
                  <span className={`badge ${getRiesgoBadge(area.nivel_riesgo || 'medio')}`}>
                    {area.nivel_riesgo}
                  </span>
                </div>
              </div>

              {(area.usuarios && area.usuarios.length > 0) && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {area.usuarios.map((u: any) => (
                    <span key={`u-${u.id}`} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      👤 {u.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actividades preview */}
              {(area.actividades && area.actividades.length > 0) && (
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ width: '100%', justifyContent: 'space-between', padding: '0.5rem' }}
                    onClick={() => toggleExpand(area.id)}
                  >
                    <span>📋 {area.actividades.length} Actividades</span>
                    {expandedArea === area.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedArea === area.id && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {area.actividades.map(act => (
                        <div key={act.id} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 600 }}>{act.nombre}</div>
                          {act.formularios && act.formularios.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                              {act.formularios.map(f => (
                                <button
                                  key={f.id} 
                                  className="badge badge-primary" 
                                  style={{ fontSize: '0.65rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const code = (f.codigo || '').toUpperCase().replace(/[-_ ]/g, '');
                                    let route = `/formularios/${f.id}/llenar`;
                                    if (code.includes('SSTFOR034') || code.includes('034')) route = `/formularios/${f.id}/llenar/ats034`;
                                    else if (code.includes('SSTFOR067') || code.includes('067')) route = `/formularios/${f.id}/llenar/for067`;
                                    else if (code.includes('FORMATO05') || code.includes('FOR05') || code.includes('FORMAT05') || code.includes('05')) route = `/formularios/${f.id}/llenar/formato05`;
                                    else if (code.includes('SSTFOR017') || code.includes('017')) route = `/formularios/${f.id}/llenar/for017`;
                                    window.location.href = route;
                                  }}
                                >
                                  📄 {f.codigo} (Llenar)
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {canEdit && (
                <div className="area-card-footer">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(area)}>
                    Editar / Actividades
                  </button>
                  {isSuperadmin && (
                    <button
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => handleDelete(area.id)}
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
              <h3>{editingArea ? 'Editar Sector' : 'Nuevo Sector'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: 0 }}>
              <div className="tabs-container" style={{ margin: 0, borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
                <button type="button" className={`tab-btn ${activeTab === 'datos' ? 'active' : ''}`} onClick={() => setActiveTab('datos')}>
                  Datos Generales
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'integrantes' ? 'active' : ''}`} onClick={() => setActiveTab('integrantes')}>
                  Integrantes
                </button>
                {editingArea && (
                  <button type="button" className={`tab-btn ${activeTab === 'actividades' ? 'active' : ''}`} onClick={() => setActiveTab('actividades')}>
                    Actividades
                  </button>
                )}
              </div>

              <div style={{ padding: '1.5rem' }}>
                {activeTab === 'datos' && (
                  <form id="area-form" onSubmit={handleSubmit} className="animate-fade-in">
                    <div className="input-group">
                      <label>Proyecto *</label>
                      <select
                        className="input" required
                        value={form.proyecto_id}
                        onChange={(e) => setForm({ ...form, proyecto_id: e.target.value })}
                      >
                        <option value="">Seleccione un proyecto</option>
                        {proyectos.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="modal-form-grid">
                      <div className="input-group">
                        <label>Nombre *</label>
                        <input
                          className="input" required
                          value={form.nombre}
                          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                          placeholder="Nombre del sector"
                        />
                      </div>
                      <div className="input-group">
                        <label>Código *</label>
                        <input
                          className="input" required
                          value={form.codigo}
                          onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                          placeholder="SEC-001"
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Descripción</label>
                      <textarea
                        className="input" rows={3}
                        value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        placeholder="Descripción del sector..."
                      />
                    </div>

                    <div className="modal-form-grid">
                      <div className="input-group">
                        <label>Tipo de Área</label>
                        <input
                          className="input"
                          value={form.tipo_area}
                          onChange={(e) => setForm({ ...form, tipo_area: e.target.value })}
                          placeholder="Taller, Almacén, Frente..."
                        />
                      </div>
                      <div className="input-group">
                        <label>Nivel de Riesgo</label>
                        <select
                          className="input"
                          value={form.nivel_riesgo}
                          onChange={(e) => setForm({ ...form, nivel_riesgo: e.target.value })}
                        >
                          <option value="bajo">Bajo</option>
                          <option value="medio">Medio</option>
                          <option value="alto">Alto</option>
                        </select>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'integrantes' && (
                  <div className="animate-fade-in">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      Selecciona los usuarios (Supervisores/Prevencionistas) que tendrán acceso a este sector.
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

                {activeTab === 'actividades' && editingArea && (
                  <div className="animate-fade-in">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      Define las actividades de obra para este sector y asigna qué formularios se usarán en cada una.
                    </p>

                    {/* Actividades list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
                      {actividades.length === 0 && !showActividadForm && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                          <ClipboardList size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                          <p>No hay actividades definidas en este sector</p>
                        </div>
                      )}
                      {actividades.map(act => (
                        <div key={act.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{act.nombre}</strong>
                              {act.descripcion && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{act.descripcion}</p>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button type="button" className="btn btn-icon btn-ghost btn-sm" onClick={() => {
                                setEditingActividad(act);
                                setActividadForm({
                                  nombre: act.nombre,
                                  descripcion: act.descripcion || '',
                                  formulario_ids: act.formularios?.map(f => f.id) || [],
                                });
                                setShowActividadForm(true);
                              }}>
                                <Edit2 size={14} />
                              </button>
                              <button type="button" className="btn btn-icon btn-ghost btn-sm" style={{ color: 'var(--danger-500)' }} onClick={() => handleDeleteActividad(act.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {act.formularios && act.formularios.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                              {act.formularios.map(f => (
                                <span key={f.id} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>📄 {f.codigo} - {f.nombre}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* New/Edit actividad form */}
                    {showActividadForm ? (
                      <div style={{ padding: '1rem', border: '2px solid var(--primary-500)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>{editingActividad ? 'Editar Actividad' : 'Nueva Actividad'}</h4>
                        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Nombre de la Actividad *</label>
                          <input
                            className="input input-sm"
                            value={actividadForm.nombre}
                            onChange={(e) => setActividadForm({ ...actividadForm, nombre: e.target.value })}
                            placeholder="Ej: Instalación de Gabinetes"
                          />
                        </div>
                        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Descripción (opcional)</label>
                          <input
                            className="input input-sm"
                            value={actividadForm.descripcion}
                            onChange={(e) => setActividadForm({ ...actividadForm, descripcion: e.target.value })}
                            placeholder="Detalles de la actividad..."
                          />
                        </div>
                        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Formularios que se usarán en esta actividad</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {allForms.map(f => (
                              <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', border: '1px solid var(--border)', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem', background: actividadForm.formulario_ids.includes(f.id) ? 'var(--primary-50)' : 'transparent' }}>
                                <input
                                  type="checkbox"
                                  checked={actividadForm.formulario_ids.includes(f.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setActividadForm({ ...actividadForm, formulario_ids: [...actividadForm.formulario_ids, f.id] });
                                    else setActividadForm({ ...actividadForm, formulario_ids: actividadForm.formulario_ids.filter(id => id !== f.id) });
                                  }}
                                />
                                <strong>{f.codigo}</strong> — {f.nombre}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowActividadForm(false); setEditingActividad(null); }}>Cancelar</button>
                          <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveActividad} disabled={savingActividad}>
                            {savingActividad ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                            {editingActividad ? 'Actualizar' : 'Crear Actividad'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => {
                        setEditingActividad(null);
                        setActividadForm({ nombre: '', descripcion: '', formulario_ids: [] });
                        setShowActividadForm(true);
                      }}>
                        <Plus size={16} /> Agregar Actividad
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
              {(activeTab === 'datos' || activeTab === 'integrantes') && (
                <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : null}
                  {editingArea ? 'Guardar Cambios' : 'Crear Sector'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

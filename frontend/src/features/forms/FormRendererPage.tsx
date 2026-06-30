import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, MapPin, MapPinOff, Users,
  Plus, Trash2, Loader2, FileText, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Formulario, Campo, Proyecto, Actividad, Area } from '../../types';
import SignaturePad from '../../components/SignaturePad';
import './FormRendererPage.css';

interface FieldValue {
  campo_id: number;
  valor: string;
}

interface Participante {
  nombre: string;
  dni: string;
  cargo: string;
  empresa?: string;
  firma: string | null; // base64
}

export default function FormRendererPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [form, setForm] = useState<Formulario | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [selectedProyecto, setSelectedProyecto] = useState<number | ''>('');
  const [selectedArea, setSelectedArea] = useState<number | ''>('');
  const [selectedActividad, setSelectedActividad] = useState<number | ''>('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<number, string>>({});
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formRes, projRes] = await Promise.all([
        api.get(`/formularios/${id}`),
        api.get('/proyectos')
      ]);
      setForm(formRes.data.data);
      setProyectos(projRes.data.data);
      
    } catch (err) {
      console.error(err);
      navigate('/formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleProyectoChange = async (proyectoId: number) => {
    setSelectedProyecto(proyectoId);
    setSelectedArea('');
    setAreas([]);
    setSelectedActividad('');
    setActividades([]);
    
    // Prefill corporate data
    if (proyectoId) {
      const project = proyectos.find(p => p.id === proyectoId);
      if (project && form?.campos) {
        setFieldValues(prev => {
          const updated = { ...prev };
          form.campos?.forEach(campo => {
            const label = campo.etiqueta.toLowerCase();
            if (label.includes('ruc') && project.ruc) {
              updated[campo.id] = project.ruc;
            } else if ((label.includes('razon social') || label.includes('razón social')) && project.razon_social) {
              updated[campo.id] = project.razon_social;
            } else if ((label.includes('actividad economica') || label.includes('actividad económica')) && project.actividad_economica) {
              updated[campo.id] = project.actividad_economica;
            } else if ((label.includes('lugar') || label.includes('ubicacion') || label.includes('ubicación')) && project.ubicacion) {
              updated[campo.id] = project.ubicacion;
            }
          });
          return updated;
        });
      }

      try {
        const res = await api.get(`/areas`, { params: { proyecto_id: proyectoId, per_page: 100 } });
        setAreas(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAreaChange = async (areaId: number) => {
    setSelectedArea(areaId);
    setSelectedActividad('');
    setActividades([]);
    
    if (areaId) {
      try {
        const res = await api.get(`/areas/${areaId}/actividades`);
        // Filter to only show activities that have this form assigned
        const acts = (res.data.data as Actividad[]).filter(
          a => a.formularios?.some(f => f.id === form?.id)
        );
        setActividades(acts);
        if (acts.length === 1) setSelectedActividad(acts[0].id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const requestGeolocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGpsLoading(false);
        },
        (error) => {
          setGpsError('Error obteniendo ubicación. Asegúrate de dar permisos.');
          setGpsLoading(false);
          console.error(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsError('La geolocalización no está soportada en este navegador.');
      setGpsLoading(false);
    }
  };

  const handleFieldChange = (campoId: number, valor: string) => {
    setFieldValues(prev => ({ ...prev, [campoId]: valor }));
  };

  const addParticipante = () => {
    setParticipantes(prev => [...prev, { nombre: '', dni: '', cargo: '', firma: null }]);
  };

  const updateParticipante = (index: number, field: keyof Participante, value: string | null) => {
    setParticipantes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeParticipante = (index: number) => {
    setParticipantes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !selectedProyecto) return;

    if (form.requiere_geolocalizacion && !gps) {
      alert('Debes capturar tu ubicación GPS primero.');
      return;
    }

    if (form.requiere_participantes && participantes.length === 0) {
      alert('Debes agregar al menos un participante.');
      return;
    }

    // Validate signatures
    const missingSignatures = participantes.some(p => !p.firma);
    if (missingSignatures) {
      alert('Todos los participantes deben firmar el documento.');
      return;
    }

    setSubmitting(true);

    try {
      // Map fieldValues record to array of objetos
      const detalles = Object.entries(fieldValues).map(([campoId, valor]) => ({
        campo_id: Number(campoId),
        valor
      }));

      const payload = {
        formulario_id: form.id,
        proyecto_id: selectedProyecto,
        area_id: selectedArea,
        actividad_id: selectedActividad || null,
        latitud: gps?.lat,
        longitud: gps?.lng,
        detalles,
        participantes
      };

      await api.post('/respuestas', payload);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Error al enviar el formulario. Verifica los campos requeridos.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="renderer-loading">
        <Loader2 className="spin" size={32} />
        <p>Cargando formato...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="renderer-success animate-fade-in">
        <div className="card text-center" style={{ padding: '4rem 2rem', maxWidth: 500, margin: '2rem auto' }}>
          <CheckCircle2 size={64} className="text-success mx-auto" style={{ marginBottom: '1rem', color: 'var(--success-500)' }} />
          <h2>¡Formulario Enviado!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Tu registro ha sido guardado exitosamente y ha entrado en flujo de aprobación.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/formularios')}>
              Volver a Formularios
            </button>
            <button className="btn btn-primary" onClick={() => {
              setSuccess(false);
              setFieldValues({});
              setParticipantes([]);
              setGps(null);
            }}>
              Llenar de Nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-renderer animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-icon btn-ghost" onClick={() => navigate('/formularios')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>{form?.nombre}</h1>
            <p className="page-header-subtitle">{form?.codigo}</p>
          </div>
        </div>
      </div>

      <div className="renderer-content">
        <div className="card renderer-card">
          <form onSubmit={handleSubmit}>
            
            {/* Contexto General */}
            <div className="form-section">
              <h3 className="section-title">Contexto General</h3>
              <div className="input-group">
                <label>Proyecto / Obra *</label>
                <select 
                  className="input" 
                  required
                  value={selectedProyecto}
                  onChange={(e) => handleProyectoChange(Number(e.target.value))}
                >
                  <option value="">Seleccionar proyecto...</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {selectedProyecto !== '' && (
                <div className="input-group">
                  <label>Área / Sector *</label>
                  <select 
                    className="input" 
                    required
                    value={selectedArea}
                    onChange={(e) => handleAreaChange(Number(e.target.value))}
                  >
                    <option value="">Seleccionar área...</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                  {areas.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Este proyecto no tiene áreas registradas.
                    </p>
                  )}
                </div>
              )}

              {selectedArea !== '' && (
                <div className="input-group">
                  <label>Actividad *</label>
                  <select 
                    className="input" 
                    required
                    value={selectedActividad}
                    onChange={(e) => setSelectedActividad(Number(e.target.value))}
                  >
                    <option value="">Seleccionar actividad...</option>
                    {actividades.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                  {actividades.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Este sector no tiene actividades definidas que usen este formulario.
                    </p>
                  )}
                </div>
              )}

              {form?.requiere_geolocalizacion && (
                <div className="input-group gps-group">
                  <label>Ubicación GPS *</label>
                  <div className="gps-controls">
                    {gps ? (
                      <div className="gps-status success">
                        <MapPin size={18} />
                        <span>Capturado: {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</span>
                      </div>
                    ) : (
                      <div className="gps-status warning">
                        <MapPinOff size={18} />
                        <span>Ubicación requerida</span>
                      </div>
                    )}
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={requestGeolocation}
                      disabled={gpsLoading}
                    >
                      {gpsLoading ? <Loader2 className="spin" size={16} /> : <MapPin size={16} />}
                      {gps ? 'Actualizar GPS' : 'Capturar GPS'}
                    </button>
                  </div>
                  {gpsError && <p className="text-error" style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--danger-500)' }}>{gpsError}</p>}
                </div>
              )}
            </div>

            {/* Campos Dinámicos */}
            {form?.campos && form.campos.length > 0 && (
              <div className="form-section">
                <h3 className="section-title">Detalles del Registro</h3>
                <div className="dynamic-fields">
                  {form.campos.map(campo => (
                    <div key={campo.id} className="input-group">
                      <label>
                        {campo.etiqueta} {campo.obligatorio && '*'}
                      </label>
                      
                      {(campo.etiqueta.toLowerCase().includes('capacitador') || campo.etiqueta.toLowerCase().includes('entrenador')) ? (
                        <select
                          className="input"
                          required={campo.obligatorio}
                          value={fieldValues[campo.id] || ''}
                          onChange={(e) => handleFieldChange(campo.id, e.target.value)}
                        >
                          <option value="">Seleccionar integrante del proyecto...</option>
                          {proyectos.find(p => p.id === selectedProyecto)?.usuarios?.map(u => (
                            <option key={u.id} value={u.name}>{u.name}</option>
                          ))}
                        </select>
                      ) : campo.tipo === 'textarea' ? (
                        <textarea
                          className="input"
                          rows={3}
                          required={campo.obligatorio}
                          value={fieldValues[campo.id] || ''}
                          onChange={(e) => handleFieldChange(campo.id, e.target.value)}
                        />
                      ) : campo.tipo === 'select' ? (
                        <select
                          className="input"
                          required={campo.obligatorio}
                          value={fieldValues[campo.id] || ''}
                          onChange={(e) => handleFieldChange(campo.id, e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {campo.opciones?.map(opt => (
                            <option key={opt.id} value={opt.valor}>{opt.etiqueta}</option>
                          ))}
                        </select>
                      ) : campo.tipo === 'multiselect' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                          {campo.opciones?.map(opt => {
                            const currentValues = fieldValues[campo.id] ? fieldValues[campo.id].split(',') : [];
                            const isChecked = currentValues.includes(opt.valor);
                            return (
                              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    let newValues = [...currentValues];
                                    if (e.target.checked) newValues.push(opt.valor);
                                    else newValues = newValues.filter(v => v !== opt.valor);
                                    handleFieldChange(campo.id, newValues.filter(Boolean).join(','));
                                  }}
                                  style={{ width: '16px', height: '16px' }}
                                />
                                {opt.etiqueta}
                              </label>
                            );
                          })}
                        </div>
                      ) : campo.tipo === 'firma' ? (
                        <div className="dynamic-signature">
                          <SignaturePad 
                            width={500} 
                            height={200}
                            onSignatureChange={(sig) => handleFieldChange(campo.id, sig || '')} 
                          />
                        </div>
                      ) : (
                        <input
                          type={
                            campo.etiqueta.toLowerCase().includes('hora') ? 'time' :
                            campo.tipo === 'number' ? 'number' : 
                            campo.tipo === 'date' ? 'date' : 
                            'text'
                          }
                          className="input"
                          required={campo.obligatorio}
                          value={fieldValues[campo.id] || ''}
                          onChange={(e) => handleFieldChange(campo.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participantes */}
            {form?.requiere_participantes && (
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Participantes (Firmas de Campo)</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addParticipante}>
                    <Plus size={16} /> Agregar Trabajador
                  </button>
                </div>
                
                {participantes.length === 0 ? (
                  <div className="empty-participantes">
                    <Users size={32} />
                    <p>No hay participantes registrados.</p>
                  </div>
                ) : (
                  <div className="participantes-list">
                    {participantes.map((p, index) => (
                      <div key={index} className="participante-card">
                        <div className="participante-header">
                          <h4>Trabajador {index + 1}</h4>
                          <button 
                            type="button" 
                            className="btn btn-icon btn-ghost text-danger"
                            onClick={() => removeParticipante(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="participante-fields">
                          <div className="input-group">
                            <label>DNI *</label>
                            <input 
                              className="input" required
                              value={p.dni}
                              onChange={(e) => updateParticipante(index, 'dni', e.target.value)}
                            />
                          </div>
                          <div className="input-group" style={{ flex: 2 }}>
                            <label>Nombres y Apellidos *</label>
                            <input 
                              className="input" required
                              value={p.nombre}
                              onChange={(e) => updateParticipante(index, 'nombre', e.target.value)}
                            />
                          </div>
                          <div className="input-group">
                            <label>Cargo / Área</label>
                            <input 
                              className="input"
                              value={p.cargo}
                              onChange={(e) => updateParticipante(index, 'cargo', e.target.value)}
                            />
                          </div>
                          <div className="input-group">
                            <label>Empresa</label>
                            <input 
                              className="input"
                              value={p.empresa || ''}
                              onChange={(e) => updateParticipante(index, 'empresa', e.target.value)}
                              placeholder="Ej: TACTICAL IT"
                            />
                          </div>
                        </div>
                        <div className="participante-signature">
                          <label>Firma *</label>
                          <SignaturePad 
                            width={340} height={120}
                            onSignatureChange={(sig) => updateParticipante(index, 'firma', sig)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="renderer-footer">
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/formularios')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                Enviar Registro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

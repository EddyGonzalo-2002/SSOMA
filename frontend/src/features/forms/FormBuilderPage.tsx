import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, ArrowLeft, Plus } from 'lucide-react';
import api from '../../services/api';
import type { Formulario, Campo } from '../../types';
import './FormBuilderPage.css';

export default function FormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proyectos, setProyectos] = useState<{id: number, nombre: string}[]>([]);

  useEffect(() => {
    loadProjects();
    if (id && id !== 'nuevo') {
      loadForm();
    } else {
      setLoading(false);
      // Initialize empty form
      setForm({
        id: 0,
        nombre: 'Nuevo Formulario',
        codigo: 'FRM-' + Math.floor(Math.random() * 10000),
        estado: 'borrador',
        proyecto_id: 1, // Defaulting
        requiere_geolocalizacion: false,
        requiere_participantes: false,
        campos: []
      } as unknown as Formulario);
    }
  }, [id]);

  const loadProjects = async () => {
    try {
      const res = await api.get('/proyectos');
      setProyectos(res.data.data);
    } catch (err) {
      console.error('Error loading projects', err);
    }
  };

  const loadForm = async () => {
    try {
      const res = await api.get(`/formularios/${id}`);
      setForm(res.data.data);
    } catch (err) {
      console.error(err);
      navigate('/formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      if (id === 'nuevo') {
        const res = await api.post('/formularios', form);
        navigate(`/formularios/${res.data.data.id}/editar`);
      } else {
        await api.put(`/formularios/${id}`, form);
        await api.put(`/formularios/${id}/campos`, { campos: form.campos || [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    if (!form) return;
    const newField: Campo = {
      id: Math.random(), // temp id
      formulario_id: form.id,
      etiqueta: 'Nuevo Campo',
      nombre_campo: 'campo_' + Math.floor(Math.random() * 1000),
      tipo: 'text',
      obligatorio: false,
      orden: (form.campos?.length || 0) + 1,
    };
    setForm({ ...form, campos: [...(form.campos || []), newField] });
  };

  if (loading) {
    return (
      <div className="builder-loading">
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

  return (
    <div className="form-builder animate-fade-in">
      <div className="builder-header">
        <div className="builder-header-left">
          <button className="btn btn-icon btn-ghost" onClick={() => navigate('/formularios')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2>{form?.nombre}</h2>
            <p>{form?.codigo}</p>
          </div>
        </div>
        <div className="builder-header-right">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
            Guardar Formato
          </button>
        </div>
      </div>

      <div className="builder-content">
        <div className="builder-canvas">
          {form?.campos?.length === 0 ? (
            <div className="empty-canvas">
              <p>No hay campos configurados</p>
              <button className="btn btn-secondary" onClick={addField}>
                <Plus size={16} /> Agregar Primer Campo
              </button>
            </div>
          ) : (
            <div className="fields-list">
              {form?.campos?.map((campo, index) => (
                <div key={campo.id} className="field-item">
                  <div className="field-header">
                    <strong>{campo.etiqueta}</strong>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge badge-neutral">{campo.tipo}</span>
                      <button
                        className="btn btn-icon btn-ghost btn-sm text-danger"
                        onClick={() => {
                          const newCampos = form.campos?.filter(c => c.id !== campo.id);
                          setForm({ ...form, campos: newCampos });
                        }}
                        title="Eliminar campo"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="field-editor" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Etiqueta del Campo</label>
                        <input
                          className="input input-sm"
                          value={campo.etiqueta}
                          onChange={(e) => {
                            const val = e.target.value;
                            const slug = val.toLowerCase()
                                .replace(/[^a-z0-9\s_]/g, '') // Remove special chars
                                .trim()
                                .replace(/\s+/g, '_'); // Replace spaces with underscores
                                
                            const newCampos = [...(form.campos || [])];
                            newCampos[index].etiqueta = val;
                            newCampos[index].nombre_campo = slug || ('campo_' + Math.floor(Math.random() * 1000));
                            setForm({ ...form, campos: newCampos });
                          }}
                        />
                      </div>
                      <div className="input-group" style={{ width: '200px', marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Tipo de Dato</label>
                        <select
                          className="input input-sm"
                          value={campo.tipo}
                          onChange={(e) => {
                            const newCampos = [...(form.campos || [])];
                            newCampos[index].tipo = e.target.value as any;
                            setForm({ ...form, campos: newCampos });
                          }}
                        >
                          <option value="text">Texto Corto</option>
                          <option value="textarea">Texto Largo</option>
                          <option value="number">Número</option>
                          <option value="date">Fecha</option>
                          <option value="select">Lista (Unica Opción)</option>
                          <option value="multiselect">Selección Múltiple (Checkboxes)</option>
                          <option value="foto">Fotografía</option>
                          <option value="firma">Firma Digital</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id={`req-${campo.id}`}
                        checked={campo.obligatorio}
                        onChange={(e) => {
                          const newCampos = [...(form.campos || [])];
                          newCampos[index].obligatorio = e.target.checked;
                          setForm({ ...form, campos: newCampos });
                        }}
                      />
                      <label htmlFor={`req-${campo.id}`} style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                        Campo obligatorio
                      </label>
                    </div>

                    {(campo.tipo === 'select' || campo.tipo === 'multiselect') && (
                      <div className="options-editor" style={{ marginTop: '8px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>Opciones del Desplegable</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(campo.opciones || []).map((opt, optIndex) => (
                            <div key={opt.id || optIndex} style={{ display: 'flex', gap: '8px' }}>
                              <input
                                className="input input-sm"
                                placeholder="Valor"
                                value={opt.valor}
                                onChange={(e) => {
                                  const newCampos = [...(form.campos || [])];
                                  if (!newCampos[index].opciones) newCampos[index].opciones = [];
                                  newCampos[index].opciones[optIndex].valor = e.target.value;
                                  newCampos[index].opciones[optIndex].etiqueta = e.target.value; // keep them same for simplicity
                                  setForm({ ...form, campos: newCampos });
                                }}
                              />
                              <button 
                                className="btn btn-icon btn-ghost btn-sm text-danger"
                                onClick={() => {
                                  const newCampos = [...(form.campos || [])];
                                  newCampos[index].opciones = newCampos[index].opciones?.filter((_, i) => i !== optIndex);
                                  setForm({ ...form, campos: newCampos });
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ alignSelf: 'flex-start' }}
                            onClick={() => {
                              const newCampos = [...(form.campos || [])];
                              if (!newCampos[index].opciones) newCampos[index].opciones = [];
                              newCampos[index].opciones.push({ valor: '', etiqueta: '' } as any);
                              setForm({ ...form, campos: newCampos });
                            }}
                          >
                            + Agregar Opción
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost" onClick={addField} style={{ width: '100%', marginTop: '1rem' }}>
                <Plus size={16} /> Agregar Campo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

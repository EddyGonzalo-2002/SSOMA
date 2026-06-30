import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import type { Proyecto, Area, Actividad, Usuario } from '../../../types';
import SignaturePad from '../../../components/SignaturePad';
import './CustomFormRenderer.css';

interface Participante {
  nombre: string;
  dni: string;
  cargo: string;
  empresa: string;
  firma: string | null;
}

const TIPO_OPCIONES = [
  'Inducción', 'Capacitación', 'Entrenamiento',
  'Charla 5 minutos', 'Simulacro de Emergencia', 'Otros',
];

export default function For067RendererPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);

  const [selectedProyecto, setSelectedProyecto] = useState<number | ''>('');
  const [selectedArea, setSelectedArea] = useState<number | ''>('');
  const [selectedActividad, setSelectedActividad] = useState<number | ''>('');
  const [usuariosProyecto, setUsuariosProyecto] = useState<Usuario[]>([]);

  // Campos específicos
  const [numTrabajadores, setNumTrabajadores] = useState('');
  const [lugarEmpleador, setLugarEmpleador] = useState('Lima');
  const [lugarCapacitacion, setLugarCapacitacion] = useState('');
  const [capacitadores, setCapacitadores] = useState('');
  const [tiposActividad, setTiposActividad] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaTermino, setHoraTermino] = useState('');
  const [numHoras, setNumHoras] = useState('');
  const [numParticipantes, setNumParticipantes] = useState('');
  const [temas, setTemas] = useState(['', '', '']);
  const [participantes, setParticipantes] = useState<Participante[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const projRes = await api.get('/proyectos');
      setProyectos(projRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleProyectoChange = async (proyectoId: number) => {
    setSelectedProyecto(proyectoId);
    setSelectedArea(''); setAreas([]);
    setSelectedActividad(''); setActividades([]);
    const proj = proyectos.find(p => p.id === proyectoId);
    if (proj?.ubicacion) setLugarCapacitacion(proj.ubicacion);
    if (proyectoId) {
      try {
        const res = await api.get('/areas', { params: { proyecto_id: proyectoId, per_page: 100 } });
        setAreas(res.data.data);
        
        // Cargar usuarios del proyecto para el selector de capacitador
        const usersRes = await api.get('/usuarios', { params: { proyecto_id: proyectoId, per_page: 100 } });
        setUsuariosProyecto(usersRes.data.data);
      } catch (err) { console.error(err); }
    } else {
      setUsuariosProyecto([]);
      setCapacitadores('');
    }
  };

  const handleAreaChange = async (areaId: number) => {
    setSelectedArea(areaId);
    setSelectedActividad(''); setActividades([]);
    if (areaId) {
      try {
        const res = await api.get(`/areas/${areaId}/actividades`);
        const acts = (res.data.data as Actividad[]).filter(
          a => a.formularios?.some(f => String(f.id) === String(id))
        );
        setActividades(acts);
        if (acts.length === 1) setSelectedActividad(acts[0].id);
      } catch (err) { console.error(err); }
    }
  };

  const toggleTipo = (t: string) =>
    setTiposActividad(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const addParticipante = () =>
    setParticipantes(p => [...p, { nombre: '', dni: '', cargo: '', empresa: '', firma: null }]);
  const removeParticipante = (i: number) =>
    setParticipantes(p => p.filter((_, idx) => idx !== i));
  const updateParticipante = (i: number, field: keyof Participante, val: string | null) =>
    setParticipantes(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProyecto) { alert('Selecciona un proyecto.'); return; }
    if (participantes.some(p => !p.firma)) { alert('Todos los participantes deben firmar.'); return; }

    setSubmitting(true);
    try {
      const datos: Record<string, string> = {
        lugar_empleador: lugarEmpleador,
        num_trabajadores: numTrabajadores,
        lugar_capacitacion: lugarCapacitacion,
        capacitadores,
        tipo_actividad: tiposActividad.join(','),
        hora_inicio: horaInicio,
        hora_termino: horaTermino,
        num_horas: numHoras,
        num_participantes: numParticipantes,
        tema_1: temas[0],
        tema_2: temas[1],
        tema_3: temas[2],
      };

      const payload = {
        formulario_id: Number(id),
        proyecto_id: selectedProyecto,
        area_id: selectedArea || null,
        actividad_id: selectedActividad || null,
        detalles: [],
        datos,
        participantes,
      };

      await api.post('/respuestas', payload);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Error al enviar el formulario.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="cfr-loading"><Loader2 className="spin" size={32} /><p>Cargando...</p></div>
  );

  if (success) return (
    <div className="cfr-success animate-fade-in">
      <div className="card text-center" style={{ padding: '4rem 2rem', maxWidth: 500, margin: '2rem auto' }}>
        <CheckCircle2 size={64} style={{ color: 'var(--success-500)', marginBottom: '1rem' }} />
        <h2>¡Registro Enviado!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          El registro de capacitación ha sido guardado y está en flujo de aprobación.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/formularios')}>Volver</button>
          <button className="btn btn-primary" onClick={() => { setSuccess(false); setParticipantes([]); }}>Nuevo Registro</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cfr-page animate-fade-in">
      <div className="cfr-header">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate('/formularios')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Registro de Actividades de SST</h1>
          <p className="cfr-subtitle">SST-FOR-067 · Capacitaciones, Inducciones y Charlas · Versión: 01</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cfr-form">

        {/* ── DATOS DEL EMPLEADOR ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#5ab4e5', color: '#fff' }}>DATOS DEL EMPLEADOR</div>
          <div className="cfr-grid-2">
            <div className="cfr-field-readonly">
              <label>Razón Social</label>
              <div className="cfr-readonly-val">TACTICAL IT</div>
            </div>
            <div className="cfr-field-readonly">
              <label>RUC</label>
              <div className="cfr-readonly-val">20545318561</div>
            </div>
            <div className="cfr-field" style={{ gridColumn: 'span 2' }}>
              <label>Actividad Económica</label>
              <div className="cfr-readonly-val">Actividades de arquitectura e ingeniería y comunicaciones</div>
            </div>
            <div className="cfr-field">
              <label>Lugar del Empleador</label>
              <input className="input" value={lugarEmpleador} onChange={e => setLugarEmpleador(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>N° de Trabajadores</label>
              <input type="number" className="input" value={numTrabajadores} onChange={e => setNumTrabajadores(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── DATOS GENERALES ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#5ab4e5', color: '#fff' }}>DATOS GENERALES</div>
          <div className="cfr-grid-2">
            <div className="cfr-field" style={{ gridColumn: 'span 2' }}>
              <label>Proyecto *</label>
              <select className="input" required value={selectedProyecto}
                onChange={e => handleProyectoChange(Number(e.target.value))}>
                <option value="">Seleccionar...</option>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="cfr-field">
              <label>Área / Sector</label>
              <select className="input" value={selectedArea}
                onChange={e => handleAreaChange(Number(e.target.value))}>
                <option value="">Seleccionar área...</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="cfr-field">
              <label>Actividad</label>
              <select className="input" value={selectedActividad}
                onChange={e => setSelectedActividad(Number(e.target.value))}>
                <option value="">Seleccionar actividad...</option>
                {actividades.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="cfr-field">
              <label>Lugar de Capacitación</label>
              <input className="input" value={lugarCapacitacion} onChange={e => setLugarCapacitacion(e.target.value)} />
            </div>
            <div className="cfr-field" style={{ gridColumn: 'span 2' }}>
              <label>Nombre del (los) Capacitador(es) / Entrenador(es)</label>
              <select className="input" value={capacitadores} onChange={e => setCapacitadores(e.target.value)}>
                <option value="">Seleccionar capacitador...</option>
                {usuariosProyecto.map(u => (
                  <option key={u.id} value={u.name}>{u.name} {u.cargo ? `- ${u.cargo}` : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── TIPO ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#5ab4e5', color: '#fff' }}>TIPO DE ACTIVIDAD</div>
          <div className="cfr-permisos-grid">
            {TIPO_OPCIONES.map(t => (
              <label key={t} className={`cfr-permiso-item ${tiposActividad.includes(t) ? 'active' : ''}`}>
                <input type="checkbox" checked={tiposActividad.includes(t)} onChange={() => toggleTipo(t)} />
                <span className="cfr-permiso-check"></span>
                {t}
              </label>
            ))}
          </div>
          <div className="cfr-grid-4" style={{ marginTop: '1rem' }}>
            <div className="cfr-field">
              <label>Hora de Inicio</label>
              <input type="time" className="input" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>Hora de Término</label>
              <input type="time" className="input" value={horaTermino} onChange={e => setHoraTermino(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>N° de Horas</label>
              <input type="number" step="0.5" className="input" value={numHoras} onChange={e => setNumHoras(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>N° de Participantes</label>
              <input type="number" className="input" value={numParticipantes} onChange={e => setNumParticipantes(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── TEMAS ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#ddd', color: '#000' }}>TEMAS ESPECÍFICOS</div>
          {temas.map((t, i) => (
            <div key={i} className="cfr-field" style={{ marginBottom: '0.75rem' }}>
              <label>Tema {i + 1}</label>
              <input className="input" value={t}
                onChange={e => setTemas(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                placeholder={`Describir tema ${i + 1}...`} />
            </div>
          ))}
        </div>

        {/* ── ASISTENTES Y FIRMAS ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#5ab4e5', color: '#fff' }}>ASISTENTES</div>
          <div className="cfr-participantes-header">
            <p className="cfr-help-text">Agrega a cada asistente y solicita su firma.</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addParticipante}>
              <Plus size={16} /> Agregar Asistente
            </button>
          </div>

          {participantes.length === 0 ? (
            <div className="cfr-empty-participantes"><p>No hay asistentes registrados aún.</p></div>
          ) : (
            <div className="cfr-participantes-list">
              {participantes.map((p, i) => (
                <div key={i} className="cfr-participante-card">
                  <div className="cfr-participante-header-row">
                    <span className="cfr-participante-num">Asistente {i + 1}</span>
                    <button type="button" className="btn btn-icon btn-ghost" style={{ color: 'var(--danger-500)' }}
                      onClick={() => removeParticipante(i)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="cfr-participante-fields" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                    <div className="cfr-field">
                      <label>DNI *</label>
                      <input className="input" required value={p.dni}
                        onChange={e => updateParticipante(i, 'dni', e.target.value)} />
                    </div>
                    <div className="cfr-field" style={{ gridColumn: 'span 2' }}>
                      <label>Apellidos y Nombres *</label>
                      <input className="input" required value={p.nombre}
                        onChange={e => updateParticipante(i, 'nombre', e.target.value)} />
                    </div>
                    <div className="cfr-field">
                      <label>Cargo / Área</label>
                      <input className="input" value={p.cargo}
                        onChange={e => updateParticipante(i, 'cargo', e.target.value)} />
                    </div>
                    <div className="cfr-field">
                      <label>Empresa</label>
                      <input className="input" value={p.empresa} placeholder="TACTICAL IT"
                        onChange={e => updateParticipante(i, 'empresa', e.target.value)} />
                    </div>
                  </div>
                  <div className="cfr-field">
                    <label>Firma *</label>
                    <SignaturePad width={380} height={120}
                      onSignatureChange={sig => updateParticipante(i, 'firma', sig)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="cfr-footer">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/formularios')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
            Enviar Registro
          </button>
        </div>
      </form>
    </div>
  );
}

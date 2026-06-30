import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import type { Proyecto, Area, Actividad } from '../../../types';
import SignaturePad from '../../../components/SignaturePad';
import './CustomFormRenderer.css';

interface Participante {
  nombre: string;
  dni: string;
  firma: string | null;
}

const EVALUACIONES = [
  '1.- ¿El RIESGO más crítico de la actividad fue identificado (Carga suspendida, trabajo en altura, etc.)?',
  '2.- ¿Evaluó las condiciones del entorno de trabajo (Ej: Niveles de ruido, Espacio disponible, Iluminación, Temperatura, Sup. de trabajo, Desniveles, Polvo, Etc.)?',
  '3.- ¿Identificó los Aspectos Ambientales: derrames de aceite o hidrocarburos, Sustancias Peligrosas, contaminación del aire, generación de residuos y descargas a cursos de agua?',
  '4.- ¿Se identificó el EPP adecuado para la tarea: Casco, Zapatos de seguridad, lentes de seguridad, Guantes, Protectores Auditivos, Arnés de Seguridad, Respirador, ¿Se encuentra en buen estado?',
  '5.- ¿El personal está capacitado para realizar la actividad?',
  '6.- ¿Se coordinó adecuadamente INTERFERENCIAS o interfases con otras actividades y/o operaciones?',
  '7.- ¿Las herramientas, equipos e instalaciones eléctricas, están en condiciones de ser usadas según estándares establecidos y según la codificación de color del mes?',
  '8.- ¿Evaluó la aplicación de bloqueos físicos requeridos para energías peligrosas?',
  '9.- ¿Evaluó el riesgo de incendio y vías de escape disponibles? ¿El área de trabajo se encuentra limpia y ordenada?',
  '10.- ¿Para trabajos en altura evaluó: escalas, escaleras, accesos, líneas de vida, plataformas, andamios, atrapa soga, soga o cordel de perlón?',
  '11.- ¿Los andamios se encuentran aprobados con tarjeta de color verde visible, si se están armando, éstos cuentan con tarjeta roja?',
  '12.- ¿Para trabajos en caliente se cuenta con equipo de extinción de incendio? ¿El equipo de extinción se encuentra en buenas condiciones? ¿Existen Biombos?',
];

const PERMISOS_OPCIONES = [
  'Permiso de Trabajo',
  'Procedimiento Especifico',
  'Capacitacion Especifica',
  'Hojas de SDS',
  'Equipo de Proteccion Colectiva',
  'Otros',
];

const ATS_ROWS = 14;

export default function ATS034RendererPage() {
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

  // Campos específicos del formulario
  const [especialidad, setEspecialidad] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFinal, setHoraFinal] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<Record<number, string>>({});
  const [permisos, setPermisos] = useState<string[]>([]);
  const [comprometido, setComprometido] = useState<'SI' | 'NO' | ''>('');
  const [atsRows, setAtsRows] = useState<Array<{ seq: string; pel: string; rie: string; ctrl: string }>>(
    Array.from({ length: ATS_ROWS }, () => ({ seq: '', pel: '', rie: '', ctrl: '' }))
  );
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [jefeGrupoNombre, setJefeGrupoNombre] = useState('');
  const [jefeGrupoFirma, setJefeGrupoFirma] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const projRes = await api.get('/proyectos');
      setProyectos(projRes.data.data);
    } catch (err) {
      console.error(err);
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
    if (proyectoId) {
      try {
        const res = await api.get('/areas', { params: { proyecto_id: proyectoId, per_page: 100 } });
        setAreas(res.data.data);
      } catch (err) { console.error(err); }
    }
  };

  const handleAreaChange = async (areaId: number) => {
    setSelectedArea(areaId);
    setSelectedActividad('');
    setActividades([]);
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

  const togglePermiso = (p: string) => {
    setPermisos(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const setEvalVal = (i: number, val: string) => {
    setEvaluaciones(prev => ({ ...prev, [i]: prev[i] === val ? '' : val }));
  };

  const updateAtsRow = (i: number, field: string, val: string) => {
    setAtsRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const addParticipante = () => setParticipantes(p => [...p, { nombre: '', dni: '', firma: null }]);
  const removeParticipante = (i: number) => setParticipantes(p => p.filter((_, idx) => idx !== i));
  const updateParticipante = (i: number, field: keyof Participante, val: string | null) => {
    setParticipantes(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProyecto) { alert('Selecciona un proyecto.'); return; }
    if (participantes.some(p => !p.firma)) { alert('Todos los participantes deben firmar.'); return; }

    setSubmitting(true);
    try {
      // Build datos map
      const datos: Record<string, string | string[]> = {
        especialidad, hora_inicio: horaInicio, hora_final: horaFinal,
        permisos_requeridos: permisos,
        comprometido: comprometido,
        jefe_grupo_nombre: jefeGrupoNombre,
        jefe_grupo_firma: jefeGrupoFirma || '',
      };
      for (let i = 1; i <= 12; i++) datos[`eval_${i}`] = evaluaciones[i] || '';
      atsRows.forEach((row, idx) => {
        datos[`ats_seq_${idx + 1}`] = row.seq;
        datos[`ats_pel_${idx + 1}`] = row.pel;
        datos[`ats_rie_${idx + 1}`] = row.rie;
        datos[`ats_ctrl_${idx + 1}`] = row.ctrl;
      });

      const payload = {
        formulario_id: Number(id),
        proyecto_id: selectedProyecto,
        area_id: selectedArea || null,
        actividad_id: selectedActividad || null,
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
        <h2>¡ATS Enviado!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          El registro ha sido guardado y está en flujo de aprobación.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/formularios')}>Volver a Formularios</button>
          <button className="btn btn-primary" onClick={() => { setSuccess(false); setParticipantes([]); }}>Llenar de Nuevo</button>
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
          <h1>Análisis de Trabajo Seguro (ATS)</h1>
          <p className="cfr-subtitle">SST-FOR-034 · Código: SST-FOR-034 · Versión: 01</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cfr-form">

        {/* ── CONTEXTO ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">DATOS GENERALES</div>
          <div className="cfr-grid-3">
            <div className="cfr-field">
              <label>Proyecto / Obra *</label>
              <select className="input" required value={selectedProyecto}
                onChange={e => handleProyectoChange(Number(e.target.value))}>
                <option value="">Seleccionar...</option>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="cfr-field">
              <label>Sector de Trabajo</label>
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
              <label>Especialidad</label>
              <input className="input" value={especialidad} onChange={e => setEspecialidad(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>Hora de Inicio</label>
              <input type="time" className="input" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>Hora Final</label>
              <input type="time" className="input" value={horaFinal} onChange={e => setHoraFinal(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── EVALUACIÓN ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">*MARCAR SI, NO, N/A SEGÚN CORRESPONDA</div>
          <div className="cfr-eval-table-wrapper">
            <table className="cfr-table cfr-eval-table">
              <thead>
                <tr>
                  <th style={{ width: '44%' }}>Pregunta</th>
                  <th style={{ width: '6%' }}>Resp.</th>
                  <th style={{ width: '44%' }}>Pregunta</th>
                  <th style={{ width: '6%' }}>Resp.</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="cfr-eval-text">{EVALUACIONES[i]}</td>
                    <td className="cfr-eval-sel">
                      <select value={evaluaciones[i + 1] || ''} onChange={e => setEvalVal(i + 1, e.target.value)}
                        className="cfr-mini-select">
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </td>
                    <td className="cfr-eval-text">{EVALUACIONES[i + 6]}</td>
                    <td className="cfr-eval-sel">
                      <select value={evaluaciones[i + 7] || ''} onChange={e => setEvalVal(i + 7, e.target.value)}
                        className="cfr-mini-select">
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PERMISOS ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">PROCEDIMIENTOS ESPECIALES Y PERMISOS REQUERIDOS</div>
          <div className="cfr-permisos-grid">
            {PERMISOS_OPCIONES.map(p => (
              <label key={p} className={`cfr-permiso-item ${permisos.includes(p) ? 'active' : ''}`}>
                <input type="checkbox" checked={permisos.includes(p)} onChange={() => togglePermiso(p)} />
                <span className="cfr-permiso-check"></span>
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* ── COMPROMISO ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">SE COMPROMETIO A CUMPLIR CON LAS OBLIGACIONES Y LAS CONSIDERACIONES ESTABLECIDAS</div>
          <div className="cfr-comprometido">
            <label className={`cfr-comprometido-btn ${comprometido === 'SI' ? 'active-yes' : ''}`}>
              <input type="radio" name="comprometido" value="SI" checked={comprometido === 'SI'} onChange={() => setComprometido('SI')} />
              ✓ SI
            </label>
            <label className={`cfr-comprometido-btn ${comprometido === 'NO' ? 'active-no' : ''}`}>
              <input type="radio" name="comprometido" value="NO" checked={comprometido === 'NO'} onChange={() => setComprometido('NO')} />
              ✗ NO
            </label>
          </div>
        </div>

        {/* ── ATS TABLE ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue" style={{ fontSize: '1rem' }}>ANÁLISIS DE TRABAJO SEGURO (ATS)</div>
          <div className="cfr-ats-table-wrapper">
            <table className="cfr-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>SECUENCIA DE LA TAREA</th>
                  <th style={{ width: '25%' }}>PELIGROS (fuente o situación de posible daño)</th>
                  <th style={{ width: '25%' }}>RIESGOS / CONSECUENCIAS (qué puede pasar)</th>
                  <th style={{ width: '30%' }}>MEDIDAS DE CONTROL (qué debemos hacer para minimizar el riesgo)</th>
                </tr>
              </thead>
              <tbody>
                {atsRows.map((row, i) => (
                  <tr key={i}>
                    <td><textarea className="cfr-cell-input" rows={2} value={row.seq} onChange={e => updateAtsRow(i, 'seq', e.target.value)} placeholder={`Paso ${i + 1}`} /></td>
                    <td><textarea className="cfr-cell-input" rows={2} value={row.pel} onChange={e => updateAtsRow(i, 'pel', e.target.value)} /></td>
                    <td><textarea className="cfr-cell-input" rows={2} value={row.rie} onChange={e => updateAtsRow(i, 'rie', e.target.value)} /></td>
                    <td><textarea className="cfr-cell-input" rows={2} value={row.ctrl} onChange={e => updateAtsRow(i, 'ctrl', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PARTICIPANTES & FIRMAS ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">PERSONAL PARTICIPANTE DEL TRABAJO</div>
          <div className="cfr-participantes-header">
            <p className="cfr-help-text">Agrega a cada trabajador que participó en el ATS y solicita su firma.</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addParticipante}>
              <Plus size={16} /> Agregar Trabajador
            </button>
          </div>

          {participantes.length === 0 ? (
            <div className="cfr-empty-participantes">
              <p>No hay participantes. Agrega al menos uno para enviar el formulario.</p>
            </div>
          ) : (
            <div className="cfr-participantes-list">
              {participantes.map((p, i) => (
                <div key={i} className="cfr-participante-card">
                  <div className="cfr-participante-header-row">
                    <span className="cfr-participante-num">Trabajador {i + 1}</span>
                    <button type="button" className="btn btn-icon btn-ghost" style={{ color: 'var(--danger-500)' }}
                      onClick={() => removeParticipante(i)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="cfr-participante-fields">
                    <div className="cfr-field">
                      <label>DNI *</label>
                      <input className="input" required value={p.dni}
                        onChange={e => updateParticipante(i, 'dni', e.target.value)} />
                    </div>
                    <div className="cfr-field" style={{ flex: 2 }}>
                      <label>Nombres y Apellidos *</label>
                      <input className="input" required value={p.nombre}
                        onChange={e => updateParticipante(i, 'nombre', e.target.value)} />
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

        {/* ── FIRMA DEL JEFE DE GRUPO ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">FIRMA DEL JEFE DE GRUPO O CAPATAZ</div>
          <div className="cfr-grid-2">
            <div className="cfr-field">
              <label>Nombres y Apellidos *</label>
              <input className="input" required value={jefeGrupoNombre} onChange={e => setJefeGrupoNombre(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>Firma *</label>
              <SignaturePad width={380} height={120} onSignatureChange={setJefeGrupoFirma} />
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="cfr-footer">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/formularios')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
            Enviar ATS
          </button>
        </div>
      </form>
    </div>
  );
}

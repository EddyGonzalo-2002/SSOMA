import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api';
import type { Proyecto, Area, Actividad } from '../../../types';
import './CustomFormRenderer.css';

type ValType = 'NA' | 'NC' | 'CP' | 'CT' | '';

interface CheckItem {
  label: string;
  val: ValType;
}

const ORG_ITEMS = [
  'En el área de trabajo no existen objetos (insumos, útiles, herramientas, máquinas, mobiliario, materiales, documentos, etc.) inservibles o dañados',
  'En el área de trabajo no existen objetos que pertenezcan a otras áreas y que no sean usados',
  'Se mantiene en el área las cantidades mínimas necesarias de los objetos para su uso normal',
  'Las vías peatonales, escaleras, pasadizos, salidas de emergencia y zonas de equipos de seguridad (extintores, mangueras, etc.) se encuentran despejadas, facilitando el desplazamiento',
];

const ORD_ITEMS = [
  'Todos los objetos tienen una ubicación definida (equipos, mobiliario, útiles, herramientas, materiales, etc.) y se encuentran en dicha ubicación, a menos que estén siendo usados',
  'La ubicación de los objetos se encuentran rotuladas (gabinetes, estantes, racks, etc.) para mantener el orden de los objetos',
  'Las vías peatonales, escaleras, pasadizos y salidas de emergencia se encuentran identificadas y señalizadas',
  'Las áreas se encuentran identificadas (talleres, servicios, almacenes, etc.) e rotuladas',
  'Los paneles o tableros informativos se encuentran ordenados y con información actualizada',
];

const LIM_ITEMS = [
  'El área de trabajo se encuentra limpia (piso, paredes, mobiliario, máquinas, etc.), libre de agua, aceite, petróleo, óxidos, desperdicios y otros',
  'Existen lugares específicos asignados para la acumulación y disposición (de ser necesario) de residuos',
  'Existe un plan de limpieza del área, y los elementos de limpieza están en buen estado',
  'Las infraestructuras de las áreas están en buen estado (iluminación, servicios, paredes, techos, barandas, escaleras, puertas, etc.)',
];

const VALS: ValType[] = ['NA', 'NC', 'CP', 'CT'];

function makeItems(labels: string[]): CheckItem[] {
  return labels.map(label => ({ label, val: '' }));
}

function calcScore(items: CheckItem[]) {
  const scored = items.filter(i => i.val !== '' && i.val !== 'NA');
  const cp = items.filter(i => i.val === 'CP').length;
  const ct = items.filter(i => i.val === 'CT').length;
  const na = items.filter(i => i.val === 'NA').length;
  const nc = items.filter(i => i.val === 'NC').length;
  if (scored.length === 0) return { na, nc, cp, ct, pct: null };
  const pct = Math.round(((cp * 0.5) + (ct * 1)) / scored.length * 100);
  return { na, nc, cp, ct, pct };
}

export default function Formato05RendererPage() {
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

  const [areaEvaluar, setAreaEvaluar] = useState('SEGURIDAD, SALUD OCUPACIONAL Y MEDIO AMBIENTE');
  const [inspector, setInspector] = useState('');

  const [orgItems, setOrgItems] = useState<CheckItem[]>(makeItems(ORG_ITEMS));
  const [ordItems, setOrdItems] = useState<CheckItem[]>(makeItems(ORD_ITEMS));
  const [limItems, setLimItems] = useState<CheckItem[]>(makeItems(LIM_ITEMS));

  const [orgEvidencia, setOrgEvidencia] = useState('');
  const [ordEvidencia, setOrdEvidencia] = useState('');
  const [limEvidencia, setLimEvidencia] = useState('');

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
    if (proyectoId) {
      try {
        const res = await api.get('/areas', { params: { proyecto_id: proyectoId, per_page: 100 } });
        setAreas(res.data.data);
      } catch (err) { console.error(err); }
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

  const setVal = (
    setter: React.Dispatch<React.SetStateAction<CheckItem[]>>,
    index: number,
    val: ValType
  ) => {
    setter(prev => prev.map((item, i) => i === index ? { ...item, val: item.val === val ? '' : val } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProyecto) { alert('Selecciona un proyecto.'); return; }

    setSubmitting(true);
    try {
      const datos: Record<string, string> = {
        area_evaluar: areaEvaluar,
        inspector,
      };
      orgItems.forEach((item, i) => { datos[`org_${i + 1}`] = item.val; });
      ordItems.forEach((item, i) => { datos[`ord_${i + 1}`] = item.val; });
      limItems.forEach((item, i) => { datos[`lim_${i + 1}`] = item.val; });

      datos['org_evidencia'] = orgEvidencia;
      datos['ord_evidencia'] = ordEvidencia;
      datos['lim_evidencia'] = limEvidencia;

      const payload = {
        formulario_id: Number(id),
        proyecto_id: selectedProyecto,
        area_id: selectedArea || null,
        actividad_id: selectedActividad || null,
        detalles: [],
        datos,
        participantes: [],
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

  const orgScore = calcScore(orgItems);
  const ordScore = calcScore(ordItems);
  const limScore = calcScore(limItems);
  const allItems = [...orgItems, ...ordItems, ...limItems];
  const finalScore = calcScore(allItems);

  if (loading) return (
    <div className="cfr-loading"><Loader2 className="spin" size={32} /><p>Cargando...</p></div>
  );

  if (success) return (
    <div className="cfr-success animate-fade-in">
      <div className="card text-center" style={{ padding: '4rem 2rem', maxWidth: 500, margin: '2rem auto' }}>
        <CheckCircle2 size={64} style={{ color: 'var(--success-500)', marginBottom: '1rem' }} />
        <h2>¡Inspección Enviada!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          El check list de orden y limpieza ha sido registrado.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/formularios')}>Volver</button>
          <button className="btn btn-primary" onClick={() => setSuccess(false)}>Nueva Inspección</button>
        </div>
      </div>
    </div>
  );

  const renderCheckRow = (
    item: CheckItem,
    index: number,
    setter: React.Dispatch<React.SetStateAction<CheckItem[]>>,
    groupLength: number,
    evidencia: string,
    setEvidencia: React.Dispatch<React.SetStateAction<string>>
  ) => (
    <tr key={index} className="cfr-check-row">
      <td className="cfr-check-label">{item.label}</td>
      {VALS.map(v => (
        <td key={v} className="cfr-check-cell">
          <button
            type="button"
            className={`cfr-check-btn ${item.val === v ? `cfr-check-${v.toLowerCase()}` : ''}`}
            onClick={() => setVal(setter, index, v)}
            title={v}
          >
            {item.val === v ? '●' : '○'}
          </button>
        </td>
      ))}
      {index === 0 && (
        <td rowSpan={groupLength + 2} style={{ padding: '0.4rem' }}>
          <textarea
            className="input"
            style={{ height: '100%', minHeight: '120px', resize: 'vertical' }}
            placeholder="Describir evidencias o anotaciones..."
            value={evidencia}
            onChange={e => setEvidencia(e.target.value)}
          />
        </td>
      )}
    </tr>
  );

  return (
    <div className="cfr-page animate-fade-in">
      <div className="cfr-header">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate('/formularios')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Check List de Inspección de Orden y Limpieza</h1>
          <p className="cfr-subtitle">FORMATO-05 · Versión: 01</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cfr-form">

        {/* ── DATOS GENERALES ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#0d47a1', color: '#fff' }}>
            DATOS GENERALES
          </div>
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
            <div className="cfr-field" style={{ gridColumn: 'span 2' }}>
              <label>Área a Evaluar</label>
              <input className="input" value={areaEvaluar} onChange={e => setAreaEvaluar(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>Inspector</label>
              <input className="input" value={inspector} onChange={e => setInspector(e.target.value)}
                placeholder="Nombre del inspector..." />
            </div>
          </div>
        </div>

        {/* ── INSTRUCCIONES ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#0d47a1', color: '#fff' }}>CRITERIOS DE EVALUACIÓN</div>
          <div className="cfr-criterios">
            <div className="cfr-criterio cfr-criterio-na"><strong>NA</strong> – No Aplica: el requisito no puede verificarse en el área</div>
            <div className="cfr-criterio cfr-criterio-nc"><strong>NC</strong> – No Cumple: el área no cumple con el requisito</div>
            <div className="cfr-criterio cfr-criterio-cp"><strong>CP</strong> – Cumple Parcialmente: cumple con algunos de los requisitos</div>
            <div className="cfr-criterio cfr-criterio-ct"><strong>CT</strong> – Cumple Totalmente: cumple en su totalidad con el requisito</div>
          </div>
        </div>

        {/* ── MATRIZ EVALUACIÓN ── */}
        <div className="cfr-card">
          <div className="cfr-section-title" style={{ backgroundColor: '#0d47a1', color: '#fff' }}>ASPECTO A EVALUAR</div>
          <div className="cfr-eval-table-wrapper">
            <table className="cfr-table cfr-checklist-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Criterio</th>
                  <th style={{ width: '7%' }} className="cfr-check-header cfr-th-na">NA</th>
                  <th style={{ width: '7%' }} className="cfr-check-header cfr-th-nc">NC (0%)</th>
                  <th style={{ width: '7%' }} className="cfr-check-header cfr-th-cp">CP (50%)</th>
                  <th style={{ width: '7%' }} className="cfr-check-header cfr-th-ct">CT (100%)</th>
                  <th style={{ width: '27%' }}>Evidencias</th>
                </tr>
              </thead>
              <tbody>
                {/* Organización */}
                <tr className="cfr-group-header">
                  <td colSpan={6}>Organización</td>
                </tr>
                {orgItems.map((item, i) => renderCheckRow(item, i, setOrgItems, orgItems.length, orgEvidencia, setOrgEvidencia))}
                <tr className="cfr-score-row">
                  <td className="cfr-score-label">Total</td>
                  <td className="cfr-score-cell">{orgScore.na}</td>
                  <td className="cfr-score-cell">{orgScore.nc}</td>
                  <td className="cfr-score-cell">{orgScore.cp}</td>
                  <td className="cfr-score-cell">{orgScore.ct}</td>
                </tr>
                <tr className="cfr-score-row cfr-pct-row">
                  <td className="cfr-score-label">% de Cumplimiento</td>
                  <td colSpan={4} className="cfr-score-cell">
                    {orgScore.pct !== null ? <strong>{orgScore.pct}%</strong> : <span className="cfr-div-zero">#DIV/0!</span>}
                  </td>
                </tr>

                {/* Orden */}
                <tr className="cfr-group-header">
                  <td colSpan={6}>Orden</td>
                </tr>
                {ordItems.map((item, i) => renderCheckRow(item, i, setOrdItems, ordItems.length, ordEvidencia, setOrdEvidencia))}
                <tr className="cfr-score-row">
                  <td className="cfr-score-label">Total</td>
                  <td className="cfr-score-cell">{ordScore.na}</td>
                  <td className="cfr-score-cell">{ordScore.nc}</td>
                  <td className="cfr-score-cell">{ordScore.cp}</td>
                  <td className="cfr-score-cell">{ordScore.ct}</td>
                </tr>
                <tr className="cfr-score-row cfr-pct-row">
                  <td className="cfr-score-label">% de Cumplimiento</td>
                  <td colSpan={4} className="cfr-score-cell">
                    {ordScore.pct !== null ? <strong>{ordScore.pct}%</strong> : <span className="cfr-div-zero">#DIV/0!</span>}
                  </td>
                </tr>

                {/* Limpieza */}
                <tr className="cfr-group-header">
                  <td colSpan={6}>Limpieza</td>
                </tr>
                {limItems.map((item, i) => renderCheckRow(item, i, setLimItems, limItems.length, limEvidencia, setLimEvidencia))}
                <tr className="cfr-score-row">
                  <td className="cfr-score-label">Total</td>
                  <td className="cfr-score-cell">{limScore.na}</td>
                  <td className="cfr-score-cell">{limScore.nc}</td>
                  <td className="cfr-score-cell">{limScore.cp}</td>
                  <td className="cfr-score-cell">{limScore.ct}</td>
                </tr>
                <tr className="cfr-score-row cfr-pct-row">
                  <td className="cfr-score-label">% de Cumplimiento</td>
                  <td colSpan={4} className="cfr-score-cell">
                    {limScore.pct !== null ? <strong>{limScore.pct}%</strong> : <span className="cfr-div-zero">#DIV/0!</span>}
                  </td>
                </tr>

                {/* TOTAL FINAL */}
                <tr className="cfr-final-row">
                  <td className="cfr-score-label">% FINAL DEL ÁREA</td>
                  <td colSpan={4} className="cfr-score-cell">
                    {finalScore.pct !== null ? <strong style={{ fontSize: '1.1rem' }}>{finalScore.pct}%</strong> : <span className="cfr-div-zero">#DIV/0!</span>}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="cfr-footer">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/formularios')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
            Enviar Check List
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api';
import type { Proyecto } from '../../../types';
import SignaturePad from '../../../components/SignaturePad';
import './CustomFormRenderer.css';

const CRITERIOS = [
  '1. El manómetro indica cargado (zona verde).',
  '2. Acceso libre de obstáculos.',
  '3. Buena Ubicación.',
  '4. Zona y/o extintor numerado.',
  '5. Pictograma de clase de fuego legible',
  '6. Pictograma de clase de forma de uso legible.',
  '7. Etiqueta de carga legible.',
  '8. Indica tipo de carga de agente extintor.',
  '9. Posee colgador para pared.',
  '10. Posee pasador y precinto de seguridad sellado.',
  '11. Manija de acarreo y/o palanca de activación en buen estado.',
  '12. Manguera en buen estado.',
  '13. La tobera, pitón o pistola esta en óptimas condiciones.',
  '14. Abrazadera o sujetador de manguera en buen estado.',
  '15. Cilindro / Botella / Cartucho impulsor en buen estado.',
  '16. Pintura de botella y cartucho impulsor esta en buen estado.',
  '17. Otros'
];

export default function For017RendererPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<number | ''>('');

  // Extintor Details
  const [numExtintor, setNumExtintor] = useState('');
  const [tipoCarga, setTipoCarga] = useState('');
  const [peso, setPeso] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [vencHidro, setVencHidro] = useState('');
  const [vencRecarga, setVencRecarga] = useState('');

  // Inspección (SI / NO)
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  
  // Observaciones
  const [observaciones, setObservaciones] = useState('');

  // Firmas
  const [nombreInspector, setNombreInspector] = useState('');
  const [firmaInspector, setFirmaInspector] = useState<string | null>(null);
  
  const [nombreCapataz, setNombreCapataz] = useState('');
  const [firmaCapataz, setFirmaCapataz] = useState<string | null>(null);

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

  const setRespuesta = (index: number, val: string) => {
    setRespuestas(prev => ({
      ...prev,
      [index]: prev[index] === val ? '' : val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProyecto) { alert('Selecciona un proyecto.'); return; }
    if (!firmaInspector || !firmaCapataz) { alert('Faltan firmas.'); return; }

    setSubmitting(true);
    try {
      const datos: Record<string, string> = {
        num_extintor: numExtintor,
        tipo_carga: tipoCarga,
        peso,
        ubicacion,
        venc_hidro: vencHidro,
        venc_recarga: vencRecarga,
        observaciones,
        nombre_inspector: nombreInspector,
        firma_inspector: firmaInspector || '',
        nombre_capataz: nombreCapataz,
        firma_capataz: firmaCapataz || '',
      };

      // Guardar criterios
      CRITERIOS.forEach((_, i) => {
        datos[`c${i + 1}`] = respuestas[i] || '';
      });

      const payload = {
        formulario_id: Number(id),
        proyecto_id: selectedProyecto,
        datos,
      };

      await api.post('/respuestas', payload);
      setSuccess(true);
    } catch (err: any) {
      console.error(err.response?.data || err);
      const serverMsg = err.response?.data?.message || err.message;
      alert(`Error al enviar el formulario: ${serverMsg}`);
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
        <h2>¡Inspección Registrada!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          El registro de inspección de extintor ha sido guardado y está en flujo de aprobación.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/formularios')}>Volver</button>
          <button className="btn btn-primary" onClick={() => { setSuccess(false); setRespuestas({}); setNumExtintor(''); }}>Nueva Inspección</button>
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
          <h1>Inspección de Extintores</h1>
          <p className="cfr-subtitle">SST-FOR-017 · Versión: 01</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cfr-form">
        
        {/* ── DATOS GENERALES ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">1. DATOS DEL EXTINTOR</div>
          <div className="cfr-grid-2">
            <div className="cfr-field" style={{ gridColumn: 'span 2' }}>
              <label>Obra / Proyecto *</label>
              <select className="input" required value={selectedProyecto}
                onChange={e => setSelectedProyecto(Number(e.target.value))}>
                <option value="">Seleccionar...</option>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            
            <div className="cfr-field">
              <label>N° Extintor *</label>
              <input className="input" required value={numExtintor} onChange={e => setNumExtintor(e.target.value)} placeholder="Ej. EXT-01" />
            </div>
            <div className="cfr-field">
              <label>Ubicación exacta *</label>
              <input className="input" required value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ej. Taller Principal" />
            </div>

            <div className="cfr-field">
              <label>Tipo de Carga y/o Agente</label>
              <select className="input" value={tipoCarga} onChange={e => setTipoCarga(e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="PQS">PQS (Polvo Químico Seco)</option>
                <option value="CO2">CO2 (Dióxido de Carbono)</option>
                <option value="Agua">Agua Presurizada</option>
                <option value="Espuma">Espuma AFFF</option>
                <option value="Acetato">Acetato de Potasio (Clase K)</option>
              </select>
            </div>
            <div className="cfr-field">
              <label>Peso (Kg / Lbs)</label>
              <input className="input" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ej. 6 Kg, 12 Lbs" />
            </div>

            <div className="cfr-field">
              <label>Vencimiento de Prueba Hidrostática</label>
              <input type="date" className="input" value={vencHidro} onChange={e => setVencHidro(e.target.value)} />
            </div>
            <div className="cfr-field">
              <label>Vencimiento de Recarga / Mantenimiento</label>
              <input type="date" className="input" value={vencRecarga} onChange={e => setVencRecarga(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── CHECKLIST ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">2. CRITERIOS DE INSPECCIÓN</div>
          <div className="cfr-eval-table-wrapper">
            <table className="cfr-table cfr-checklist-table">
              <thead>
                <tr>
                  <th style={{ width: '80%' }}>Descripción</th>
                  <th style={{ width: '10%', backgroundColor: 'var(--success-500)', color: 'white' }} className="cfr-check-header">SI</th>
                  <th style={{ width: '10%', backgroundColor: 'var(--danger-500)', color: 'white' }} className="cfr-check-header">NO</th>
                </tr>
              </thead>
              <tbody>
                {CRITERIOS.map((criterio, i) => (
                  <tr key={i} className="cfr-check-row">
                    <td className="cfr-check-label">{criterio}</td>
                    <td className="cfr-check-cell">
                      <button type="button" 
                        className={`cfr-check-btn ${respuestas[i] === 'SI' ? 'cfr-check-si' : ''}`}
                        style={respuestas[i] === 'SI' ? { backgroundColor: 'var(--success-500)', borderColor: 'var(--success-500)', color: 'white' } : {}}
                        onClick={() => setRespuesta(i, 'SI')}>
                        {respuestas[i] === 'SI' ? '✓' : '○'}
                      </button>
                    </td>
                    <td className="cfr-check-cell">
                      <button type="button" 
                        className={`cfr-check-btn ${respuestas[i] === 'NO' ? 'cfr-check-no' : ''}`}
                        style={respuestas[i] === 'NO' ? { backgroundColor: 'var(--danger-500)', borderColor: 'var(--danger-500)', color: 'white' } : {}}
                        onClick={() => setRespuesta(i, 'NO')}>
                        {respuestas[i] === 'NO' ? '✗' : '○'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── OBSERVACIONES ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">3. OBSERVACIONES</div>
          <div className="cfr-field">
            <textarea 
              className="input" 
              rows={4} 
              placeholder="Anota cualquier hallazgo relevante, recomendaciones o acciones a tomar..."
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        {/* ── FIRMAS DE CAMPO ── */}
        <div className="cfr-card">
          <div className="cfr-section-title cfr-blue">4. RESPONSABLES DE LA INSPECCIÓN (CAMPO)</div>
          <div className="cfr-grid-2">
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>Firma del Inspector</h4>
              <div className="cfr-field" style={{ marginBottom: '1rem' }}>
                <label>Nombres y Apellidos *</label>
                <input className="input" required value={nombreInspector} onChange={e => setNombreInspector(e.target.value)} />
              </div>
              <div className="cfr-field">
                <label>Firma *</label>
                <SignaturePad width={380} height={120} onSignatureChange={setFirmaInspector} />
              </div>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>Firma del Capataz / Jefe de Grupo</h4>
              <div className="cfr-field" style={{ marginBottom: '1rem' }}>
                <label>Nombres y Apellidos *</label>
                <input className="input" required value={nombreCapataz} onChange={e => setNombreCapataz(e.target.value)} />
              </div>
              <div className="cfr-field">
                <label>Firma *</label>
                <SignaturePad width={380} height={120} onSignatureChange={setFirmaCapataz} />
              </div>
            </div>

          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Nota: La firma del Prevencionista de Riesgos se solicitará automáticamente en la etapa de validación del sistema.
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div className="cfr-footer">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/formularios')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
            Guardar Inspección
          </button>
        </div>

      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Search, CheckCircle2, Clock, XCircle, FileText, Eye, MapPin, FileDown } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { PaginatedResponse } from '../../types';
import './RespuestasPage.css';

interface RespuestaResumen {
  id: number;
  formulario: { id: number; nombre: string; codigo: string };
  usuario: { id: number; name: string };
  proyecto: { id: number; nombre: string; codigo: string };
  estado_general: 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado';
  fecha: string;
  created_at: string;
}

interface AprobacionPendiente {
  id: number;
  estado: string;
  rol_firma: { id: number; rol: string; nombre_display: string };
  respuesta: RespuestaResumen;
}

export default function RespuestasPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pendientes' | 'todas'>('pendientes');
  
  const [respuestas, setRespuestas] = useState<RespuestaResumen[]>([]);
  const [aprobaciones, setAprobaciones] = useState<AprobacionPendiente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'todas') {
      loadRespuestas();
    } else {
      loadAprobaciones();
    }
  }, [activeTab]);

  const loadRespuestas = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<RespuestaResumen>>('/respuestas');
      setRespuestas(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAprobaciones = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<AprobacionPendiente>>('/aprobaciones/pendientes');
      setAprobaciones(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (aprobacionId: number) => {
    if (!confirm('¿Estás seguro de firmar este documento? Se usará tu firma digital configurada en tu perfil.')) return;
    
    try {
      await api.post(`/aprobaciones/${aprobacionId}/firmar`, { comentario: 'Aprobado vía sistema.' });
      loadAprobaciones(); // refresh list
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al firmar documento.');
    }
  };

  const handleDownloadPdf = async (respuestaId: number, codigo: string) => {
    try {
      const response = await api.get<{filename: string, base64: string}>(`/respuestas/${respuestaId}/pdf?t=${Date.now()}`);
      
      if (!response.data || !response.data.filename) {
        throw new Error("El formato de respuesta del servidor no es válido (posible caché).");
      }
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${response.data.base64}`;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      console.error('Error downloading PDF', e);
      alert(e.response?.data?.message || e.message || 'Error al descargar el PDF. Asegúrate de tener permisos.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprobado': return 'badge-success';
      case 'rechazado': return 'badge-danger';
      case 'en_proceso': return 'badge-info';
      default: return 'badge-warning';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="respuestas-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Respuestas y Aprobaciones</h1>
          <p className="page-header-subtitle">
            Gestiona los registros llenados en campo y firma los pendientes.
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendientes')}
        >
          <Clock size={16} /> Mis Pendientes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'todas' ? 'active' : ''}`}
          onClick={() => setActiveTab('todas')}
        >
          <FileText size={16} /> Todos los Registros
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Cargando datos...
          </div>
        ) : activeTab === 'pendientes' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Proyecto</th>
                  <th>Generado por</th>
                  <th>Rol requerido</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aprobaciones.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No tienes aprobaciones pendientes.</td></tr>
                ) : aprobaciones.map((aprob) => (
                  <tr key={aprob.id}>
                    <td>
                      <div className="resp-form-title">{aprob.respuesta.formulario.nombre}</div>
                      <div className="resp-form-code">{aprob.respuesta.formulario.codigo}</div>
                    </td>
                    <td>{aprob.respuesta.proyecto.nombre}</td>
                    <td>{aprob.respuesta.usuario.name}</td>
                    <td><span className="badge badge-info">{aprob.rol_firma.nombre_display}</span></td>
                    <td>{formatDate(aprob.respuesta.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSign(aprob.id)}
                        >
                          Firmar
                        </button>
                        <button 
                          onClick={() => handleDownloadPdf(aprob.respuesta.id, aprob.respuesta.formulario.codigo)}
                          className="btn btn-icon btn-ghost btn-sm text-primary" 
                          title="Descargar PDF"
                        >
                          <FileDown size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Proyecto</th>
                  <th>Generado por</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {respuestas.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros.</td></tr>
                ) : respuestas.map((resp) => (
                  <tr key={resp.id}>
                    <td>
                      <div className="resp-form-title">{resp.formulario.nombre}</div>
                      <div className="resp-form-code">{resp.formulario.codigo}</div>
                    </td>
                    <td>{resp.proyecto.nombre}</td>
                    <td>{resp.usuario.name}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(resp.estado_general)}`}>
                        {resp.estado_general.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{formatDate(resp.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Ver detalle">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDownloadPdf(resp.id, resp.formulario.codigo)}
                          className="btn btn-icon btn-ghost btn-sm text-primary" 
                          title="Descargar PDF"
                        >
                          <FileDown size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

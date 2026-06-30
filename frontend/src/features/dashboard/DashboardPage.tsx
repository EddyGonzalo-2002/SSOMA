import { useEffect, useState } from 'react';
import {
  FolderKanban, FileText, ClipboardCheck, AlertTriangle,
  TrendingUp, CheckCircle2, Clock, ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';
import './DashboardPage.css';

interface Stats {
  proyectos: number;
  areas: number;
  formularios: number;
  respuestas: number;
  pendientes: number;
  aprobados: number;
}

interface ActividadItem {
  id: number;
  formulario: string;
  codigo: string;
  proyecto: string;
  usuario: string;
  estado: string;
  fecha: string;
}

interface Ratio {
  aprobados: number;
  pendientes: number;
  rechazados: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    proyectos: 0, areas: 0, formularios: 0,
    respuestas: 0, pendientes: 0, aprobados: 0,
  });
  const [actividad, setActividad] = useState<ActividadItem[]>([]);
  const [ratio, setRatio] = useState<Ratio>({ aprobados: 0, pendientes: 0, rechazados: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      const data = res.data.data;
      setStats(data.stats);
      setActividad(data.actividad);
      setRatio(data.ratio);
    } catch {
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Proyectos Activos',
      value: stats.proyectos,
      icon: FolderKanban,
      colorClass: 'stat-icon-blue',
      change: '+2 este mes',
      changeType: 'up' as const,
    },
    {
      label: 'Formularios',
      value: stats.formularios,
      icon: FileText,
      colorClass: 'stat-icon-green',
      change: 'Publicados',
      changeType: 'up' as const,
    },
    {
      label: 'Respuestas Hoy',
      value: stats.respuestas,
      icon: ClipboardCheck,
      colorClass: 'stat-icon-orange',
      change: 'Registros de hoy',
      changeType: 'up' as const,
    },
    {
      label: 'Pendientes Aprobación',
      value: stats.pendientes,
      icon: AlertTriangle,
      colorClass: 'stat-icon-red',
      change: 'Requieren atención',
      changeType: 'down' as const,
    },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-header-subtitle">
            Resumen general del sistema SSOMA
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="stat-card stagger-item animate-slide-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className={`stat-icon ${stat.colorClass}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">
                {loading ? (
                  <div className="skeleton" style={{ width: 60, height: 28 }}></div>
                ) : (
                  stat.value
                )}
              </div>
              <div className={`stat-change stat-change-${stat.changeType}`}>
                {stat.changeType === 'up' ? <TrendingUp size={12} /> : <ArrowUpRight size={12} />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="card dashboard-activity">
          <div className="dashboard-card-header">
            <h3>Actividad Reciente</h3>
            <button className="btn btn-ghost btn-sm">Ver todo</button>
          </div>
          <div className="activity-list">
            {loading ? (
              <div className="skeleton" style={{ height: 100 }}></div>
            ) : actividad.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No hay actividad reciente</p>
            ) : (
              actividad.map((item) => (
                <div key={item.id} className="activity-item">
                  <div className={`activity-icon ${item.estado === 'aprobado' ? 'activity-icon-green' : item.estado === 'pendiente' ? 'activity-icon-orange' : 'activity-icon-blue'}`}>
                    {item.estado === 'aprobado' ? <CheckCircle2 size={16} /> : item.estado === 'pendiente' ? <Clock size={16} /> : <FileText size={16} />}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{item.codigo}</strong> {item.estado === 'pendiente' ? 'pendiente de firma' : item.estado === 'aprobado' ? 'aprobado' : 'registrado'} por {item.usuario}
                    </p>
                    <span className="activity-time">{item.fecha} en {item.proyecto}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card dashboard-quick">
          <div className="dashboard-card-header">
            <h3>Estado de Aprobaciones</h3>
          </div>
          <div className="approval-stats">
            <div className="approval-stat">
              <div className="approval-stat-bar">
                <div className="approval-stat-fill approval-fill-green" style={{ width: `${ratio.aprobados}%` }}></div>
              </div>
              <div className="approval-stat-info">
                <span className="approval-stat-label">Aprobados</span>
                <span className="approval-stat-value">{ratio.aprobados}%</span>
              </div>
            </div>
            <div className="approval-stat">
              <div className="approval-stat-bar">
                <div className="approval-stat-fill approval-fill-orange" style={{ width: `${ratio.pendientes}%` }}></div>
              </div>
              <div className="approval-stat-info">
                <span className="approval-stat-label">Pendientes</span>
                <span className="approval-stat-value">{ratio.pendientes}%</span>
              </div>
            </div>
            <div className="approval-stat">
              <div className="approval-stat-bar">
                <div className="approval-stat-fill approval-fill-red" style={{ width: `${ratio.rechazados}%` }}></div>
              </div>
              <div className="approval-stat-info">
                <span className="approval-stat-label">Rechazados</span>
                <span className="approval-stat-value">{ratio.rechazados}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

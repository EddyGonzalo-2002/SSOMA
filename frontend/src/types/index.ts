// ── Types for ERP SSOMA ──────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  dni: string | null;
  telefono: string | null;
  cargo: string | null;
  avatar: string | null;
  firma_imagen: string | null;
  estado: 'activo' | 'inactivo';
  roles: string[];
  permissions: string[];
  created_at: string;
}

export interface Proyecto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  ubicacion: string | null;
  ruc: string;
  razon_social: string;
  actividad_economica: string | null;
  estado: 'activo' | 'inactivo' | 'finalizado';
  fecha_inicio: string | null;
  fecha_fin: string | null;
  areas_count?: number;
  formularios_count?: number;
  actividades_count?: number;
  respuestas_count?: number;
  usuarios_count?: number;
  areas?: Area[];
  actividades?: Actividad[];
  formularios?: Formulario[];
  usuarios?: User[];
  created_at: string;
  updated_at: string;
}

export interface Actividad {
  id: number;
  area_id: number;
  nombre: string;
  descripcion: string | null;
  estado: 'activa' | 'completada' | 'cancelada';
  fecha_programada: string | null;
  formularios_count?: number;
  respuestas_count?: number;
  formularios?: Formulario[];
  created_at?: string;
  updated_at?: string;
}

export interface Area {
  id: number;
  proyecto_id: number;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  tipo_area?: string;
  nivel_riesgo?: string;
  estado: 'activo' | 'inactivo';
  actividades_count?: number;
  formularios_count?: number;
  usuarios_count?: number;
  proyecto?: Proyecto;
  actividades?: Actividad[];
  created_at: string;
  updated_at: string;
}

export interface Formulario {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  proyecto_id: number;
  area_id: number | null;
  version: number;
  requiere_participantes: boolean;
  requiere_geolocalizacion: boolean;
  estado: 'borrador' | 'publicado' | 'archivado';
  campos?: Campo[];
  roles_firma?: RolFirma[];
}

export interface Campo {
  id: number;
  formulario_id: number;
  etiqueta: string;
  nombre_campo: string;
  tipo: CampoTipo;
  obligatorio: boolean;
  orden: number;
  placeholder: string | null;
  valor_defecto: string | null;
  validaciones: Record<string, unknown> | null;
  configuracion: Record<string, unknown> | null;
  seccion_padre_id: number | null;
  opciones?: OpcionCampo[];
}

export type CampoTipo =
  | 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime'
  | 'select' | 'multiselect' | 'checkbox' | 'radio'
  | 'foto' | 'firma' | 'archivo'
  | 'seccion' | 'geolocalizacion';

export interface OpcionCampo {
  id: number;
  campo_id: number;
  valor: string;
  etiqueta: string;
  orden: number;
}

export interface Respuesta {
  id: number;
  uuid: string;
  formulario_id: number;
  usuario_id: number;
  proyecto_id: number;
  actividad_id: number | null;
  area_id: number | null;
  estado_general: EstadoGeneral;
  fecha: string;
  latitud: number | null;
  longitud: number | null;
  notas: string | null;
  formulario?: Formulario;
  usuario?: User;
  actividad?: Actividad;
  detalles?: DetalleRespuesta[];
  participantes?: Participante[];
  aprobaciones?: Aprobacion[];
  evidencias?: Evidencia[];
}

export type EstadoGeneral = 'borrador' | 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado';

export interface DetalleRespuesta {
  id: number;
  respuesta_id: number;
  campo_id: number;
  valor: string | null;
  valor_archivo: string | null;
}

export interface Participante {
  id: number;
  respuesta_id: number;
  nombre: string;
  dni: string;
  cargo: string | null;
  empresa: string | null;
  firma: string | null; // base64 PNG image
  fecha: string;
}

export interface RolFirma {
  id: number;
  formulario_id: number;
  rol: string;
  nombre_display: string;
  orden: number;
  obligatorio: boolean;
}

export interface Aprobacion {
  id: number;
  respuesta_id: number;
  rol_firma_id: number;
  usuario_id: number | null;
  estado: 'pendiente' | 'firmado' | 'rechazado';
  firma: string | null;
  comentario: string | null;
  fecha: string | null;
  rol_firma?: RolFirma;
  usuario?: User;
}

export interface Evidencia {
  id: number;
  respuesta_id: number;
  url: string;
  nombre_archivo: string;
  tipo: 'foto' | 'documento' | 'video';
  mime_type: string | null;
  tamano_bytes: number | null;
  usuario_id: number;
  latitud: number | null;
  longitud: number | null;
  fecha: string;
}

// ── API Response Types ──────────────────────────────────────────

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

// ── Dashboard Stats ─────────────────────────────────────────────

export interface DashboardStats {
  total_proyectos: number;
  total_formularios: number;
  total_respuestas: number;
  pendientes_aprobacion: number;
  respuestas_hoy: number;
  aprobados_mes: number;
}

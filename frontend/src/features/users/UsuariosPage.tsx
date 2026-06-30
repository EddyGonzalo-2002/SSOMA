import { useEffect, useState } from 'react';
import {
  Plus, Search, Shield, MoreVertical,
  Loader2, Upload, Mail, Phone, CreditCard, PenTool
} from 'lucide-react';
import api from '../../services/api';
import SignaturePad from '../../components/SignaturePad';
import type { User, PaginatedResponse } from '../../types';
import './UsuariosPage.css';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [isEditingSignature, setIsEditingSignature] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    dni: '', telefono: '', cargo: '',
    estado: 'activo', roles: [] as string[],
    firma_imagen: ''
  });

  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, [search]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.buscar = search;

      const response = await api.get<PaginatedResponse<User>>('/usuarios', { params });
      setUsuarios(response.data.data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data.map((r: { name: string }) => r.name));
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      name: '', email: '', password: '',
      dni: '', telefono: '', cargo: '',
      estado: 'activo', roles: [],
      firma_imagen: ''
    });
    setIsEditingSignature(true);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      dni: user.dni || '',
      telefono: user.telefono || '',
      cargo: user.cargo || '',
      estado: user.estado,
      roles: user.roles || [],
      firma_imagen: user.firma_imagen || ''
    });
    setIsEditingSignature(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form };
      if (!payload.password) delete (payload as Record<string, unknown>).password;
      // No enviar firma_imagen en el payload principal
      delete (payload as Record<string, unknown>).firma_imagen;

      let userId;

      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, payload);
        userId = editingUser.id;
      } else {
        const response = await api.post('/usuarios', payload);
        userId = response.data.data.id;
      }

      // Si la firma es nueva (Base64), se sube mediante el endpoint específico
      if (form.firma_imagen && form.firma_imagen.startsWith('data:image')) {
        await api.post(`/usuarios/${userId}/firma`, { firma: form.firma_imagen });
      }

      setShowModal(false);
      loadUsuarios();
    } catch (error) {
      console.error('Error saving usuario:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      loadUsuarios();
    } catch (error) {
      console.error('Error deleting usuario:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: 'badge-danger',
      supervisor: 'badge-info',
      prevencionista: 'badge-warning',
      trabajador: 'badge-success',
    };
    return map[role] || 'badge-neutral';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="usuarios-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p className="page-header-subtitle">
            Gestiona los usuarios y sus roles en el sistema
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="usuarios-search card">
        <div className="header-search">
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Buscar por nombre, email o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>DNI</th>
                <th>Cargo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Firma</th>
                <th style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ width: 200, height: 16 }}></div></td>
                    <td><div className="skeleton" style={{ width: 80, height: 16 }}></div></td>
                    <td><div className="skeleton" style={{ width: 120, height: 16 }}></div></td>
                    <td><div className="skeleton" style={{ width: 80, height: 16 }}></div></td>
                    <td><div className="skeleton" style={{ width: 60, height: 16 }}></div></td>
                    <td><div className="skeleton" style={{ width: 40, height: 16 }}></div></td>
                    <td><div className="skeleton" style={{ width: 60, height: 16 }}></div></td>
                  </tr>
                ))
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuarios.map((user, index) => (
                  <tr key={user.id} className="stagger-item animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="user-cell-name">{user.name}</div>
                          <div className="user-cell-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="user-cell-mono">{user.dni || '—'}</span>
                    </td>
                    <td>{user.cargo || '—'}</td>
                    <td>
                      {user.roles?.map(role => (
                        <span key={role} className={`badge ${getRoleBadge(role)}`}>
                          {role}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span className={`badge ${user.estado === 'activo' ? 'badge-success' : 'badge-neutral'}`}>
                        {user.estado}
                      </span>
                    </td>
                    <td>
                      {user.firma_imagen ? (
                        <span className="badge badge-success">✓</span>
                      ) : (
                        <span className="badge badge-neutral">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {user.firma_imagen && (
                          <button 
                            className="btn btn-icon btn-ghost btn-sm" 
                            onClick={() => setShowSignatureModal(user)} 
                            title="Ver firma"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        <button className="btn btn-icon btn-ghost btn-sm" onClick={() => openEditModal(user)} title="Editar">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="modal-overlay" onClick={() => setShowSignatureModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Firma de {showSignatureModal.name}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowSignatureModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '2rem' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                <img 
                  src={showSignatureModal.firma_imagen || ''} 
                  alt={`Firma de ${showSignatureModal.name}`} 
                  style={{ maxHeight: 200, maxWidth: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="input-group">
                    <label>Nombre completo *</label>
                    <input className="input" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Juan Pérez" />
                  </div>
                  <div className="input-group">
                    <label>DNI</label>
                    <input className="input" value={form.dni}
                      onChange={(e) => setForm({ ...form, dni: e.target.value })}
                      placeholder="12345678" />
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div className="input-group">
                    <label>Email *</label>
                    <input className="input" type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="usuario@empresa.com" />
                  </div>
                  <div className="input-group">
                    <label>{editingUser ? 'Nueva contraseña' : 'Contraseña *'}</label>
                    <input className="input" type="password"
                      required={!editingUser} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••" />
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div className="input-group">
                    <label>Teléfono</label>
                    <input className="input" value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="+51 999 999 999" />
                  </div>
                  <div className="input-group">
                    <label>Cargo</label>
                    <input className="input" value={form.cargo}
                      onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                      placeholder="Supervisor de Seguridad" />
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div className="input-group">
                    <label>Rol</label>
                    <select className="input" value={form.roles[0] || ''}
                      onChange={(e) => setForm({ ...form, roles: e.target.value ? [e.target.value] : [] })}>
                      <option value="">Seleccionar rol</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Estado</label>
                    <select className="input" value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Firma Digital</label>
                    {editingUser && !isEditingSignature && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditingSignature(true)}>
                        <PenTool size={14} style={{ marginRight: 4 }} /> Modificar firma
                      </button>
                    )}
                    {isEditingSignature && editingUser && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditingSignature(false)}>
                        Cancelar edición
                      </button>
                    )}
                  </div>
                  
                  {isEditingSignature ? (
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'center' }}>
                      <SignaturePad width={320} height={160} onSignatureChange={(sig) => setForm({ ...form, firma_imagen: sig || '' })} />
                    </div>
                  ) : (
                    form.firma_imagen ? (
                      <div style={{ background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                        <img src={form.firma_imagen} alt="Firma actual" style={{ maxHeight: 80 }} />
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>No hay firma registrada para este usuario.</p>
                    )
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : null}
                  {editingUser ? 'Actualizar' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

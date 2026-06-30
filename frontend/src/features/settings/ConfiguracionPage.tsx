import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Save, User, Shield, Key, Loader2, Upload } from 'lucide-react';
import SignaturePad from '../../components/SignaturePad';
import api from '../../services/api';
import './ConfiguracionPage.css';

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'perfil' | 'firma' | 'seguridad'>('perfil');
  const [saving, setSaving] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const handleSaveSignature = async () => {
    if (!signature || !user) return;
    setSaving(true);
    try {
      const res = await api.post(`/usuarios/${user.id}/firma`, { firma: signature });
      
      // Update local auth store so the image preview appears immediately
      if (res.data.firma_url) {
        useAuthStore.setState({ 
          user: { ...user, firma_imagen: res.data.firma_url.split('/storage/')[1] } 
        });
      }
      
      alert('Firma guardada exitosamente.');
    } catch (error) {
      console.error(error);
      alert('Error al guardar la firma.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="config-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Configuración</h1>
          <p className="page-header-subtitle">
            Administra tu perfil, firma digital y preferencias del sistema
          </p>
        </div>
      </div>

      <div className="config-layout">
        {/* Sidebar Nav */}
        <div className="config-sidebar card">
          <button 
            className={`config-nav-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <User size={18} /> Mi Perfil
          </button>
          <button 
            className={`config-nav-btn ${activeTab === 'firma' ? 'active' : ''}`}
            onClick={() => setActiveTab('firma')}
          >
            <Upload size={18} /> Firma Digital
          </button>
          <button 
            className={`config-nav-btn ${activeTab === 'seguridad' ? 'active' : ''}`}
            onClick={() => setActiveTab('seguridad')}
          >
            <Key size={18} /> Seguridad
          </button>
        </div>

        {/* Content Area */}
        <div className="config-content">
          {activeTab === 'perfil' && (
            <div className="card config-section animate-fade-in">
              <h2 className="section-title">Información del Perfil</h2>
              <div className="config-form">
                <div className="input-group">
                  <label>Nombre Completo</label>
                  <input className="input" value={user?.name || ''} readOnly disabled />
                </div>
                <div className="input-group">
                  <label>Correo Electrónico</label>
                  <input className="input" value={user?.email || ''} readOnly disabled />
                </div>
                <div className="input-group">
                  <label>Roles Asignados</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {user?.roles?.map(r => (
                      <span key={r} className="badge badge-info">{r}</span>
                    ))}
                  </div>
                </div>
                <p className="text-tertiary" style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                  Para modificar estos datos, por favor contacta al administrador del sistema.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'firma' && (
            <div className="card config-section animate-fade-in">
              <h2 className="section-title">Mi Firma Digital</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                Dibuja tu firma a continuación. Esta firma se utilizará automáticamente cuando apruebes documentos en la bandeja de entrada.
              </p>
              
              {user?.firma_imagen && (
                <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>FIRMA ACTUAL GUARDADA:</p>
                  <img src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${user.firma_imagen}`} alt="Mi Firma" style={{ maxHeight: '100px' }} />
                </div>
              )}
              
              <div className="signature-wrapper">
                <SignaturePad 
                  width={400} 
                  height={200} 
                  onSignatureChange={(sig) => setSignature(sig)} 
                />
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveSignature}
                  disabled={!signature || saving}
                >
                  {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                  Guardar Firma
                </button>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="card config-section animate-fade-in">
              <h2 className="section-title">Seguridad de la Cuenta</h2>
              <div className="config-form" style={{ maxWidth: 400 }}>
                <div className="input-group">
                  <label>Contraseña Actual</label>
                  <input className="input" type="password" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>Nueva Contraseña</label>
                  <input className="input" type="password" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>Confirmar Contraseña</label>
                  <input className="input" type="password" placeholder="••••••••" />
                </div>
                <button className="btn btn-primary">Actualizar Contraseña</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

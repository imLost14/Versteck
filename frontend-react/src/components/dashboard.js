import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import MFASection from './MFASection';
import CredentialForm from './CredentialForm';
import CredentialList from './CredentialList';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCredential, setNewCredential] = useState({
    platform: '',
    username: '',
    email: '',
    password: '',
  });
  const [editCredentialId, setEditCredentialId] = useState(null);
  const [editCredentialData, setEditCredentialData] = useState({
    platform: '',
    username: '',
    email: '',
    password: '',
  });

  // Estados para MFA
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetupQR, setMfaSetupQR] = useState(null);
  const [mfaSecret, setMfaSecret] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaMessage, setMfaMessage] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    fetchUserMfaStatus();
  }, [token]);

  const fetchUserMfaStatus = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/user/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        handleTokenExpired();
        return;
      }
      if (!response.ok) {
        throw new Error('Error al obtener estado MFA');
      }
      const data = await response.json();
      setMfaEnabled(data.mfa_enabled);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTokenExpired = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleSetupMfa = async () => {
    setError(null);
    setMfaMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/mfa/setup/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        handleTokenExpired();
        return;
      }
      if (!response.ok) {
        let errorMessage = 'Error al iniciar configuración MFA';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // No se pudo parsear JSON, mantener mensaje genérico
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setMfaSetupQR(data.qr_code);
      setMfaSecret(data.secret || '');
      setShowMfaSetup(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyMfa = async () => {
    setError(null);
    setMfaMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/mfa/verify/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: mfaCode }),
      });
      if (response.status === 401) {
        handleTokenExpired();
        return;
      }
      if (!response.ok) {
        throw new Error('Código MFA inválido');
      }
      setMfaMessage('MFA activado correctamente');
      setMfaEnabled(true);
      setShowMfaSetup(false);
      setMfaCode('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDisableMfa = async () => {
    setError(null);
    setMfaMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/mfa/setup/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mfa_enabled: false, mfa_secret: null }),
      });
      if (response.status === 401) {
        handleTokenExpired();
        return;
      }
      if (!response.ok) {
        throw new Error('Error al deshabilitar MFA');
      }
      setMfaMessage('MFA deshabilitado correctamente');
      setMfaEnabled(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    setIsAuthenticated(false);
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  const handleFetchCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/credentials/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        handleTokenExpired();
        return;
      }

      if (!response.ok) {
        throw new Error('Error al obtener las credenciales');
      }

      const data = await response.json();

      setCredentials(data);
      setShowCreateForm(false);
      setEditCredentialId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPassword = async (credentialId) => {
    setError(null);
    if (decryptedPasswords[credentialId]) {
      setDecryptedPasswords(prev => {
        const newState = { ...prev };
        delete newState[credentialId];
        return newState;
      });
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/credentials/${credentialId}/decrypt/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        handleTokenExpired();
        return;
      }

      if (!response.ok) {
        throw new Error('Error al desencriptar la contraseña');
      }

      const data = await response.json();

      setDecryptedPasswords(prev => ({
        ...prev,
        [credentialId]: data.decrypted_password,
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(prev => {
      const newState = !prev;
      if (newState) {
        setCredentials([]);
        setEditCredentialId(null);
        setError(null);
      }
      return newState;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCredential(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCredential = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/credentials/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCredential),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      setNewCredential({
        platform: '',
        username: '',
        email: '',
        password: '',
      });
      await handleFetchCredentials();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = async (cred) => {
    setEditCredentialId(cred.id);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/credentials/${cred.id}/decrypt/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al desencriptar la contraseña');
      }

      const data = await response.json();

      setEditCredentialData({
        platform: cred.platform,
        username: cred.username,
        email: cred.email,
        password: data.decrypted_password,
      });
    } catch (err) {
      setError(err.message);
      setEditCredentialData({
        platform: cred.platform,
        username: cred.username,
        email: cred.email,
        password: '',
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCredentialData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditCredentialId(null);
    setEditCredentialData({
      platform: '',
      username: '',
      email: '',
      password: '',
    });
    setError(null);
  };

  const handleSaveEdit = async (id) => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/credentials/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editCredentialData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      setEditCredentialId(null);
      setEditCredentialData({
        platform: '',
        username: '',
        email: '',
        password: '',
      });
      await handleFetchCredentials();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/credentials/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la credencial');
      }
      await handleFetchCredentials();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen w-full py-8 px-4">
      <DashboardHeader
        onFetch={handleFetchCredentials}
        onToggleCreate={toggleCreateForm}
        onLogout={handleLogout}
        loading={loading}
        showCreateForm={showCreateForm}
      />
      <MFASection
        mfaEnabled={mfaEnabled}
        mfaSetupQR={mfaSetupQR}
        mfaSecret={mfaSecret}
        mfaCode={mfaCode}
        showMfaSetup={showMfaSetup}
        mfaMessage={mfaMessage}
        error={error}
        onSetupMfa={handleSetupMfa}
        onVerifyMfa={handleVerifyMfa}
        onDisableMfa={handleDisableMfa}
        onMfaCodeChange={(e) => setMfaCode(e.target.value)}
        onCancelMfaSetup={() => setShowMfaSetup(false)}
      />
      {showCreateForm ? (
        <CredentialForm
          isEditing={false}
          formData={newCredential}
          onInputChange={handleInputChange}
          onSubmit={handleCreateCredential}
        />
      ) : (
        <CredentialList
          credentials={credentials}
          decryptedPasswords={decryptedPasswords}
          editCredentialId={editCredentialId}
          editCredentialData={editCredentialData}
          onEditClick={handleEditClick}
          onViewPassword={handleViewPassword}
          onDelete={handleDelete}
          onEditInputChange={handleEditInputChange}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
        />
      )}
      {error && <p className="text-red-400 mt-6 text-center">{error}</p>}
    </div>
  );
}

export default Dashboard;

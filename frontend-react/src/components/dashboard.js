import React, { useState, useEffect } from 'react';

function Dashboard({ setIsAuthenticated }) {
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
      if (!response.ok) {
        throw new Error('Error al obtener estado MFA');
      }
      const data = await response.json();
      setMfaEnabled(data.mfa_enabled);
    } catch (err) {
      setError(err.message);
    }
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
      setMfaSecret(data.secret);
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
      // Para deshabilitar MFA, se puede hacer un PATCH al usuario para poner mfa_enabled en false y limpiar mfa_secret
      const response = await fetch('http://localhost:8000/api/user/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mfa_enabled: false, mfa_secret: null }),
      });
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
    setShowCreateForm(prev => !prev);
    if (!showCreateForm) {
      setCredentials([]);
      setEditCredentialId(null);
    }
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
    <div>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al Dashboard</h1>
        <p className="text-gray-600 text-lg">
          Contenido protegido solo para usuarios autenticados.
        </p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Autenticación MFA</h2>
          {mfaEnabled ? (
            <div>
              <p className="mb-2 text-green-600">MFA está habilitado en tu cuenta.</p>
              <button
                onClick={handleDisableMfa}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Deshabilitar MFA
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleSetupMfa}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Configurar MFA
              </button>
              {showMfaSetup && (
                <div className="mt-4">
                  <p>Escanea este código QR con tu app autenticadora:</p>
                  <img src={`data:image/png;base64,${mfaSetupQR}`} alt="QR MFA" className="my-2" />
                  <p>O usa este código secreto: <strong>{mfaSecret}</strong></p>
                  <input
                    type="text"
                    placeholder="Ingresa el código MFA"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 mt-2"
                  />
                  <button
                    onClick={handleVerifyMfa}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mt-2"
                  >
                    Verificar y Activar MFA
                  </button>
                </div>
              )}
            </div>
          )}
          {mfaMessage && <p className="text-green-600 mt-2">{mfaMessage}</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>

      <div className="p-3 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-2">
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <button
            onClick={handleFetchCredentials}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
          <button
            onClick={toggleCreateForm}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
          >
            Crear
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {showCreateForm ? (
        <form onSubmit={handleCreateCredential} className="mt-4 max-w-md space-y-4">
          <div>
            <label htmlFor="platform" className="block text-gray-700">Plataforma</label>
            <input
              type="text"
              id="platform"
              name="platform"
              value={newCredential.platform}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-700">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={newCredential.username}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newCredential.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">Contraseña</label>
            <input
              type="text"
              id="password"
              name="password"
              value={newCredential.password}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Guardar Credencial
          </button>
        </form>
      ) : (
        <>
          {loading && <p className="mt-4">Cargando credenciales...</p>}
          {credentials.length > 0 && (
            <ul className="mt-4">
              {credentials.map((cred) => (
                <li key={cred.id} className="border p-2 mb-2 rounded">
                  {editCredentialId === cred.id ? (
                    <>
                      <div>
                        <label className="block text-gray-700">Plataforma</label>
                        <input
                          type="text"
                          name="platform"
                          value={editCredentialData.platform}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Usuario</label>
                        <input
                          type="text"
                          name="username"
                          value={editCredentialData.username}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editCredentialData.email}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Contraseña</label>
                        <input
                          type="text"
                          name="password"
                          value={editCredentialData.password}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveEdit(cred.id)}
                        className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 mr-2"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <strong>Platform/Url:</strong> {cred.platform} <br />
                      <strong>User:</strong> {cred.username} <br />
                      <strong>Email:</strong> {cred.email} <br />
                      <strong>Password:</strong> {decryptedPasswords[cred.id] || '********'}
                      <button
                        onClick={() => handleViewPassword(cred.id)}
                        className="ml-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        {decryptedPasswords[cred.id] ? 'Ocultar Contraseña' : 'Ver Contraseña'}
                      </button>
                      <button
                        onClick={() => handleEditClick(cred)}
                        className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cred.id)}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;

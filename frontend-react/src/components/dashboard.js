import React, { useState } from 'react';

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

  const token = localStorage.getItem('authToken');

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPassword = async (credentialId) => {
    setError(null);
    if (decryptedPasswords[credentialId]) {
      // Si la contraseña está visible, ocultarla
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

  return (
    <div>
      <h1>Bienvenido al Dashboard</h1>
      <p>Contenido protegido solo para usuarios autenticados.</p>
      <button
        onClick={handleFetchCredentials}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Buscar
      </button>
      <button
        onClick={toggleCreateForm}
        className="mt-4 ml-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
      >
        Crear
      </button>
      <button
        onClick={handleLogout}
        className="mt-4 ml-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
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
              type="password"
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
 
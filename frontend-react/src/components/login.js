import React, { useState } from 'react';

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!mfaRequired) {
      // Paso 1: enviar usuario y contraseña
      try {
        const response = await fetch('http://localhost:8000/api/token/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error('Error en la autenticación');
        }

        const data = await response.json();

        if (data.mfa_required) {
          setMfaRequired(true);
          setToken(data.access); // Guardar token temporal para verificar MFA
        } else {
          localStorage.setItem('authToken', data.access);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setError(error.message);
      }
    } else {
      // Paso 2: verificar código MFA
      try {
        const response = await fetch('http://localhost:8000/api/mfa/verify/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ code: mfaCode }),
        });

        if (!response.ok) {
          throw new Error('Código MFA inválido');
        }

        // MFA verificado, guardar token y autenticar
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {!mfaRequired ? (
        <>
          <label className="block mb-4">
            <span className="text-gray-700">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block mb-6">
            <span className="text-gray-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </>
      ) : (
        <label className="block mb-6">
          <span className="text-gray-700">Código MFA</span>
          <input
            type="text"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      )}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      >
        {mfaRequired ? 'Verificar MFA' : 'Log In'}
      </button>
    </form>
  );
}

export default Login;

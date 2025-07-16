import React from 'react';

function DashboardHeader({ onFetch, onToggleCreate, onLogout, loading, showCreateForm }) {
  return (
    <div className="max-w-full mx-auto rounded-2xl shadow-xl bg-gray-900 p-8 mb-8">
      <h1 className="text-4xl font-bold text-gray-100 mb-4">Dashboard</h1>
      <p className="text-gray-400">Tus credenciales seguras y MFA</p>
      <div className="flex gap-3 mt-6 flex-wrap">
        <button
          onClick={onFetch}
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button
          onClick={onToggleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition shadow"
        >
          {showCreateForm ? 'Cerrar' : 'Crear'}
        </button>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;

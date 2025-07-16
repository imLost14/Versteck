import React from 'react';

function CredentialForm({
  isEditing,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 animate-fade-in space-y-5"
    >
      <h2 className="text-xl text-gray-100 font-semibold">
        {isEditing ? 'Editar Credencial' : 'Nueva Credencial'}
      </h2>
      <div>
        <label htmlFor="platform" className="block text-gray-400">
          Plataforma
        </label>
        <input
          type="text"
          id="platform"
          name="platform"
          value={formData.platform}
          onChange={onInputChange}
          required
          className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="username" className="block text-gray-400">
          Usuario
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-gray-400">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-gray-400">
          Contraseña
        </label>
        <input
          type="text"
          id="password"
          name="password"
          value={formData.password}
          onChange={onInputChange}
          required
          className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-3 py-2"
        />
      </div>
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg transition"
        >
          {isEditing ? 'Guardar' : 'Guardar Credencial'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default CredentialForm;

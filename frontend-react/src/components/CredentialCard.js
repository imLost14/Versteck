import React from 'react';
import { FaUser, FaEnvelope, FaLock, FaGlobe } from "react-icons/fa";

function CredentialCard({
  credential,
  decryptedPassword,
  isEditing,
  editData,
  onEditClick,
  onViewPassword,
  onDelete,
  onEditInputChange,
  onSaveEdit,
  onCancelEdit,
}) {
  return (
    <li
      className="bg-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col gap-3 animate-fade-in border border-gray-700 transition-transform hover:scale-105 hover:shadow-3xl"
    >
      {isEditing ? (
        <>
          <div className="flex flex-col gap-3 mb-4">
            <label className="text-gray-400">Plataforma</label>
            <input
              type="text"
              name="platform"
              value={editData.platform}
              onChange={onEditInputChange}
              className="border border-gray-700 bg-gray-800 text-gray-100 rounded px-4 py-3"
            />
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <label className="text-gray-400">Usuario</label>
            <input
              type="text"
              name="username"
              value={editData.username}
              onChange={onEditInputChange}
              className="border border-gray-700 bg-gray-800 text-gray-100 rounded px-4 py-3"
            />
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <label className="text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={onEditInputChange}
              className="border border-gray-700 bg-gray-800 text-gray-100 rounded px-4 py-3"
            />
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <label className="text-gray-400">Contraseña</label>
            <input
              type="text"
              name="password"
              value={editData.password}
              onChange={onEditInputChange}
              className="border border-gray-700 bg-gray-800 text-gray-100 rounded px-4 py-3"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => onSaveEdit(credential.id)}
              className="bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg"
            >
              Guardar
            </button>
            <button
              onClick={onCancelEdit}
              className="bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <FaGlobe className="text-blue-400 text-xl" />
            <span className="font-bold text-xl text-gray-100">{credential.platform}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <FaUser className="text-purple-400 text-lg" />
            <span className="text-gray-100 text-lg">{credential.username}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <FaEnvelope className="text-green-400 text-lg" />
            <span className="text-gray-100 text-lg">{credential.email}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <FaLock className="text-yellow-400 text-lg" />
            <span className="text-gray-100 text-lg">{decryptedPassword || '********'}</span>
            <button
              className="ml-3 bg-green-700 px-3 py-1 rounded hover:bg-green-600 text-sm"
              onClick={() => onViewPassword(credential.id)}
              aria-label={decryptedPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {decryptedPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-blue-700 px-5 py-2 rounded hover:bg-blue-600 text-sm"
              onClick={() => onEditClick(credential)}
            >
              Editar
            </button>
            <button
              className="bg-red-700 px-5 py-2 rounded hover:bg-red-600 text-sm"
              onClick={() => onDelete(credential.id)}
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default CredentialCard;

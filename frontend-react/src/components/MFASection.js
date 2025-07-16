import React from 'react';

function MFASection({
  mfaEnabled,
  mfaSetupQR,
  mfaSecret,
  mfaCode,
  showMfaSetup,
  mfaMessage,
  error,
  onSetupMfa,
  onVerifyMfa,
  onDisableMfa,
  onMfaCodeChange,
  onCancelMfaSetup,
}) {
  return (
    <div className="max-w-full mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl text-gray-100 font-semibold mb-3">Autenticación MFA</h2>
      {mfaEnabled ? (
        <div>
          <p className="text-green-400 mb-2">MFA está habilitado.</p>
          <button
            onClick={onDisableMfa}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition"
          >
            Deshabilitar MFA
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={onSetupMfa}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition mb-3"
          >
            Configurar MFA
          </button>
          {showMfaSetup && (
            <div className="mt-4">
              <p className="text-gray-300">Escanea este código QR:</p>
              <img
                src={`data:image/png;base64,${mfaSetupQR}`}
                alt="QR MFA"
                className="my-2 mx-auto rounded-lg shadow-lg max-w-xs"
              />
              <p className="text-gray-300">
                Código secreto:{' '}
                <span className="font-mono bg-gray-800 px-2 py-1 rounded">{mfaSecret}</span>
              </p>
              <input
                type="text"
                placeholder="Ingresa el código MFA"
                value={mfaCode}
                onChange={onMfaCodeChange}
                className="border border-gray-700 bg-gray-800 text-gray-100 rounded px-3 py-2 mt-2 w-full"
                aria-label="Código MFA"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={onVerifyMfa}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition"
                >
                  Verificar y Activar MFA
                </button>
                <button
                  onClick={onCancelMfaSetup}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {mfaMessage && <p className="text-green-400 mt-2">{mfaMessage}</p>}
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
}

export default MFASection;

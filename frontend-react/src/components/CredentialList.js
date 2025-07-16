import React from 'react';
import CredentialCard from './CredentialCard';

function CredentialList({
  credentials,
  decryptedPasswords,
  editCredentialId,
  editCredentialData,
  onEditClick,
  onViewPassword,
  onDelete,
  onEditInputChange,
  onSaveEdit,
  onCancelEdit,
}) {
  if (credentials.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-full mx-auto mt-8 px-4">
      {credentials.map((cred) => (
        <CredentialCard
          key={cred.id}
          credential={cred}
          decryptedPassword={decryptedPasswords[cred.id]}
          isEditing={editCredentialId === cred.id}
          editData={editCredentialData}
          onEditClick={onEditClick}
          onViewPassword={onViewPassword}
          onDelete={onDelete}
          onEditInputChange={onEditInputChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </ul>
  );
}

export default CredentialList;

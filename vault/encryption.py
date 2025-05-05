from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()  

def get_fernet():
    key = os.getenv('ENCRYPTION_KEY')
    if key is None:
        raise ValueError("ENCRYPTION_KEY no está configurada en el archivo .env")
    return Fernet(key.encode())

def encrypt_password(plain_password: str) -> bytes:
    f = get_fernet()
    return f.encrypt(plain_password.encode())

def decrypt_password(encrypted_password: bytes) -> str:
    f = get_fernet()
    return f.decrypt(encrypted_password).decode()

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from vault.encryption import encrypt_password, decrypt_password

# Create your models here.
class CustomUser(AbstractUser):
  mfa_enabled = models.BooleanField(default=False)
  mfa_secret = models.CharField(max_length=32, null=True, blank=True)

class Credential(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    platform = models.CharField(max_length=200)
    username = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    encrypted_password = models.BinaryField()

    def clean(self):
        if not self.username and not self.email:
            raise ValidationError("Debe proporcionarl al menos un username o email")

    def set_password(self, plain_password: str):
        self.encrypted_password = encrypt_password(plain_password)

    def get_password(self) -> str:
        return decrypt_password(self.encrypted_password)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)




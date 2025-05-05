from rest_framework import serializers
from .models import CustomUser, Credential

class UserSerializer( serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'mfa_enabled']

class CredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credential
        fields = ['id', 'platform', 'username', 'email', 'encrypted_password']

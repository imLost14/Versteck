from rest_framework import serializers
from .models import CustomUser, Credential

class UserSerializer( serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'mfa_enabled']

class CredentialSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Credential
        fields = ['id', 'platform', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        credential = Credential(**validated_data)
        credential.set_password(password)
        credential.save()
        return credential

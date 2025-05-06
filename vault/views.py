from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser, Credential
from .serializers import CredentialSerializer
import pyotp
import qrcode
from io import BytesIO
import base64


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = CustomUser.objects.get(username=request.data['username'])
        response.data['mfa_required'] = user.mfa_enabled
        return response

class SetupMFA(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.mfa_secret:
            user.mfa_secret = pyotp.random_base32()
            user.save()

        totp = pyotp.TOTP(user.mfa_secret)
        uri = totp.provisioning_uri(name=user.email, issuer_name="Password Vault")
        qr = qrcode.make(uri)

        buffered = BytesIO()
        qr.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()

        return Response({
            'qr_code': qr_base64,
            'secret': user.mfa_secret  # Para debug (no exponer en producción)
        })

class VerifyMFA(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        totp = pyotp.TOTP(user.mfa_secret)

        if totp.verify(code):
            return Response({'status': 'MFA verificado'})
        return Response({'error': 'Código inválido'}, status=400)

class CredentialAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CredentialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def get(self, request):
        credentials = Credential.objects.filter(user=request.user)
        serializer = CredentialSerializer(credentials, many=True)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            credential = Credential.objects.get(pk=pk, user=request.user)
        except Credential.DoesNotExist:
            return Response({'error': 'Credencial no encontrada'}, status=404)

        serializer = CredentialSerializer(credential, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            credential = Credential.objects.get(pk=pk, user=request.user)
        except Credential.DoesNotExist:
            return Response({'error': 'Credencial no encontrada'}, status=404)

        credential.delete()
        return Response(status=204)

class CredentialPasswordDecryptAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            credential = Credential.objects.get(pk=pk, user=request.user)
        except Credential.DoesNotExist:
            return Response({'error': 'Credential not found'}, status=404)

        decrypted_password = credential.get_password()
        return Response({'decrypted_password': decrypted_password})


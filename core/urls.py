from django.urls import path, include
from vault.views import CustomTokenObtainPairView, SetupMFA, VerifyMFA

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/mfa/setup/', SetupMFA.as_view(), name='setup-mfa'),
    path('api/mfa/verify/',  VerifyMFA.as_view(), name='verify-mfa'),
    path('', include('vault.urls')),
]

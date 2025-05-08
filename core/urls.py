from django.urls import path, include
from vault.views import CustomTokenObtainPairView, SetupMFA, VerifyMFA, UserDetailView

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/mfa/setup/', SetupMFA.as_view(), name='setup-mfa'),
    path('api/mfa/verify/',  VerifyMFA.as_view(), name='verify-mfa'),
    path('api/user/', UserDetailView.as_view(), name='user-detail'),
    path('', include('vault.urls')),
]

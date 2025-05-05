from django.urls import path
from .views import CredentialAPI, CredentialPasswordDecryptAPI

urlpatterns = [
    path('credentials/', CredentialAPI.as_view(), name='credentials'),
    path('credentials/<int:pk>/decrypt/', CredentialPasswordDecryptAPI.as_view(), name='credential-decrypt'),
]

from django.urls import path
from .views import CredentialAPI, dashboard_view, login_view

urlpatterns = [
    path('credentials/', CredentialAPI.as_view(), name='credentials'),
]

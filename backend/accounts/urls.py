from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .dashboard import DashboardStatsView

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("password-reset/", views.PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", views.PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("me/", views.MeView.as_view(), name="me"),
    path("dashboard/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("seeker-profile/", views.SeekerProfileView.as_view(), name="seeker-profile"),
    path("employer-profile/", views.EmployerProfileView.as_view(), name="employer-profile"),
]

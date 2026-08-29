from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from accounts.dashboard import AdminStatsView, DashboardStatsView
from accounts.views import EmployerProfileView, MeView, SeekerProfileView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/me/", MeView.as_view(), name="me-alias"),
    path("api/dashboard/", DashboardStatsView.as_view(), name="dashboard-stats-alias"),
    path("api/admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("api/seeker-profile/", SeekerProfileView.as_view(), name="seeker-profile-alias"),
    path("api/employer-profile/", EmployerProfileView.as_view(), name="employer-profile-alias"),
    path("api/", include("companies.urls")),
    path("api/", include("jobs.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

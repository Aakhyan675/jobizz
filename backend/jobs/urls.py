from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import JobApplicationViewSet, JobCategoryViewSet, JobViewSet, SavedJobViewSet

router = DefaultRouter()
router.register("categories", JobCategoryViewSet, basename="category")
router.register("jobs", JobViewSet, basename="job")
router.register("applications", JobApplicationViewSet, basename="application")
router.register("saved-jobs", SavedJobViewSet, basename="saved-job")

urlpatterns = [
    path("", include(router.urls)),
]

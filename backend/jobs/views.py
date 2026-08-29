from django.db.models import Count, F
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsEmployer, IsJobSeeker

from .filters import ApplicationFilter, JobFilter
from .models import Job, JobApplication, JobCategory, SavedJob
from .serializers import (
    JobApplicationSerializer,
    JobCategorySerializer,
    JobListSerializer,
    JobSerializer,
    SavedJobSerializer,
)


class JobCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class JobViewSet(viewsets.ModelViewSet):
    filterset_class = JobFilter
    search_fields = ("title", "description", "location", "company__name")
    ordering_fields = ("created_at", "salary_min", "salary_max", "views_count")
    ordering = ("-created_at",)

    def get_queryset(self):
        qs = Job.objects.select_related("company", "category", "created_by").annotate(
            applications_count=Count("applications")
        )
        user = self.request.user
        if self.action in ("list", "retrieve"):
            if user.is_authenticated and user.role == user.Role.EMPLOYER:
                mine = self.request.query_params.get("mine")
                if mine in ("1", "true", "True"):
                    return qs.filter(created_by=user)
            if self.action == "list":
                return qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return JobListSerializer
        return JobSerializer

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.IsAuthenticated(), IsEmployer()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsEmployer()]
        return [permissions.AllowAny()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user.is_authenticated:
            context["saved_job_ids"] = set(
                SavedJob.objects.filter(user=user).values_list("job_id", flat=True)
            )
            context["applied_job_ids"] = set(
                JobApplication.objects.filter(seeker=user).values_list("job_id", flat=True)
            )
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_published or (
            request.user.is_authenticated and instance.created_by_id == request.user.id
        ):
            Job.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
            instance.refresh_from_db(fields=["views_count"])
        else:
            self.permission_denied(request, message="This job is not published.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_update(self, serializer):
        job = self.get_object()
        if job.created_by_id != self.request.user.id:
            self.permission_denied(self.request, message="You can only edit your own jobs.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.created_by_id != self.request.user.id:
            self.permission_denied(self.request, message="You can only delete your own jobs.")
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsEmployer])
    def publish(self, request, pk=None):
        job = self.get_object()
        if job.created_by_id != request.user.id:
            self.permission_denied(request)
        job.is_published = True
        job.save(update_fields=["is_published"])
        return Response(JobSerializer(job, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsEmployer])
    def unpublish(self, request, pk=None):
        job = self.get_object()
        if job.created_by_id != request.user.id:
            self.permission_denied(request)
        job.is_published = False
        job.save(update_fields=["is_published"])
        return Response(JobSerializer(job, context=self.get_serializer_context()).data)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    filterset_class = ApplicationFilter
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsJobSeeker()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = JobApplication.objects.select_related("job", "job__company", "seeker")
        if user.role == user.Role.JOB_SEEKER:
            return qs.filter(seeker=user)
        if user.role == user.Role.EMPLOYER:
            return qs.filter(job__created_by=user)
        if user.is_staff or user.role == user.Role.ADMIN:
            return qs
        return qs.none()

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        if user.role == user.Role.EMPLOYER and instance.job.created_by_id != user.id:
            self.permission_denied(self.request)
        serializer.save()


class SavedJobViewSet(viewsets.ModelViewSet):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated, IsJobSeeker]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).select_related(
            "job", "job__company", "job__category"
        )

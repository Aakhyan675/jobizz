from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from accounts.models import EmployerProfile
from core.permissions import IsEmployer, IsOwnerOrReadOnly

from .models import Company
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.select_related("owner").all()
    serializer_class = CompanySerializer
    search_fields = ("name", "industry", "location")
    filterset_fields = ("industry", "location", "size")

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.IsAuthenticated(), IsEmployer()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsEmployer(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        company = serializer.save()
        profile, _ = EmployerProfile.objects.get_or_create(user=self.request.user)
        if profile.company_id is None:
            profile.company = company
            profile.save(update_fields=["company"])

    def perform_destroy(self, instance):
        if instance.jobs.exists():
            raise ValidationError("Cannot delete a company that still has jobs. Unpublish or delete jobs first.")
        instance.delete()

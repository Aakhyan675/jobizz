from django.utils.text import slugify
from rest_framework import serializers

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Company
        fields = (
            "id",
            "name",
            "slug",
            "logo",
            "website",
            "industry",
            "size",
            "location",
            "description",
            "owner",
            "owner_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "owner", "owner_email", "created_at", "updated_at")

    def create(self, validated_data):
        request = self.context["request"]
        name = validated_data["name"]
        base = slugify(name) or "company"
        slug = base
        i = 1
        while Company.objects.filter(slug=slug).exists():
            i += 1
            slug = f"{base}-{i}"
        return Company.objects.create(owner=request.user, slug=slug, **validated_data)

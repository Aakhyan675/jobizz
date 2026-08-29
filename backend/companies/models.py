from django.db import models

from core.validators import validate_image_file


class Company(models.Model):
    class Size(models.TextChoices):
        SIZE_1_10 = "1-10", "1-10"
        SIZE_11_50 = "11-50", "11-50"
        SIZE_51_200 = "51-200", "51-200"
        SIZE_201_500 = "201-500", "201-500"
        SIZE_500_PLUS = "500+", "500+"

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True, validators=[validate_image_file])
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=120, blank=True)
    size = models.CharField(max_length=20, choices=Size.choices, blank=True)
    location = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="owned_companies",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "companies"

    def __str__(self):
        return self.name

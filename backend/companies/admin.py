from django.contrib import admin

from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "industry", "location", "size", "owner", "created_at")
    search_fields = ("name", "industry", "location", "owner__email")
    list_filter = ("industry", "size")

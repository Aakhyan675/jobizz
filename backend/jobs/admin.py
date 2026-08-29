from django.contrib import admin

from .models import Job, JobApplication, JobCategory, SavedJob


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "job_type",
        "location",
        "is_published",
        "views_count",
        "created_at",
    )
    list_filter = ("job_type", "experience_level", "is_published", "category")
    search_fields = ("title", "company__name", "location")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "seeker", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("job__title", "seeker__email")


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "created_at")
    search_fields = ("user__email", "job__title")
